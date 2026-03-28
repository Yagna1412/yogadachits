import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-cash',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-cash.html',
  styleUrls: ['./account-cash.scss']
})
export class AccountCashComponent {
  showReceiptForm = false;
  showPaymentForm = false;
  searchTerm = '';
  activeTab = 'receipts'; // 'receipts' or 'payments'

  // Cash Receipts data
  receipts: any[] = [
    { id:1, transactionType:'Income', account:'Cash Account', transactionDate:'2026-02-01', voucherSeries:'CR', voucherNo:'001', currentBalance:50000, particularAccount:'Misc. Income', narration:'Miscellaneous income from services', amount:5000, grandTotal:55000 },
    { id:2, transactionType:'Asset Sale', account:'Cash Account', transactionDate:'2026-02-05', voucherSeries:'CR', voucherNo:'002', currentBalance:55000, particularAccount:'Asset Sale', narration:'Sale of old equipment', amount:8000, grandTotal:63000 },
    { id:3, transactionType:'Loan Received', account:'Cash Account', transactionDate:'2026-02-10', voucherSeries:'CR', voucherNo:'003', currentBalance:63000, particularAccount:'Bank Loan', narration:'Short-term bank loan received', amount:100000, grandTotal:163000 }
  ];

  // Cash Payments data
  payments: any[] = [
    { id:1, transactionType:'Expense', account:'Cash Account', transactionDate:'2026-02-02', voucherSeries:'CP', voucherNo:'001', currentBalance:55000, particularAccount:'Office Rent', narration:'Monthly office rent payment', amount:10000, grandTotal:45000 },
    { id:2, transactionType:'Purchase', account:'Cash Account', transactionDate:'2026-02-08', voucherSeries:'CP', voucherNo:'002', currentBalance:45000, particularAccount:'Supplies', narration:'Office supplies purchase', amount:2500, grandTotal:42500 },
    { id:3, transactionType:'Utility', account:'Cash Account', transactionDate:'2026-02-12', voucherSeries:'CP', voucherNo:'003', currentBalance:42500, particularAccount:'Electricity', narration:'Electricity bill payment', amount:3000, grandTotal:39500 }
  ];

  filteredReceipts: any[] = [...this.receipts];
  filteredPayments: any[] = [...this.payments];
  newReceipt: any = {};
  newPayment: any = {};

  toggleReceiptForm() { this.showReceiptForm = !this.showReceiptForm; }
  togglePaymentForm() { this.showPaymentForm = !this.showPaymentForm; }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.showReceiptForm = false;
    this.showPaymentForm = false;
  }

  filterReceipts() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredReceipts = this.receipts.filter(r => {
      return (!q ||
        (r.transactionType && r.transactionType.toLowerCase().includes(q)) ||
        (r.voucherNo && r.voucherNo.toLowerCase().includes(q)) ||
        (r.particularAccount && r.particularAccount.toLowerCase().includes(q))
      );
    });
  }

  filterPayments() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredPayments = this.payments.filter(p => {
      return (!q ||
        (p.transactionType && p.transactionType.toLowerCase().includes(q)) ||
        (p.voucherNo && p.voucherNo.toLowerCase().includes(q)) ||
        (p.particularAccount && p.particularAccount.toLowerCase().includes(q))
      );
    });
  }

  saveReceipt() {
    const amt = parseFloat(this.newReceipt.amount) || 0;
    if (!amt || isNaN(amt)) { alert('Amount numeric'); return; }
    ['currentBalance', 'amount', 'grandTotal'].forEach(f => {
      if (this.newReceipt[f] !== undefined) this.newReceipt[f] = parseFloat(this.newReceipt[f]) || 0;
    });
    const entry = { ...this.newReceipt, id: Date.now() };
    this.receipts.push(entry);
    this.newReceipt = {};
    this.showReceiptForm = false;
    this.filterReceipts();
    alert('Cash receipt recorded');
  }

  savePayment() {
    const amt = parseFloat(this.newPayment.amount) || 0;
    if (!amt || isNaN(amt)) { alert('Amount numeric'); return; }
    ['currentBalance', 'amount', 'grandTotal'].forEach(f => {
      if (this.newPayment[f] !== undefined) this.newPayment[f] = parseFloat(this.newPayment[f]) || 0;
    });
    const entry = { ...this.newPayment, id: Date.now() };
    this.payments.push(entry);
    this.newPayment = {};
    this.showPaymentForm = false;
    this.filterPayments();
    alert('Cash payment recorded');
  }
}
