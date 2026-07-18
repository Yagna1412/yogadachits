import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RemovalPaymentService } from '../../service/removal-payment.service';

@Component({
  selector: 'app-payments-removal-members',
  imports: [CommonModule, FormsModule],
  templateUrl: './payments-removal-members.html',
  styleUrls: ['./payments-removal-members.scss']
})
export class PaymentsRemovalMembersComponent implements OnInit {
  showForm = false;
  searchTerm = '';
  isLoading = false;
  isSaving = false;
  loadError = '';

  payments: any[] = [];
  filteredPayments: any[] = [];
  newPayment: any = {};

  constructor(private removalPaymentService: RemovalPaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  private tenantId(): number {
    return Number(localStorage.getItem('tenantId') || '1');
  }

  loadPayments(): void {
    this.isLoading = true;
    this.loadError = '';
    this.removalPaymentService.getPayments().subscribe({
      next: (rows) => {
        this.payments = (rows || []).map((p) => ({
          ...p,
          id: p.payoutId ?? p.id,
          paidAmount: p.paidAmount ?? p.netPayable,
          netPayable: p.netPayable ?? p.paidAmount
        }));
        this.filterPayments();
        this.isLoading = false;
      },
      error: (err) => {
        this.payments = [];
        this.filteredPayments = [];
        this.loadError = err?.error?.message || 'Unable to load removal payments.';
        this.isLoading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  filterPayments() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredPayments = this.payments.filter((p) => {
      return (
        !q ||
        (p.groupName && p.groupName.toLowerCase().includes(q)) ||
        (p.ticketNo && String(p.ticketNo).toLowerCase().includes(q)) ||
        (p.paidTo && p.paidTo.toLowerCase().includes(q))
      );
    });
  }

  savePayment() {
    const amt = parseFloat(this.newPayment.amount) || 0;
    if (!amt || isNaN(amt)) {
      alert('Amount numeric');
      return;
    }

    const includingCharges = parseFloat(this.newPayment.includingCharges) || 0;
    const postageDue = parseFloat(this.newPayment.postageDue) || 0;
    const boc = parseFloat(this.newPayment.boc) || 0;
    const forfeited = parseFloat(this.newPayment.forfeited) || 0;
    const companyCommission = parseFloat(this.newPayment.companyCommission) || 0;
    const subscriptionPaid = parseFloat(this.newPayment.subscriptionPaid) || 0;
    const stampsOther = parseFloat(this.newPayment.stampsOther) || 0;
    const rectificationAdjustment = parseFloat(this.newPayment.rectificationAdjustment) || 0;
    const netPayable =
      amt -
      (includingCharges +
        postageDue +
        boc +
        forfeited +
        companyCommission +
        subscriptionPaid +
        stampsOther +
        rectificationAdjustment);

    const payload = {
      tenantId: this.tenantId(),
      groupName: this.newPayment.groupName || '',
      ticketNo: this.newPayment.ticketNo || '',
      paidTo: this.newPayment.paidTo || '',
      transactionDate: this.newPayment.transactionDate || '',
      account: this.newPayment.account || '',
      chequeNumber: this.newPayment.chequeNumber || '',
      narration: this.newPayment.narration || '',
      amount: amt,
      includingCharges,
      postageDue,
      boc,
      forfeited,
      companyCommission,
      subscriptionPaid,
      stampsOther,
      rectificationAdjustment,
      netPayable
    };

    this.isSaving = true;
    this.removalPaymentService.createPayment(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.newPayment = {};
        this.showForm = false;
        this.loadPayments();
        alert('Payment recorded');
      },
      error: (err) => {
        this.isSaving = false;
        const message =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || 'Unable to save removal payment.';
        alert(message);
      }
    });
  }
}
