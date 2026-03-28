import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bid-payments',
  imports: [CommonModule, FormsModule],
  templateUrl: './bid-payments.html',
  styleUrls: ['./bid-payments.scss']
})
export class BidPaymentsComponent {
  showForm = false;
  searchTerm: string = '';

  payments: any[] = [
    { id: 1, groupName: 'Group A', ticketNo: '101', paidTo: 'Ramesh', series: 'A', no: '1', transactionDate: '2026-02-01', account: 'Cash', amount: 5000, narration: 'Bid win payout', chequeNumber: '', chequeDate: '', currentInstallment: 5, paidUpTo: '2026-01', auctionOn: '2026-01-20', installmentMonth: 'Jan 2026', chitAmount: 4500, companyCommission: 50, bidAmount: 4800, bidPayable: 4700, bpAdjustment: 0, advanceAdjustment: 0, paidAmount: 4700, netPayable: 4700 },
    { id: 2, groupName: 'Group B', ticketNo: '202', paidTo: 'Suresh', series: 'B', no: '2', transactionDate: '2026-02-03', account: 'Bank', amount: 8000, narration: '', chequeNumber: 'CHK001', chequeDate: '2026-02-03', currentInstallment: 6, paidUpTo: '2026-02', auctionOn: '2026-01-22', installmentMonth: 'Feb 2026', chitAmount: 7800, companyCommission: 100, bidAmount: 7900, bidPayable: 7800, bpAdjustment: 0, advanceAdjustment: 0, paidAmount: 7800, netPayable: 7800 },
    { id: 3, groupName: 'Group C', ticketNo: '303', paidTo: 'Meena', series: 'C', no: '3', transactionDate: '2026-02-05', account: 'Cash', amount: 6000, narration: '', chequeNumber: '', chequeDate: '', currentInstallment: 4, paidUpTo: '2026-01', auctionOn: '2026-01-25', installmentMonth: 'Jan 2026', chitAmount: 6000, companyCommission: 80, bidAmount: 6100, bidPayable: 6020, bpAdjustment: 0, advanceAdjustment: 0, paidAmount: 6020, netPayable: 6020 },
    { id: 4, groupName: 'Group D', ticketNo: '404', paidTo: 'Anita', series: 'D', no: '4', transactionDate: '2026-02-07', account: 'Bank', amount: 15000, narration: 'Large bid', chequeNumber: 'CHK002', chequeDate: '2026-02-07', currentInstallment: 8, paidUpTo: '2026-02', auctionOn: '2026-02-01', installmentMonth: 'Feb 2026', chitAmount: 15000, companyCommission: 300, bidAmount: 15200, bidPayable: 14900, bpAdjustment: 0, advanceAdjustment: 0, paidAmount: 14900, netPayable: 14900 },
    { id: 5, groupName: 'Group E', ticketNo: '505', paidTo: 'Vikas', series: 'E', no: '5', transactionDate: '2026-02-09', account: 'Cash', amount: 2000, narration: '', chequeNumber: '', chequeDate: '', currentInstallment: 2, paidUpTo: '2026-01', auctionOn: '2026-01-30', installmentMonth: 'Jan 2026', chitAmount: 2500, companyCommission: 20, bidAmount: 2050, bidPayable: 2030, bpAdjustment: 0, advanceAdjustment: 0, paidAmount: 2030, netPayable: 2030 },
    { id: 6, groupName: 'Group F', ticketNo: '606', paidTo: 'Priya', series: 'F', no: '6', transactionDate: '2026-02-11', account: 'Bank', amount: 10000, narration: '', chequeNumber: 'CHK003', chequeDate: '2026-02-11', currentInstallment: 7, paidUpTo: '2026-01', auctionOn: '2026-01-15', installmentMonth: 'Jan 2026', chitAmount: 10000, companyCommission: 150, bidAmount: 10100, bidPayable: 10000, bpAdjustment: 0, advanceAdjustment: 0, paidAmount: 10000, netPayable: 10000 },
    { id: 7, groupName: 'Group G', ticketNo: '707', paidTo: 'Sunil', series: 'G', no: '7', transactionDate: '2026-02-13', account: 'Cash', amount: 3000, narration: '', chequeNumber: '', chequeDate: '', currentInstallment: 3, paidUpTo: '2026-01', auctionOn: '2026-01-18', installmentMonth: 'Jan 2026', chitAmount: 3000, companyCommission: 30, bidAmount: 3050, bidPayable: 3020, bpAdjustment: 0, advanceAdjustment: 0, paidAmount: 3020, netPayable: 3020 },
    { id: 8, groupName: 'Group H', ticketNo: '808', paidTo: 'Geeta', series: 'H', no: '8', transactionDate: '2026-02-15', account: 'Bank', amount: 4500, narration: '', chequeNumber: '', chequeDate: '', currentInstallment: 5, paidUpTo: '2026-01', auctionOn: '2026-01-20', installmentMonth: 'Jan 2026', chitAmount: 4500, companyCommission: 45, bidAmount: 4550, bidPayable: 4505, bpAdjustment: 0, advanceAdjustment: 0, paidAmount: 4505, netPayable: 4505 },
    { id: 9, groupName: 'Group I', ticketNo: '909', paidTo: 'Rohit', series: 'I', no: '9', transactionDate: '2026-02-17', account: 'Cash', amount: 7000, narration: '', chequeNumber: '', chequeDate: '', currentInstallment: 6, paidUpTo: '2026-01', auctionOn: '2026-02-05', installmentMonth: 'Feb 2026', chitAmount: 7000, companyCommission: 70, bidAmount: 7050, bidPayable: 6980, bpAdjustment: 0, advanceAdjustment: 0, paidAmount: 6980, netPayable: 6980 },
    { id: 10, groupName: 'Group J', ticketNo: '1001', paidTo: 'Sunita', series: 'J', no: '10', transactionDate: '2026-02-19', account: 'Bank', amount: 9500, narration: '', chequeNumber: 'CHK004', chequeDate: '2026-02-19', currentInstallment: 9, paidUpTo: '2026-02', auctionOn: '2026-01-22', installmentMonth: 'Feb 2026', chitAmount: 9500, companyCommission: 95, bidAmount: 9600, bidPayable: 9505, BPAdjustment: 0, advanceAdjustment: 0, paidAmount: 9505, netPayable: 9505 }
  ];

  filteredPayments: any[] = [...this.payments];

  newPayment: any = {};

  constructor() {}

  ngOnInit(): void {}

  toggleForm() {
    this.showForm = !this.showForm;
  }

  filterPayments() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredPayments = this.payments.filter(p => {
      return (
        !q ||
        (p.groupName && p.groupName.toLowerCase().includes(q)) ||
        (p.ticketNo && p.ticketNo.toLowerCase().includes(q)) ||
        (p.paidTo && p.paidTo.toLowerCase().includes(q))
      );
    });
  }

  validationErrors: { [key: string]: boolean } = {};

  savePayment() {
    this.validationErrors = {};
    let isValid = true;

    if (!this.newPayment.groupName?.trim()) { this.validationErrors['groupName'] = true; isValid = false; }
    if (!this.newPayment.ticketNo?.trim()) { this.validationErrors['ticketNo'] = true; isValid = false; }
    if (!this.newPayment.amount || isNaN(parseFloat(this.newPayment.amount))) { this.validationErrors['amount'] = true; isValid = false; }

    if (!isValid) {
      alert("Please fill in the highlighted required fields.");
      return;
    }

    const amt = parseFloat(this.newPayment.amount) || 0;
    
    // parse other numeric fields if present
    ['chitAmount','companyCommission','bidAmount','bidPayable','bpAdjustment','advanceAdjustment','paidAmount','netPayable'].forEach(f=>{
      if(this.newPayment[f]!==undefined) this.newPayment[f]=parseFloat(this.newPayment[f])||0;
    });
    const entry = { ...this.newPayment, id: Date.now(), amount: amt, paidAmount: amt, netPayable: amt };
    this.payments.unshift(entry);
    this.newPayment = {};
    this.showForm = false;
    this.filterPayments();
    alert('Payment recorded');
  }
}
