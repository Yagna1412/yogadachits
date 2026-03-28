import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cheque {
  chequeNo: string;
  bank: string;
  member: string;
  amount: number;
  status: string;
  dueDate?: string;
  chequeDate?: string;
  clearedDate?: string;
  bouncedDate?: string;
  reason?: string;
}

interface ChequeStat {
  count: number;
  amount: number;
}

@Component({
  selector: 'app-check-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './check-management.html',
  styleUrl: './check-management.scss',
})
export class CheckManagementComponent {
  activeTab: string = 'pending';
  searchTerm: string = '';
  selectedStatus: string = '';

  // Modal states
  showUpdateModal = false;
  showSuccessModal = false;
  selectedCheque: Cheque | null = null;
  
  // Form fields
  updateFormData = {
    newStatus: 'Cleared',
    date: '',
    remarks: '',
  };

  remarkCharCount = 0;
  maxRemarkChars = 300;
  previousStatus = '';
  newStatusValue = '';

  pendingStats: ChequeStat = { count: 4, amount: 60000 };
  clearedStats: ChequeStat = { count: 2, amount: 35000 };
  bouncedStats: ChequeStat = { count: 1, amount: 25000 };

  pendingCheques: Cheque[] = [
    {
      chequeNo: '456789',
      bank: 'HDFC Bank',
      member: 'Rajesh Kumar',
      amount: 35000,
      status: 'Pending',
      dueDate: 'Mar 19,2026',
    },
    {
      chequeNo: '123456',
      bank: 'SBI',
      member: 'Priya Sharma',
      amount: 35000,
      status: 'Pending',
      dueDate: 'Mar 19,2026',
    },
    {
      chequeNo: '789012',
      bank: 'ICICI Bank',
      member: 'Amit Patel',
      amount: 35000,
      status: 'Pending',
      dueDate: 'Mar 19,2026',
    },
    {
      chequeNo: '243454',
      bank: 'ICICI Bank',
      member: 'Sunita Devi',
      amount: 35000,
      status: 'Pending',
      dueDate: 'Mar 19,2026',
    },
  ];

  clearedCheques: Cheque[] = [
    {
      chequeNo: '456789',
      bank: 'HDFC Bank',
      member: 'Rajesh Kumar',
      amount: 35000,
      status: 'Cleared',
      chequeDate: 'Mar 19,2026',
      clearedDate: 'Mar 19,2026',
    },
    {
      chequeNo: '123456',
      bank: 'SBI',
      member: 'Priya Sharma',
      amount: 35000,
      status: 'Cleared',
      chequeDate: 'Mar 19,2026',
      clearedDate: 'Mar 19,2026',
    },
  ];

  bouncedCheques: Cheque[] = [
    {
      chequeNo: '456789',
      bank: 'HDFC Bank',
      member: 'Rajesh Kumar',
      amount: 35000,
      status: 'Bounced',
      bouncedDate: 'Mar 19,2026',
      reason: 'Insufficient funds',
    },
  ];

  filteredPendingCheques: Cheque[] = [];
  filteredClearedCheques: Cheque[] = [];
  filteredBouncedCheques: Cheque[] = [];

  constructor() {
    this.filteredPendingCheques = this.pendingCheques;
    this.filteredClearedCheques = this.clearedCheques;
    this.filteredBouncedCheques = this.bouncedCheques;
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.searchTerm = '';
    this.selectedStatus = '';
    this.filterCheques();
  }

  filterCheques(): void {
    const search = this.searchTerm.toLowerCase();

    if (this.activeTab === 'pending') {
      this.filteredPendingCheques = this.pendingCheques.filter((cheque) =>
        this.matchesFilter(cheque, search)
      );
    } else if (this.activeTab === 'cleared') {
      this.filteredClearedCheques = this.clearedCheques.filter((cheque) =>
        this.matchesFilter(cheque, search)
      );
    } else if (this.activeTab === 'bounced') {
      this.filteredBouncedCheques = this.bouncedCheques.filter((cheque) =>
        this.matchesFilter(cheque, search)
      );
    }
  }

  private matchesFilter(cheque: Cheque, search: string): boolean {
    const matchesSearch =
      !search ||
      cheque.chequeNo.toLowerCase().includes(search) ||
      cheque.bank.toLowerCase().includes(search) ||
      cheque.member.toLowerCase().includes(search);

    const matchesStatus = !this.selectedStatus || cheque.status === this.selectedStatus;

    return matchesSearch && matchesStatus;
  }

  formatCurrency(amount: number): string {
    return (
      '₹' +
      amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  }

  openUpdateModal(cheque: Cheque): void {
    this.selectedCheque = { ...cheque };
    this.previousStatus = cheque.status;
    this.updateFormData = {
      newStatus: 'Cleared',
      date: '',
      remarks: '',
    };
    this.remarkCharCount = 0;
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.selectedCheque = null;
    this.updateFormData = { newStatus: 'Cleared', date: '', remarks: '' };
    this.remarkCharCount = 0;
  }

  submitStatusUpdate(): void {
    if (!this.selectedCheque || !this.updateFormData.date) {
      return;
    }

    this.newStatusValue = this.updateFormData.newStatus;

    // Update the selected cheque
    this.selectedCheque.status = this.updateFormData.newStatus;
    if (this.updateFormData.newStatus === 'Cleared') {
      this.selectedCheque.clearedDate = this.updateFormData.date;
    } else if (this.updateFormData.newStatus === 'Bounced') {
      this.selectedCheque.bouncedDate = this.updateFormData.date;
      this.selectedCheque.reason = this.updateFormData.remarks;
    }

    // Update in the corresponding array
    const chequeIndex = this.pendingCheques.findIndex(
      (c) => c.chequeNo === this.selectedCheque!.chequeNo
    );
    if (chequeIndex !== -1) {
      this.pendingCheques[chequeIndex] = { ...this.selectedCheque };
    }

    this.showUpdateModal = false;
    this.showSuccessModal = true;

    setTimeout(() => {
      this.showSuccessModal = false;
      this.closeUpdateModal();
    }, 2000);
  }

  rePresentCheque(cheque: Cheque): void {
    alert(`Cheque ${cheque.chequeNo} has been queued for re-presentment!`);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.selectedCheque = null;
  }

  updateRemarks(value: string): void {
    this.updateFormData.remarks = value;
    this.remarkCharCount = value.length;
  }
}
