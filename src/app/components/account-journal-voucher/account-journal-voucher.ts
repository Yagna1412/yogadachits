import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-journal-voucher',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-journal-voucher.html',
  styleUrls: ['./account-journal-voucher.scss']
})
export class AccountJournalVoucherComponent {
  showForm = false;
  searchTerm = '';

  // Journal Vouchers data
  vouchers: any[] = [
    { id:1, transactionType:'Adjustment', voucherSeries:'JV', voucherNo:'001', transactionDate:'2026-02-01', account:'Sundry Debtors', narration:'Provision for doubtful debts', debitAmount:5000, creditAmount:0, totalDebit:5000, totalCredit:5000 },
    { id:2, transactionType:'Transfer', voucherSeries:'JV', voucherNo:'002', transactionDate:'2026-02-05', account:'Fixed Assets', narration:'Transfer of asset cost to depreciation', debitAmount:0, creditAmount:2000, totalDebit:2000, totalCredit:2000 },
    { id:3, transactionType:'Correction', voucherSeries:'JV', voucherNo:'003', transactionDate:'2026-02-10', account:'Expenses', narration:'Correction of prior period expense entry', debitAmount:3000, creditAmount:0, totalDebit:3000, totalCredit:3000 },
    { id:4, transactionType:'Adjustment', voucherSeries:'JV', voucherNo:'004', transactionDate:'2026-02-15', account:'Revenue', narration:'Accrual of revenue for incomplete services', debitAmount:0, creditAmount:7500, totalDebit:7500, totalCredit:7500 }
  ];

  filteredVouchers: any[] = [...this.vouchers];
  newVoucher: any = {};

  toggleForm() { this.showForm = !this.showForm; }

  filterVouchers() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredVouchers = this.vouchers.filter(v => {
      return (!q ||
        (v.transactionType && v.transactionType.toLowerCase().includes(q)) ||
        (v.voucherNo && v.voucherNo.toLowerCase().includes(q)) ||
        (v.account && v.account.toLowerCase().includes(q))
      );
    });
  }

  saveVoucher() {
    // Validate numeric fields
    const debit = parseFloat(this.newVoucher.debitAmount) || 0;
    const credit = parseFloat(this.newVoucher.creditAmount) || 0;

    if (isNaN(debit) || isNaN(credit)) {
      alert('Debit and Credit amounts must be numeric');
      return;
    }

    // Validate debit and credit are not both zero
    if (debit === 0 && credit === 0) {
      alert('Either Debit or Credit amount must be provided');
      return;
    }

    // Validate total debit equals total credit
    const totalDebit = this.newVoucher.totalDebit ? parseFloat(this.newVoucher.totalDebit) : debit;
    const totalCredit = this.newVoucher.totalCredit ? parseFloat(this.newVoucher.totalCredit) : credit;

    if (totalDebit !== totalCredit) {
      alert('Total Debit must equal Total Credit. Current Debit: ' + totalDebit + ', Current Credit: ' + totalCredit);
      return;
    }

    // Parse numeric fields
    ['debitAmount', 'creditAmount', 'totalDebit', 'totalCredit'].forEach(f => {
      if (this.newVoucher[f] !== undefined) this.newVoucher[f] = parseFloat(this.newVoucher[f]) || 0;
    });

    const entry = { ...this.newVoucher, id: Date.now() };
    this.vouchers.push(entry);
    this.newVoucher = {};
    this.showForm = false;
    this.filterVouchers();
    alert('Journal voucher recorded');
  }
}
