import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  BankAccountService,
  BankTransactionItem,
  BankTransactionForm
} from '../../service/bank-account.service';

@Component({
  selector: 'app-account-bank',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-bank.html',
  styleUrls: ['./account-bank.scss']
})
export class AccountBankComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  showDepositForm = false;
  showPaymentForm = false;
  searchTerm = '';
  activeTab = 'deposits';

  isLoadingDeposits = false;
  isLoadingPayments = false;
  isLoadingForm = false;
  isSavingDeposit = false;
  isSavingPayment = false;

  deposits: BankTransactionItem[] = [];
  payments: BankTransactionItem[] = [];
  filteredDeposits: BankTransactionItem[] = [];
  filteredPayments: BankTransactionItem[] = [];
  paginatedDeposits: BankTransactionItem[] = [];
  paginatedPayments: BankTransactionItem[] = [];
  newDeposit: BankTransactionForm = {};
  newPayment: BankTransactionForm = {};

  depositCurrentPage = 1;
  paymentCurrentPage = 1;
  pageSize = 10;
  depositTotalPages = 1;
  paymentTotalPages = 1;

  loadError = '';
  depositApiError = '';
  paymentApiError = '';
  successMessage = '';

  constructor(
    private bankAccountService: BankAccountService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      this.loadDeposits();
      this.loadPayments();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.closeDepositForm();
    this.closePaymentForm();
    this.successMessage = '';
  }

  openDepositForm(): void {
    this.activeTab = 'deposits';
    this.showDepositForm = true;
    this.showPaymentForm = false;
    this.depositApiError = '';
    this.successMessage = '';
    this.loadDepositFormDefaults();
  }

  closeDepositForm(): void {
    this.showDepositForm = false;
    this.newDeposit = {};
    this.depositApiError = '';
    this.isLoadingForm = false;
  }

  openPaymentForm(): void {
    this.activeTab = 'payments';
    this.showPaymentForm = true;
    this.showDepositForm = false;
    this.paymentApiError = '';
    this.successMessage = '';
    this.loadPaymentFormDefaults();
  }

  closePaymentForm(): void {
    this.showPaymentForm = false;
    this.newPayment = {};
    this.paymentApiError = '';
    this.isLoadingForm = false;
  }

  loadDeposits(): void {
    this.isLoadingDeposits = true;
    this.loadError = '';
    this.cdr.detectChanges();

    this.bankAccountService.getDeposits()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingDeposits = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res?.success === false) {
              this.loadError = res.message || '';
              this.deposits = [];
              this.filteredDeposits = [];
              this.paginatedDeposits = [];
            } else {
              this.deposits = res?.data || [];
              this.filterDeposits();
            }
            this.cdr.detectChanges();
          });
        }
      });
  }

  loadPayments(): void {
    this.isLoadingPayments = true;
    this.cdr.detectChanges();

    this.bankAccountService.getPayments()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingPayments = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res?.success === false) {
              this.payments = [];
              this.filteredPayments = [];
              this.paginatedPayments = [];
            } else {
              this.payments = res?.data || [];
              this.filterPayments();
            }
            this.cdr.detectChanges();
          });
        }
      });
  }

  loadDepositFormDefaults(): void {
    this.isLoadingForm = true;
    this.bankAccountService.getDepositFormDefaults()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingForm = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res?.success && res.data) {
              this.newDeposit = { ...res.data, voucherSeries: res.data.voucherSeries || 'BD' };
            } else {
              this.newDeposit = {
                voucherSeries: 'BD',
                bankAccount: 'HDFC-12345',
                bankName: 'HDFC Bank',
                transactionDate: this.today()
              };
            }
            this.cdr.detectChanges();
          });
        }
      });
  }

  loadPaymentFormDefaults(): void {
    this.isLoadingForm = true;
    this.bankAccountService.getPaymentFormDefaults()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingForm = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res?.success && res.data) {
              this.newPayment = { ...res.data, voucherSeries: res.data.voucherSeries || 'BP' };
            } else {
              this.newPayment = {
                voucherSeries: 'BP',
                bankAccount: 'HDFC-12345',
                bankName: 'HDFC Bank',
                transactionDate: this.today()
              };
            }
            this.cdr.detectChanges();
          });
        }
      });
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  filterDeposits(): void {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredDeposits = this.deposits.filter(d =>
      !q ||
      (d.transactionType && d.transactionType.toLowerCase().includes(q)) ||
      (d.voucherNo && d.voucherNo.toLowerCase().includes(q)) ||
      (d.bankName && d.bankName.toLowerCase().includes(q)) ||
      (d.bankAccount && d.bankAccount.toLowerCase().includes(q))
    );
    this.depositCurrentPage = 1;
    this.updateDepositPagination();
  }

  filterPayments(): void {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredPayments = this.payments.filter(p =>
      !q ||
      (p.transactionType && p.transactionType.toLowerCase().includes(q)) ||
      (p.voucherNo && p.voucherNo.toLowerCase().includes(q)) ||
      (p.bankName && p.bankName.toLowerCase().includes(q)) ||
      (p.bankAccount && p.bankAccount.toLowerCase().includes(q))
    );
    this.paymentCurrentPage = 1;
    this.updatePaymentPagination();
  }

  updateDepositPagination(): void {
    this.depositTotalPages = Math.ceil(this.filteredDeposits.length / this.pageSize) || 1;
    if (this.depositCurrentPage > this.depositTotalPages) {
      this.depositCurrentPage = this.depositTotalPages;
    }
    const startIndex = (this.depositCurrentPage - 1) * this.pageSize;
    this.paginatedDeposits = this.filteredDeposits.slice(startIndex, startIndex + this.pageSize);
  }

  updatePaymentPagination(): void {
    this.paymentTotalPages = Math.ceil(this.filteredPayments.length / this.pageSize) || 1;
    if (this.paymentCurrentPage > this.paymentTotalPages) {
      this.paymentCurrentPage = this.paymentTotalPages;
    }
    const startIndex = (this.paymentCurrentPage - 1) * this.pageSize;
    this.paginatedPayments = this.filteredPayments.slice(startIndex, startIndex + this.pageSize);
  }

  goToDepositPage(page: number): void {
    if (page >= 1 && page <= this.depositTotalPages) {
      this.depositCurrentPage = page;
      this.updateDepositPagination();
    }
  }

  goToPaymentPage(page: number): void {
    if (page >= 1 && page <= this.paymentTotalPages) {
      this.paymentCurrentPage = page;
      this.updatePaymentPagination();
    }
  }

  nextDepositPage(): void {
    this.goToDepositPage(this.depositCurrentPage + 1);
  }

  prevDepositPage(): void {
    this.goToDepositPage(this.depositCurrentPage - 1);
  }

  nextPaymentPage(): void {
    this.goToPaymentPage(this.paymentCurrentPage + 1);
  }

  prevPaymentPage(): void {
    this.goToPaymentPage(this.paymentCurrentPage - 1);
  }

  getDepositVisiblePages(): number[] {
    return this.getVisiblePages(this.depositCurrentPage, this.depositTotalPages);
  }

  getPaymentVisiblePages(): number[] {
    return this.getVisiblePages(this.paymentCurrentPage, this.paymentTotalPages);
  }

  private getVisiblePages(currentPage: number, totalPages: number): number[] {
    const pages: number[] = [];
    const maxVisible = 3;
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get depositPaginationEnd(): number {
    return Math.min(this.depositCurrentPage * this.pageSize, this.filteredDeposits.length);
  }

  get paymentPaginationEnd(): number {
    return Math.min(this.paymentCurrentPage * this.pageSize, this.filteredPayments.length);
  }

  saveDeposit(): void {
    const amt = Number(this.newDeposit.amount);
    if (!amt || isNaN(amt) || amt <= 0) {
      this.depositApiError = 'Please enter a valid amount.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.newDeposit.transactionDate) {
      this.depositApiError = 'Please enter the transaction date.';
      this.cdr.detectChanges();
      return;
    }

    this.isSavingDeposit = true;
    this.depositApiError = '';
    this.bankAccountService.saveDeposit(this.newDeposit)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isSavingDeposit = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res?.success !== true) {
              this.depositApiError = res?.message || 'Failed to save bank deposit.';
            } else {
              this.closeDepositForm();
              this.activeTab = 'deposits';
              this.successMessage = res?.message || 'Bank deposit saved successfully.';
              this.depositCurrentPage = 1;
              this.loadDeposits();
            }
            this.cdr.detectChanges();
          });
        }
      });
  }

  savePayment(): void {
    const amt = Number(this.newPayment.amount);
    if (!amt || isNaN(amt) || amt <= 0) {
      this.paymentApiError = 'Please enter a valid amount.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.newPayment.transactionDate) {
      this.paymentApiError = 'Please enter the transaction date.';
      this.cdr.detectChanges();
      return;
    }

    this.isSavingPayment = true;
    this.paymentApiError = '';
    this.bankAccountService.savePayment(this.newPayment)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isSavingPayment = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res?.success !== true) {
              this.paymentApiError = res?.message || 'Failed to save bank payment.';
            } else {
              this.closePaymentForm();
              this.activeTab = 'payments';
              this.successMessage = res?.message || 'Bank payment saved successfully.';
              this.paymentCurrentPage = 1;
              this.loadPayments();
            }
            this.cdr.detectChanges();
          });
        }
      });
  }
}
