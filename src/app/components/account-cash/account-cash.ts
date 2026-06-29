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
  CashAccountService,
  CashTransactionItem,
  CashTransactionForm
} from '../../service/cash-account.service';

@Component({
  selector: 'app-account-cash',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-cash.html',
  styleUrls: ['./account-cash.scss']
})
export class AccountCashComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  showReceiptForm = false;
  showPaymentForm = false;
  searchTerm = '';
  activeTab = 'receipts';

  isLoadingReceipts = false;
  isLoadingPayments = false;
  isLoadingForm = false;
  isSavingReceipt = false;
  isSavingPayment = false;

  receipts: CashTransactionItem[] = [];
  payments: CashTransactionItem[] = [];
  filteredReceipts: CashTransactionItem[] = [];
  filteredPayments: CashTransactionItem[] = [];
  newReceipt: CashTransactionForm = {};
  newPayment: CashTransactionForm = {};

  loadError = '';
  apiError = '';
  successMessage = '';

  constructor(
    private cashAccountService: CashAccountService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      this.loadReceipts();
      this.loadPayments();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.showReceiptForm = false;
    this.showPaymentForm = false;
    this.apiError = '';
    this.successMessage = '';
  }

  toggleReceiptForm(): void {
    this.showReceiptForm = !this.showReceiptForm;
    if (this.showReceiptForm) {
      this.apiError = '';
      this.loadReceiptFormDefaults();
    }
  }

  togglePaymentForm(): void {
    this.showPaymentForm = !this.showPaymentForm;
    if (this.showPaymentForm) {
      this.apiError = '';
      this.loadPaymentFormDefaults();
    }
  }

  loadReceipts(): void {
    this.isLoadingReceipts = true;
    this.loadError = '';
    this.cdr.detectChanges();

    this.cashAccountService.getReceipts()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingReceipts = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.receipts = res?.success !== false ? (res?.data || []) : [];
            this.filterReceipts();
            if (res?.success === false) this.loadError = res.message || '';
            this.cdr.detectChanges();
          });
        }
      });
  }

  loadPayments(): void {
    this.isLoadingPayments = true;
    this.cdr.detectChanges();

    this.cashAccountService.getPayments()
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
            this.payments = res?.success !== false ? (res?.data || []) : [];
            this.filterPayments();
            this.cdr.detectChanges();
          });
        }
      });
  }

  loadReceiptFormDefaults(): void {
    this.isLoadingForm = true;
    this.cashAccountService.getReceiptFormDefaults()
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
              this.newReceipt = { ...res.data, voucherSeries: res.data.voucherSeries || 'CR' };
            } else {
              this.newReceipt = { voucherSeries: 'CR', account: 'Cash Account', transactionDate: this.today() };
            }
            this.cdr.detectChanges();
          });
        }
      });
  }

  loadPaymentFormDefaults(): void {
    this.isLoadingForm = true;
    this.cashAccountService.getPaymentFormDefaults()
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
              this.newPayment = { ...res.data, voucherSeries: res.data.voucherSeries || 'CP' };
            } else {
              this.newPayment = { voucherSeries: 'CP', account: 'Cash Account', transactionDate: this.today() };
            }
            this.cdr.detectChanges();
          });
        }
      });
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  filterReceipts(): void {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredReceipts = this.receipts.filter(r =>
      !q ||
      (r.transactionType && r.transactionType.toLowerCase().includes(q)) ||
      (r.voucherNo && r.voucherNo.toLowerCase().includes(q)) ||
      (r.particularAccount && r.particularAccount.toLowerCase().includes(q))
    );
  }

  filterPayments(): void {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredPayments = this.payments.filter(p =>
      !q ||
      (p.transactionType && p.transactionType.toLowerCase().includes(q)) ||
      (p.voucherNo && p.voucherNo.toLowerCase().includes(q)) ||
      (p.particularAccount && p.particularAccount.toLowerCase().includes(q))
    );
  }

  saveReceipt(): void {
    const amt = Number(this.newReceipt.amount);
    if (!amt || isNaN(amt) || amt <= 0) {
      this.apiError = 'Please enter a valid amount.';
      return;
    }
    if (!this.newReceipt.transactionDate) {
      this.apiError = 'Please enter the transaction date.';
      return;
    }

    this.isSavingReceipt = true;
    this.apiError = '';
    this.cashAccountService.saveReceipt(this.newReceipt)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isSavingReceipt = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (!res?.success) {
              this.apiError = res?.message || 'Failed to save cash receipt.';
            } else {
              this.showReceiptForm = false;
              this.newReceipt = {};
              this.activeTab = 'receipts';
              this.successMessage = res?.message || 'Cash receipt saved successfully.';
              this.loadReceipts();
              this.loadPayments();
            }
            this.cdr.detectChanges();
          });
        }
      });
  }

  savePayment(): void {
    const amt = Number(this.newPayment.amount);
    if (!amt || isNaN(amt) || amt <= 0) {
      this.apiError = 'Please enter a valid amount.';
      return;
    }
    if (!this.newPayment.transactionDate) {
      this.apiError = 'Please enter the transaction date.';
      return;
    }

    this.isSavingPayment = true;
    this.apiError = '';
    this.cashAccountService.savePayment(this.newPayment)
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
            if (!res?.success) {
              this.apiError = res?.message || 'Failed to save cash payment.';
            } else {
              this.showPaymentForm = false;
              this.newPayment = {};
              this.activeTab = 'payments';
              this.successMessage = res?.message || 'Cash payment saved successfully.';
              this.loadReceipts();
              this.loadPayments();
            }
            this.cdr.detectChanges();
          });
        }
      });
  }
}
