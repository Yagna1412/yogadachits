import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import {
  BidPaymentsService,
  BidPaymentListItem,
  BidPaymentFormDetails,
  BidPaymentSaveRequest,
  EligibleAuctionOption
} from '../../service/bid-payment.service';

@Component({
  selector: 'app-bid-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bid-payments.html',
  styleUrls: ['./bid-payments.scss']
})
export class BidPaymentsComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  showForm = false;
  searchTerm = '';
  isLoadingTable = false;
  isSaving = false;
  submitted = false;

  payments: BidPaymentListItem[] = [];
  filteredPayments: BidPaymentListItem[] = [];
  paginatedPayments: BidPaymentListItem[] = [];
  newPayment: Partial<BidPaymentFormDetails> = {};

  completedAuctions: EligibleAuctionOption[] = [];
  pendingAuctions: EligibleAuctionOption[] = [];
  disbursedAuctions: EligibleAuctionOption[] = [];
  selectedAuctionId: number | null = null;
  isLoadingForm = false;
  isLoadingAuctions = false;

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  apiError = '';
  successMessage = '';
  loadError = '';
  fieldErrors: Record<string, string> = {};

  constructor(
    private bidPaymentService: BidPaymentsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      this.loadData();
      this.loadEligibleAuctions();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.resetFormState();
      setTimeout(() => this.loadEligibleAuctions(), 0);
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.resetFormState();
  }

  dismissApiError(): void {
    this.apiError = '';
  }

  private resetFormState(): void {
    this.newPayment = {};
    this.selectedAuctionId = null;
    this.apiError = '';
    this.successMessage = '';
    this.fieldErrors = {};
    this.submitted = false;
  }

  loadData(): void {
    this.isLoadingTable = true;
    this.loadError = '';

    this.bidPaymentService.getPayments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.isLoadingTable = false;
            if (res?.success === false) {
              this.loadError = res.message || 'Unable to load bid payments.';
              this.payments = [];
              this.filteredPayments = [];
              this.paginatedPayments = [];
            } else {
              this.payments = res?.data || [];
              this.filterPayments();
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.isLoadingTable = false;
            this.loadError = this.extractErrorMessage(err, 'Unable to load bid payments.');
            this.payments = [];
            this.filteredPayments = [];
            this.paginatedPayments = [];
            this.cdr.detectChanges();
          });
        }
      });
  }

  loadEligibleAuctions(): void {
    this.isLoadingAuctions = true;
    this.cdr.detectChanges();

    this.bidPaymentService.getEligibleAuctions()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingAuctions = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            const items = res?.success !== false && Array.isArray(res?.data) ? res.data : [];
            if (res?.success === false) {
              this.apiError = res.message || 'Unable to load completed auctions.';
            }
            this.completedAuctions = items;
            this.pendingAuctions = items.filter(a => !a.alreadyDisbursed);
            this.disbursedAuctions = items.filter(a => a.alreadyDisbursed);
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.apiError = this.extractErrorMessage(err, 'Unable to load completed auctions.');
            this.completedAuctions = [];
            this.pendingAuctions = [];
            this.disbursedAuctions = [];
            this.cdr.detectChanges();
          });
        }
      });
  }

  filterPayments(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPayments = [...this.payments];
    } else {
      const lower = this.searchTerm.trim().toLowerCase();
      this.filteredPayments = this.payments.filter(p =>
        (p.groupName && p.groupName.toLowerCase().includes(lower)) ||
        (p.paidTo && p.paidTo.toLowerCase().includes(lower)) ||
        (p.ticketNo && p.ticketNo.toLowerCase().includes(lower)) ||
        (p.series && p.series.toLowerCase().includes(lower)) ||
        (p.narration && p.narration.toLowerCase().includes(lower)) ||
        (p.account && p.account.toLowerCase().includes(lower)) ||
        (p.no && String(p.no).toLowerCase().includes(lower))
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPayments.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedPayments = this.filteredPayments.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 3;
    let start = Math.max(1, this.currentPage - 1);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get paginationEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPayments.length);
  }

  onAuctionSelect(): void {
    this.apiError = '';
    this.fieldErrors = {};

    if (!this.selectedAuctionId) {
      this.newPayment = {};
      return;
    }

    const selected = this.completedAuctions.find(a => a.id === this.selectedAuctionId);
    if (selected?.alreadyDisbursed) {
      this.apiError = 'This auction has already been disbursed. Please select another winner.';
      this.selectedAuctionId = null;
      this.newPayment = {};
      return;
    }

    this.isLoadingForm = true;
    this.bidPaymentService.getBidPaymentDetails(this.selectedAuctionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.isLoadingForm = false;
            if (res?.success && res.data) {
              this.newPayment = {
                ...res.data,
                account: res.data.account || 'cash',
                transactionDate: this.formatDateForInput(res.data.transactionDate) || this.todayDate(),
                bpAdjustment: res.data.bpAdjustment ?? 0,
                advanceAdjustment: res.data.advanceAdjustment ?? 0
              };
            } else {
              this.apiError = res?.message || 'Unable to load auction details.';
              this.selectedAuctionId = null;
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.isLoadingForm = false;
            this.apiError = this.extractErrorMessage(err, 'Unable to load auction details.');
            this.selectedAuctionId = null;
            this.cdr.detectChanges();
          });
        }
      });
  }

  hasError(field: string): boolean {
    return this.submitted && !!this.fieldErrors[field];
  }

  getError(field: string): string {
    return this.fieldErrors[field] || '';
  }

  private validateForm(): boolean {
    this.fieldErrors = {};

    if (!this.selectedAuctionId) {
      this.apiError = 'Please select a completed auction to disburse.';
      return false;
    }

    if (!this.newPayment.transactionDate) {
      this.fieldErrors['transactionDate'] = 'Please select the transaction date.';
    }

    const amt = parseFloat(String(this.newPayment.amount));
    if (this.newPayment.amount === null || this.newPayment.amount === undefined || isNaN(amt)) {
      this.fieldErrors['amount'] = 'Please enter a valid final paid amount.';
    }

    if (!this.newPayment.account) {
      this.newPayment.account = 'cash';
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  savePayment(): void {
    this.submitted = true;
    this.apiError = '';
    this.successMessage = '';

    if (!this.validateForm()) {
      this.cdr.detectChanges();
      return;
    }

    const payload = this.buildSavePayload();

    this.isSaving = true;
    this.bidPaymentService.processPayment(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res?.success) {
              this.successMessage = res.message || 'Bid payment disbursed successfully.';
              this.loadData();
              this.loadEligibleAuctions();
              setTimeout(() => this.closeForm(), 1500);
            } else {
              this.apiError = res?.message || 'Unable to save bid payment.';
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.apiError = this.extractErrorMessage(err, 'Unable to save bid payment. Please verify the details.');
            this.cdr.detectChanges();
          });
        }
      });
  }

  private buildSavePayload(): BidPaymentSaveRequest {
    return {
      auctionId: this.selectedAuctionId!,
      enrollmentId: this.newPayment.enrollmentId,
      subscriberId: this.newPayment.subscriberId,
      groupName: this.newPayment.groupName,
      ticketNo: this.newPayment.ticketNo,
      paidTo: this.newPayment.paidTo,
      series: this.newPayment.series,
      currentInstallment: this.newPayment.currentInstallment,
      installmentMonth: this.newPayment.installmentMonth,
      chitAmount: this.newPayment.chitAmount,
      companyCommission: this.newPayment.companyCommission,
      bidAmount: this.newPayment.bidAmount,
      bidPayable: this.newPayment.bidPayable,
      netPayable: this.newPayment.netPayable,
      transactionDate: this.formatDateForInput(this.newPayment.transactionDate)!,
      account: this.newPayment.account || 'cash',
      amount: parseFloat(String(this.newPayment.amount)),
      narration: this.newPayment.narration || '',
      chequeNumber: this.newPayment.chequeNumber || undefined,
      chequeDate: this.newPayment.chequeDate ? this.formatDateForInput(this.newPayment.chequeDate) : null,
      bpAdjustment: parseFloat(String(this.newPayment.bpAdjustment)) || 0,
      advanceAdjustment: parseFloat(String(this.newPayment.advanceAdjustment)) || 0
    };
  }

  private todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private formatDateForInput(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().split('T')[0];
  }

  private extractErrorMessage(err: any, fallback: string): string {
    if (err?.error?.message) {
      return err.error.message;
    }
    if (typeof err?.error === 'string') {
      return err.error;
    }
    return fallback;
  }
}
