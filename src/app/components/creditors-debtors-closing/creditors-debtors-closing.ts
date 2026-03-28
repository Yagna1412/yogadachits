import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Data models
export interface DebtorCreditor {
  groupName: string;
  ticketNumber: string;
  paidTo: string;
  transactionDate: string;
  amount: number;
  payable: number;
  paidAmount: number;
  balance: number;
  id?: string;
}

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
}

export interface Member {
  id: string;
  name: string;
  groupName: string;
  ticketNo: string;
  mobile: string;
  status: 'Active' | 'Inactive';
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
  // UI State
  showForm = false;
  closingType: 'debtor' | 'creditor' = 'debtor';
  searchTerm: string = '';
  searchGroup: string = '';
  searchDate: string = '';
  filterClosingType: string = '';

  // Form data
  newClosing: ClosingRequest = this.initClosing();

  errorMessage: string = '';
  successMessage: string = '';

  // Data arrays
  allMembers: Member[] = [
    {
      id: 'MEM001',
      name: 'Rajesh Kumar',
      groupName: 'Group A',
      ticketNo: '101',
      mobile: '9876543210',
      status: 'Active',
      payable: 50000,
      paid: 35000,
      balance: 15000
    },
    {
      id: 'MEM002',
      name: 'Priya Sharma',
      groupName: 'Group B',
      ticketNo: '202',
      mobile: '9876543211',
      status: 'Active',
      payable: 60000,
      paid: 45000,
      balance: 15000
    },
    {
      id: 'MEM003',
      name: 'Amit Patel',
      groupName: 'Group A',
      ticketNo: '102',
      mobile: '9876543212',
      status: 'Active',
      payable: 55000,
      paid: 40000,
      balance: 15000
    },
    {
      id: 'MEM004',
      name: 'Sunita Devi',
      groupName: 'Group C',
      ticketNo: '303',
      mobile: '9876543213',
      status: 'Active',
      payable: 45000,
      paid: 30000,
      balance: 15000
    },
    {
      id: 'MEM005',
      name: 'Vikram Singh',
      groupName: 'Group B',
      ticketNo: '203',
      mobile: '9876543214',
      status: 'Active',
      payable: 70000,
      paid: 50000,
      balance: 20000
    }
  ];

  debtorCreditorsHistory: DebtorCreditor[] = [
    {
      groupName: 'Group A',
      ticketNumber: '101',
      paidTo: 'Rajesh Kumar',
      transactionDate: '2026-02-28',
      amount: 5000,
      payable: 50000,
      paidAmount: 35000,
      balance: 15000,
      id: 'DC001'
    },
    {
      groupName: 'Group B',
      ticketNumber: '202',
      paidTo: 'Priya Sharma',
      transactionDate: '2026-02-27',
      amount: 8000,
      payable: 60000,
      paidAmount: 45000,
      balance: 15000,
      id: 'DC002'
    }
  ];

  closings: ClosingRequest[] = [];
  filteredClosings: ClosingRequest[] = [];
  filteredMembers: Member[] = [...this.allMembers];

  groups: string[] = ['Group A', 'Group B', 'Group C'];

  ngOnInit(): void {
    this.filteredMembers = [...this.allMembers];
    this.filterClosings();
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
      remarks: ''
    };
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
    this.filteredMembers = this.allMembers.filter(m => {
      const matchesSearch = !this.searchTerm ||
        m.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.ticketNo.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesGroup = !this.searchGroup || m.groupName === this.searchGroup;
      const matchesStatus = m.status === 'Active';

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }

  filterClosings(): void {
    this.filteredClosings = this.closings.filter(c => {
      const matchesSearch = !this.searchTerm ||
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
    this.newClosing.payable = member.payable;
    this.newClosing.paidAmount = member.paid;
    this.newClosing.balance = member.balance;
  }

  saveClosing(): void {
    // Validation
    if (!this.newClosing.member) {
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

    // Check if numeric
    if (isNaN(this.newClosing.closingBalance)) {
      this.errorMessage = 'Closing balance must be a valid number';
      return;
    }

    // Add to closings array
    const closing: ClosingRequest = {
      ...this.newClosing,
      closingBalance: Number(this.newClosing.closingBalance),
      id: 'CLG' + Date.now()
    };

    this.closings.unshift(closing);
    this.successMessage = 'Balance closed successfully';
    this.newClosing = this.initClosing();
    this.showForm = false;
    this.errorMessage = '';

    // Clear success message after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);

    this.filterClosings();
  }

  deleteClosing(id: string): void {
    if (confirm('Are you sure you want to delete this closing record?')) {
      this.closings = this.closings.filter(c => c.id !== id);
      this.filterClosings();
    }
  }

  getTotalDebtors(): number {
    return this.closings.filter(c => c.debtorCreditorType === 'Debtor').length;
  }

  getTotalCreditors(): number {
    return this.closings.filter(c => c.debtorCreditorType === 'Creditor').length;
  }

  getTotalClosingAmount(): number {
    return this.filteredClosings.reduce((sum, c) => sum + c.closingBalance, 0);
  }

  exportToCSV(): void {
    const headers = ['Member', 'Group', 'Ticket No', 'Closing Date', 'Closing Balance', 'Type', 'Authorized By'];
    const data = this.filteredClosings.map(c => [
      c.member,
      c.groupName,
      c.ticketNumber,
      c.closingDate,
      c.closingBalance,
      c.debtorCreditorType,
      c.authorizedBy
    ]);

    let csv = headers.join(',') + '\n';
    data.forEach(row => {
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
