import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChequeService, ChequeResponse, ChequeSummary } from '../../service/cheque.service';

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
export class CheckManagementComponent implements OnInit {
  activeTab: string = 'pending';
  searchTerm: string = '';
  selectedStatus: string = '';

  isLoading = false;
  errorMessage = '';
  isUpdating = false;

  // Modal states
  showUpdateModal = false;
  showSuccessModal = false;
  selectedCheque: ChequeResponse | null = null;

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

  pendingStats: ChequeStat = { count: 0, amount: 0 };
  clearedStats: ChequeStat = { count: 0, amount: 0 };
  bouncedStats: ChequeStat = { count: 0, amount: 0 };

  pendingCheques: ChequeResponse[] = [];
  clearedCheques: ChequeResponse[] = [];
  bouncedCheques: ChequeResponse[] = [];

  filteredPendingCheques: ChequeResponse[] = [];
  filteredClearedCheques: ChequeResponse[] = [];
  filteredBouncedCheques: ChequeResponse[] = [];

  constructor(private chequeService: ChequeService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadSummary();
    this.loadPending();
    this.loadCleared();
    this.loadBounced();
  }

  private loadSummary(): void {
    this.chequeService.getSummary().subscribe({
      next: (res) => {
        if (res.data) {
          this.pendingStats = { count: res.data.pendingCount ?? 0, amount: res.data.pendingAmount ?? 0 };
          this.clearedStats = { count: res.data.clearedCount ?? 0, amount: res.data.clearedAmount ?? 0 };
          this.bouncedStats = { count: res.data.bouncedCount ?? 0, amount: res.data.bouncedAmount ?? 0 };
        }
      },
      error: () => {} // Summary failure is non-critical; counts will fall back to list lengths
    });
  }

  private loadPending(): void {
    this.chequeService.getPending().subscribe({
      next: (res) => {
        this.pendingCheques = res.data ?? [];
        // fallback stats from list if summary endpoint not available
        if (this.pendingStats.count === 0) {
          this.pendingStats.count = this.pendingCheques.length;
          this.pendingStats.amount = this.pendingCheques.reduce((s, c) => s + (c.amount ?? 0), 0);
        }
        this.filteredPendingCheques = [...this.pendingCheques];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load pending cheques.';
      }
    });
  }

  private loadCleared(): void {
    this.chequeService.getCleared().subscribe({
      next: (res) => {
        this.clearedCheques = res.data ?? [];
        if (this.clearedStats.count === 0) {
          this.clearedStats.count = this.clearedCheques.length;
          this.clearedStats.amount = this.clearedCheques.reduce((s, c) => s + (c.amount ?? 0), 0);
        }
        this.filteredClearedCheques = [...this.clearedCheques];
      },
      error: () => {}
    });
  }

  private loadBounced(): void {
    this.chequeService.getBounced().subscribe({
      next: (res) => {
        this.bouncedCheques = res.data ?? [];
        if (this.bouncedStats.count === 0) {
          this.bouncedStats.count = this.bouncedCheques.length;
          this.bouncedStats.amount = this.bouncedCheques.reduce((s, c) => s + (c.amount ?? 0), 0);
        }
        this.filteredBouncedCheques = [...this.bouncedCheques];
      },
      error: () => {}
    });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.searchTerm = '';
    this.selectedStatus = '';
    this.errorMessage = '';
    this.filterCheques();
  }

  filterCheques(): void {
    const search = this.searchTerm.toLowerCase();

    if (this.activeTab === 'pending') {
      this.filteredPendingCheques = this.pendingCheques.filter((c) => this.matchesFilter(c, search));
    } else if (this.activeTab === 'cleared') {
      this.filteredClearedCheques = this.clearedCheques.filter((c) => this.matchesFilter(c, search));
    } else if (this.activeTab === 'bounced') {
      this.filteredBouncedCheques = this.bouncedCheques.filter((c) => this.matchesFilter(c, search));
    }
  }

  private matchesFilter(cheque: ChequeResponse, search: string): boolean {
    const matchesSearch =
      !search ||
      (cheque.chequeNo ?? '').toLowerCase().includes(search) ||
      (cheque.bank ?? '').toLowerCase().includes(search) ||
      (cheque.member ?? '').toLowerCase().includes(search);

    const matchesStatus = !this.selectedStatus || cheque.status === this.selectedStatus;

    return matchesSearch && matchesStatus;
  }

  formatCurrency(amount: number): string {
    return '₹' + (amount ?? 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  openUpdateModal(cheque: ChequeResponse): void {
    this.selectedCheque = { ...cheque };
    this.previousStatus = cheque.status;
    this.updateFormData = { newStatus: 'Cleared', date: '', remarks: '' };
    this.remarkCharCount = 0;
    this.errorMessage = '';
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
      this.errorMessage = 'Please select a date before saving.';
      return;
    }

    this.isUpdating = true;
    this.errorMessage = '';
    this.newStatusValue = this.updateFormData.newStatus;
    const newStatus = this.updateFormData.newStatus.toUpperCase(); // API expects CLEARED / BOUNCED

    this.chequeService.updateStatus(this.selectedCheque.id, newStatus).subscribe({
      next: (res) => {
        this.isUpdating = false;
        // Reload fresh data from backend
        this.loadPending();
        this.loadCleared();
        this.loadBounced();
        this.loadSummary();
        this.showUpdateModal = false;
        this.showSuccessModal = true;
        setTimeout(() => { this.showSuccessModal = false; }, 2500);
      },
      error: () => {
        this.isUpdating = false;
        this.errorMessage = 'Failed to update cheque status. Please try again.';
      }
    });
  }

  rePresentCheque(cheque: ChequeResponse): void {
    // Re-present moves status back to PENDING
    this.chequeService.updateStatus(cheque.id, 'PENDING').subscribe({
      next: () => {
        this.loadPending();
        this.loadBounced();
        this.loadSummary();
      },
      error: () => {
        this.errorMessage = `Failed to re-present cheque #${cheque.chequeNo}.`;
      }
    });
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



