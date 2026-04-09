import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-transaction-vouchers',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-vouchers.html',
  styleUrls: ['./transaction-vouchers.scss']
})
export class TransactionVouchersComponent {
  voucherForm: FormGroup;
  submitted = false;

  voucherTypes = [
    'memberReceipts',
    'futureReceipts',
    'advanceReceipts',
    'dailyReceipts',
    'selfChitsReceipts',
    'bidPayments',
    'cancelMemberPayments',
    'creditBalanceReturn',
    'agentCommissionPayment',
    'bidAdvance',
    'agentCommissionBill',
    'auctionJVs',
    'cashReceipts',
    'bankDeposits',
    'bankPayments',
    'journalVouchers'
  ];

  constructor(private fb: FormBuilder) {
    this.voucherForm = this.fb.group({
      memberReceipts: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      futureReceipts: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      advanceReceipts: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      dailyReceipts: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      selfChitsReceipts: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      bidPayments: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      cancelMemberPayments: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      creditBalanceReturn: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      agentCommissionPayment: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      bidAdvance: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      agentCommissionBill: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      auctionJVs: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      cashReceipts: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      bankDeposits: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      bankPayments: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      journalVouchers: this.fb.group({
        series: ['', Validators.required],
        startingNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
      }),
      depositAccounts: [false],
      paymentAccounts: [false]
    });
  }

  get f() {
    return this.voucherForm.controls;
  }

  onSave() {
    this.submitted = true;

    if (this.voucherForm.invalid) {
      return;
    }

    // Mock save logic
    alert('Voucher configuration saved successfully and applied to transactions');

    // Reset form
    this.submitted = false;
    this.voucherForm.reset();
  }

  onCancel() {
    this.voucherForm.reset();
    this.submitted = false;
  }
}
