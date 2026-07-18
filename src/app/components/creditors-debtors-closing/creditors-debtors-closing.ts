import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ClosingMemberDto,
  ClosingRequestDto,
  CreditorDebtorClosingService
} from '../../service/credit-debtor-closing.service';

export interface ClosingRequest {
  groupName: string;
  ticketNumber: string;
  member: string;
  closingBalance: number;
  closingDate: string;
  debtorCreditorType: 'Debtor' | 'Creditor';
  authorizedBy: string;
  remarks: string;
  payable?: number;
  paidAmount?: number;
  balance?: number;
  id?: string;
  subscriberId?: number;
}

export interface Member {
  id: string;
  subscriberId: number;
  enrollmentId?: number;
  name: string;
  groupName: string;
  ticketNo: string;
  mobile: string;
  status: 'Active' | 'Inactive' | string;
  payable: number;
  paid: number;
  balance: number;
}

@Component({
  selector: 'app-creditors-debtors-closing',
  imports: [CommonModule, FormsModule],
  templateUrl: './creditors-debtors-closing.html',
  styleUrls: ['./creditors-debtors-closing.scss'],
  standalone: true
})
export class CreditorsDebtorsClosingComponent implements OnInit {
  showForm = false;
  closingType: 'debtor' | 'creditor' = 'debtor';
  searchTerm = '';
  searchGroup = '';
  searchDate = '';
  filterClosingType = '';
  isLoading = false;
  isSaving = false;

  newClosing: ClosingRequest = this.initClosing();
  errorMessage = '';
  successMessage = '';

  allMembers: Member[] = [];
  closings: ClosingRequest[] = [];
  filteredClosings: ClosingRequest[] = [];
  filteredMembers: Member[] = [];
  groups: string[] = [];

  constructor(private closingService: CreditorDebtorClosingService) {}

  ngOnInit(): void {
    this.loadMembers();
    this.loadHistory();
  }

  private tenantId(): number {
    return Number(localStorage.getItem('tenantId') || '1');
  }

  loadMembers(): void {
    this.isLoading = true;
    this.closingService.getMembers(this.tenantId(), this.searchGroup || undefined).subscribe({
      next: (rows) => {
        this.allMembers = (rows || []).map((m: ClosingMemberDto) => this.mapMember(m));
        this.groups = Array.from(new Set(this.allMembers.map((m) => m.groupName).filter(Boolean))).sort();
        this.filterMembers();
        this.isLoading = false;
      },
      error: (err) => {
        this.allMembers = [];
        this.filteredMembers = [];
        this.errorMessage = err?.error?.message || 'Unable to load members.';
        this.isLoading = false;
      }
    });
  }

  loadHistory(): void {
    this.closingService.getHistory(this.tenantId()).subscribe({
      next: (rows) => {
        this.closings = (rows || []).map((c: ClosingRequestDto) => ({
          id: c.id != null ? String(c.id) : undefined,
          subscriberId: c.subscriberId,
          groupName: c.groupName || '',
          ticketNumber: c.ticketNumber || '',
          member: c.member || '',
          closingBalance: Number(c.closingBalance || 0),
          closingDate: c.closingDate || '',
          debtorCreditorType: (c.debtorCreditorType as 'Debtor' | 'Creditor') || 'Debtor',
          authorizedBy: c.authorizedBy || '',
          remarks: c.remarks || '',
          payable: c.payable != null ? Number(c.payable) : undefined,
          paidAmount: c.paidAmount != null ? Number(c.paidAmount) : undefined,
          balance: c.balance != null ? Number(c.balance) : undefined
        }));
        this.filterClosings();
      },
      error: (err) => {
        this.closings = [];
        this.filteredClosings = [];
        this.errorMessage = err?.error?.message || 'Unable to load closing history.';
      }
    });
  }

  private mapMember(m: ClosingMemberDto): Member {
    return {
      id: String(m.subscriberId),
      subscriberId: m.subscriberId,
      enrollmentId: m.enrollmentId,
      name: m.name,
      groupName: m.groupName,
      ticketNo: m.ticketNo,
      mobile: m.mobile || '',
      status: m.status || 'Active',
      payable: Number(m.payable || 0),
      paid: Number(m.paid || 0),
      balance: Number(m.balance || 0)
    };
  }

  initClosing(): ClosingRequest {
    return {
      groupName: '',
      ticketNumber: '',
      member: '',
      closingBalance: 0,
      closingDate: this.getCurrentDate(),
      debtorCreditorType: 'Debtor',
      authorizedBy: '',
      remarks: '',
      subscriberId: undefined
    };
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.newClosing = this.initClosing();
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  setClosingType(type: 'debtor' | 'creditor'): void {
    this.closingType = type;
    this.newClosing.debtorCreditorType = type === 'debtor' ? 'Debtor' : 'Creditor';
    this.filterClosings();
  }

  filterMembers(): void {
    this.filteredMembers = this.allMembers.filter((m) => {
      const matchesSearch =
        !this.searchTerm ||
        m.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.ticketNo.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesGroup = !this.searchGroup || m.groupName === this.searchGroup;
      const matchesStatus = !m.status || m.status.toLowerCase() === 'active';
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }

  onGroupFilterChange(): void {
    this.loadMembers();
    this.filterClosings();
  }

  filterClosings(): void {
    this.filteredClosings = this.closings.filter((c) => {
      const matchesSearch =
        !this.searchTerm ||
        c.member.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.ticketNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.groupName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesGroup = !this.searchGroup || c.groupName === this.searchGroup;
      const matchesDate = !this.searchDate || c.closingDate === this.searchDate;
      const matchesType = !this.filterClosingType || c.debtorCreditorType === this.filterClosingType;
      return matchesSearch && matchesGroup && matchesDate && matchesType;
    });
  }

  selectMember(member: Member): void {
    this.newClosing.member = member.name;
    this.newClosing.groupName = member.groupName;
    this.newClosing.ticketNumber = member.ticketNo;
    this.newClosing.subscriberId = member.subscriberId;
    this.newClosing.payable = member.payable;
    this.newClosing.paidAmount = member.paid;
    this.newClosing.balance = member.balance;
    if (!this.newClosing.closingBalance) {
      this.newClosing.closingBalance = member.balance;
    }
  }

  saveClosing(): void {
    if (!this.newClosing.member || !this.newClosing.subscriberId) {
      this.errorMessage = 'Please select a member';
      return;
    }
    if (!this.newClosing.closingBalance || this.newClosing.closingBalance === 0) {
      this.errorMessage = 'Closing balance must be numeric and greater than 0';
      return;
    }
    if (!this.newClosing.authorizedBy) {
      this.errorMessage = 'Authorized by field is required';
      return;
    }
    if (isNaN(Number(this.newClosing.closingBalance))) {
      this.errorMessage = 'Closing balance must be a valid number';
      return;
    }

    const payload: ClosingRequestDto = {
      subscriberId: this.newClosing.subscriberId,
      groupName: this.newClosing.groupName,
      ticketNumber: this.newClosing.ticketNumber,
      member: this.newClosing.member,
      closingBalance: Number(this.newClosing.closingBalance),
      closingDate: this.newClosing.closingDate,
      debtorCreditorType: this.newClosing.debtorCreditorType,
      authorizedBy: this.newClosing.authorizedBy,
      remarks: this.newClosing.remarks,
      payable: this.newClosing.payable,
      paidAmount: this.newClosing.paidAmount,
      balance: this.newClosing.balance
    };

    this.isSaving = true;
    this.errorMessage = '';
    this.closingService.saveClosing(this.tenantId(), payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Balance closed successfully';
        this.newClosing = this.initClosing();
        this.showForm = false;
        this.loadHistory();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || 'Unable to save closing.';
      }
    });
  }

  deleteClosing(id: string): void {
    if (!id) {
      return;
    }
    if (!confirm('Are you sure you want to delete this closing record?')) {
      return;
    }
    this.closingService.deleteClosing(this.tenantId(), id).subscribe({
      next: () => this.loadHistory(),
      error: (err) => {
        this.errorMessage =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || 'Unable to delete closing.';
      }
    });
  }

  /** Historical table derived from saved closings (replaces former mock list). */
  get debtorCreditorsHistory(): Array<{
    groupName: string;
    ticketNumber: string;
    paidTo: string;
    transactionDate: string;
    amount: number;
    payable: number;
    paidAmount: number;
    balance: number;
    id?: string;
  }> {
    return this.closings.map((c) => ({
      id: c.id,
      groupName: c.groupName,
      ticketNumber: c.ticketNumber,
      paidTo: c.member,
      transactionDate: c.closingDate,
      amount: Number(c.closingBalance || 0),
      payable: Number(c.payable || 0),
      paidAmount: Number(c.paidAmount || 0),
      balance: Number(c.balance || 0)
    }));
  }

  getTotalDebtors(): number {
    return this.closings.filter((c) => c.debtorCreditorType === 'Debtor').length;
  }

  getTotalCreditors(): number {
    return this.closings.filter((c) => c.debtorCreditorType === 'Creditor').length;
  }

  getTotalClosingAmount(): number {
    return this.filteredClosings.reduce((sum, c) => sum + Number(c.closingBalance || 0), 0);
  }

  exportToCSV(): void {
    const headers = ['Member', 'Group', 'Ticket No', 'Closing Date', 'Closing Balance', 'Type', 'Authorized By'];
    const data = this.filteredClosings.map((c) => [
      c.member,
      c.groupName,
      c.ticketNumber,
      c.closingDate,
      c.closingBalance,
      c.debtorCreditorType,
      c.authorizedBy
    ]);

    let csv = headers.join(',') + '\n';
    data.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `creditors-debtors-closing-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
