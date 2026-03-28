import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-bank',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-bank.html',
  styleUrls: ['./account-bank.scss']
})
export class AccountBankComponent {
  showDepositForm = false;
  showPaymentForm = false;
  searchTerm = '';
  activeTab = 'deposits'; // 'deposits' or 'payments'

  // Bank Deposits data
  deposits: any[] = [
    { id:1, transactionType:'Cash Deposit', bankAccount:'HDFC-12345', transactionDate:'2026-02-01', voucherSeries:'BD', voucherNo:'001', currentBalance:100000, particularAccount:'Cash Deposit', chequeNo:'', chequeDate:'', bankName:'HDFC Bank', place:'Main Branch', narration:'Cash deposit from daily collection', amount:50000, grandTotal:150000 },
    { id:2, transactionType:'Transfer', bankAccount:'HDFC-12345', transactionDate:'2026-02-05', voucherSeries:'BD', voucherNo:'002', currentBalance:150000, particularAccount:'Inter-bank Transfer', chequeNo:'', chequeDate:'', bankName:'HDFC Bank', place:'Main Branch', narration:'Transfer from another account', amount:100000, grandTotal:250000 },
    { id:3, transactionType:'Cheque Deposit', bankAccount:'HDFC-12345', transactionDate:'2026-02-10', voucherSeries:'BD', voucherNo:'003', currentBalance:250000, particularAccount:'Cheque Deposit', chequeNo:'CHQ123456', chequeDate:'2026-02-08', bankName:'HDFC Bank', place:'Main Branch', narration:'Customer cheque deposit', amount:75000, grandTotal:325000 }
  ];

  // Bank Payments data
  payments: any[] = [
    { id:1, transactionType:'Vendor Payment', bankAccount:'HDFC-12345', transactionDate:'2026-02-02', voucherSeries:'BP', voucherNo:'001', currentBalance:150000, particularAccount:'Vendor Payments', chequeNo:'CHQ001', chequeDate:'2026-02-02', bankName:'HDFC Bank', place:'Main Branch', narration:'Payment to vendor for supplies', amount:25000, grandTotal:125000 },
    { id:2, transactionType:'Salary Payment', bankAccount:'HDFC-12345', transactionDate:'2026-02-08', voucherSeries:'BP', voucherNo:'002', currentBalance:125000, particularAccount:'Salaries', chequeNo:'CHQ002', chequeDate:'2026-02-08', bankName:'HDFC Bank', place:'Main Branch', narration:'Monthly salary payments', amount:80000, grandTotal:45000 },
    { id:3, transactionType:'Loan Payment', bankAccount:'HDFC-12345', transactionDate:'2026-02-12', voucherSeries:'BP', voucherNo:'003', currentBalance:45000, particularAccount:'Loan EMI', chequeNo:'CHQ003', chequeDate:'2026-02-12', bankName:'HDFC Bank', place:'Main Branch', narration:'Bank loan EMI payment', amount:15000, grandTotal:30000 }
  ];

  filteredDeposits: any[] = [...this.deposits];
  filteredPayments: any[] = [...this.payments];
  newDeposit: any = {};
  newPayment: any = {};

  toggleDepositForm() { this.showDepositForm = !this.showDepositForm; }
  togglePaymentForm() { this.showPaymentForm = !this.showPaymentForm; }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.showDepositForm = false;
    this.showPaymentForm = false;
  }

  filterDeposits() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredDeposits = this.deposits.filter(d => {
      return (!q ||
        (d.transactionType && d.transactionType.toLowerCase().includes(q)) ||
        (d.voucherNo && d.voucherNo.toLowerCase().includes(q)) ||
        (d.bankName && d.bankName.toLowerCase().includes(q))
      );
    });
  }

  filterPayments() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredPayments = this.payments.filter(p => {
      return (!q ||
        (p.transactionType && p.transactionType.toLowerCase().includes(q)) ||
        (p.voucherNo && p.voucherNo.toLowerCase().includes(q)) ||
        (p.bankName && p.bankName.toLowerCase().includes(q))
      );
    });
  }

  saveDeposit() {
    const amt = parseFloat(this.newDeposit.amount) || 0;
    if (!amt || isNaN(amt)) { alert('Amount numeric'); return; }
    ['currentBalance', 'amount', 'grandTotal'].forEach(f => {
      if (this.newDeposit[f] !== undefined) this.newDeposit[f] = parseFloat(this.newDeposit[f]) || 0;
    });
    const entry = { ...this.newDeposit, id: Date.now() };
    this.deposits.push(entry);
    this.newDeposit = {};
    this.showDepositForm = false;
    this.filterDeposits();
    alert('Deposit recorded');
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
    alert('Payment recorded');
  }
}
