import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-audit-trail',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './audit-trail.html',
  styleUrls: ['./audit-trail.scss']
})
export class AuditTrailComponent {
  auditForm: FormGroup;
  submitted = false;
  transactions: any[] = [];
  showTransactions = false;

  constructor(private fb: FormBuilder) {
    this.auditForm = this.fb.group({
      transactionType: ['', Validators.required],
      type: ['', Validators.required],
      voucherSeries: [''],
      voucherNumber: ['', Validators.pattern(/^\d*$/)],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    });
  }

  get f() {
    return this.auditForm.controls;
  }

  onView() {
    this.submitted = true;

    if (this.auditForm.invalid) {
      return;
    }

    // Additional validation for date range
    const fromDate = new Date(this.auditForm.value.fromDate);
    const toDate = new Date(this.auditForm.value.toDate);

    if (fromDate > toDate) {
      alert('From Date cannot be after To Date');
      return;
    }

    // Mock data for transactions
    this.transactions = [
      { id: 1, transactionType: this.auditForm.value.transactionType, type: this.auditForm.value.type, voucherSeries: this.auditForm.value.voucherSeries || 'N/A', voucherNumber: this.auditForm.value.voucherNumber || 'N/A', date: '2023-01-15', user: 'Admin', action: 'Created' },
      { id: 2, transactionType: this.auditForm.value.transactionType, type: this.auditForm.value.type, voucherSeries: this.auditForm.value.voucherSeries || 'N/A', voucherNumber: this.auditForm.value.voucherNumber || 'N/A', date: '2023-02-20', user: 'User1', action: 'Updated' },
      { id: 3, transactionType: this.auditForm.value.transactionType, type: this.auditForm.value.type, voucherSeries: this.auditForm.value.voucherSeries || 'N/A', voucherNumber: this.auditForm.value.voucherNumber || 'N/A', date: '2023-03-10', user: 'User2', action: 'Deleted' }
    ];

    this.showTransactions = true;
  }

  onCancel() {
    this.auditForm.reset();
    this.submitted = false;
    this.showTransactions = false;
    this.transactions = [];
  }
}