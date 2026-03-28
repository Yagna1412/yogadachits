import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payments-removal-members',
  imports: [CommonModule, FormsModule],
  templateUrl: './payments-removal-members.html',
  styleUrls: ['./payments-removal-members.scss']
})
export class PaymentsRemovalMembersComponent {
  showForm = false;

  searchTerm: string = '';

  payments: any[] = [
    { id: 1, groupName: 'Group A', ticketNo: '101', paidTo: 'Ramesh', series: 'A', no: '1', transactionDate: '2026-02-01', account: 'Cash', includingCharges: 0, postageDue: 0, boc: 0, forfeited: 0, amount: 5000, narration: 'Removal payout', chequeNumber: '', chequeDate: '', enrollmentOn: '2023-01-01', canceledOn: '2026-01-15', chitAmount: 4500, companyCommission: 50, subscriptionPaid: 0, stampsOther: 0, rectificationAdjustment: 0, paidAmount: 4950, netPayable: 4950 },
    { id: 2, groupName: 'Group A', ticketNo: '102', paidTo: 'Suresh', series: 'A', no: '2', transactionDate: '2026-02-03', account: 'Bank', includingCharges: 10, postageDue: 0, boc: 0, forfeited: 0, amount: 8000, narration: 'Settlement', chequeNumber: 'CHK001', chequeDate: '2026-02-03', enrollmentOn: '2022-05-10', canceledOn: '2026-01-20', chitAmount: 7800, companyCommission: 100, subscriptionPaid: 0, stampsOther: 0, rectificationAdjustment: 0, paidAmount: 7690, netPayable: 7690 },
    { id: 3, groupName: 'Group B', ticketNo: '201', paidTo: 'Meena', series: 'B', no: '3', transactionDate: '2026-02-05', account: 'Cash', includingCharges: 0, postageDue: 5, boc: 0, forfeited: 0, amount: 6000, narration: '', chequeNumber: '', chequeDate: '', enrollmentOn: '2021-03-12', canceledOn: '2026-01-25', chitAmount: 6000, companyCommission: 80, subscriptionPaid: 0, stampsOther: 0, rectificationAdjustment: 0, paidAmount: 5915, netPayable: 5915 },
    { id: 4, groupName: 'Group C', ticketNo: '301', paidTo: 'Rita', series: 'C', no: '4', transactionDate: '2026-02-07', account: 'Bank', includingCharges: 0, postageDue: 0, boc: 20, forfeited: 0, amount: 15000, narration: 'Final settlement', chequeNumber: 'CHK002', chequeDate: '2026-02-07', enrollmentOn: '2020-07-01', canceledOn: '2026-02-01', chitAmount: 15000, companyCommission: 300, subscriptionPaid: 0, stampsOther: 0, rectificationAdjustment: 0, paidAmount: 14680, netPayable: 14680 },
    { id: 5, groupName: 'Group D', ticketNo: '401', paidTo: 'Kumar', series: 'D', no: '5', transactionDate: '2026-02-09', account: 'Cash', includingCharges: 0, postageDue: 0, boc: 0, forfeited: 500, amount: 2000, narration: 'Forfeiture applied', chequeNumber: '', chequeDate: '', enrollmentOn: '2019-11-11', canceledOn: '2026-01-10', chitAmount: 2500, companyCommission: 0, subscriptionPaid: 0, stampsOther: 0, rectificationAdjustment: 0, paidAmount: 1500, netPayable: 1500 },
    { id: 6, groupName: 'Group E', ticketNo: '501', paidTo: 'Anita', series: 'E', no: '6', transactionDate: '2026-02-11', account: 'Bank', includingCharges: 0, postageDue: 0, boc: 0, forfeited: 0, amount: 10000, narration: '', chequeNumber: 'CHK003', chequeDate: '2026-02-11', enrollmentOn: '2018-04-04', canceledOn: '2026-01-05', chitAmount: 10000, companyCommission: 150, subscriptionPaid: 0, stampsOther: 0, rectificationAdjustment: 0, paidAmount: 9850, netPayable: 9850 },
    { id: 7, groupName: 'Group F', ticketNo: '601', paidTo: 'Vikas', series: 'F', no: '7', transactionDate: '2026-02-13', account: 'Cash', includingCharges: 0, postageDue: 0, boc: 0, forfeited: 0, amount: 3000, narration: '', chequeNumber: '', chequeDate: '', enrollmentOn: '2023-09-09', canceledOn: '2026-01-30', chitAmount: 3000, companyCommission: 30, subscriptionPaid: 0, stampsOther: 0, rectificationAdjustment: 0, paidAmount: 2970, netPayable: 2970 },
    { id: 8, groupName: 'Group G', ticketNo: '701', paidTo: 'Lakshmi', series: 'G', no: '8', transactionDate: '2026-02-15', account: 'Bank', includingCharges: 0, postageDue: 0, boc: 0, forfeited: 0, amount: 4500, narration: '', chequeNumber: '', chequeDate: '', enrollmentOn: '2017-02-02', canceledOn: '2026-01-12', chitAmount: 4500, companyCommission: 45, subscriptionPaid: 0, stampsOther: 0, rectificationAdjustment: 0, paidAmount: 4455, netPayable: 4455 },
    { id: 9, groupName: 'Group H', ticketNo: '801', paidTo: 'Rohit', series: 'H', no: '9', transactionDate: '2026-02-17', account: 'Cash', includingCharges: 0, postageDue: 0, boc: 0, forfeited: 0, amount: 7000, narration: '', chequeNumber: '', chequeDate: '', enrollmentOn: '2016-08-08', canceledOn: '2026-02-05', chitAmount: 7000, companyCommission: 70, subscriptionPaid: 0, stampsOther: 0, rectificationAdjustment: 0, paidAmount: 6930, netPayable: 6930 },
    { id: 10, groupName: 'Group I', ticketNo: '901', paidTo: 'Sunita', series: 'I', no: '10', transactionDate: '2026-02-19', account: 'Bank', includingCharges: 0, postageDue: 0, boc: 0, forfeited: 0, amount: 9500, narration: '', chequeNumber: 'CHK004', chequeDate: '2026-02-19', enrollmentOn: '2015-12-12', canceledOn: '2026-01-22', chitAmount: 9500, companyCommission: 95, subscriptionPaid: 0, stampsOther: 0, rectificationAdjustment: 0, paidAmount: 9405, netPayable: 9405 }
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

  savePayment() {
    // basic numeric validation
    const amt = parseFloat(this.newPayment.amount) || 0;
    if (!amt || isNaN(amt)) {
      alert('Amount numeric');
      return;
    }

    // parse numeric deduction fields
    const includingCharges = parseFloat(this.newPayment.includingCharges) || 0;
    const postageDue = parseFloat(this.newPayment.postageDue) || 0;
    const boc = parseFloat(this.newPayment.boc) || 0;
    const forfeited = parseFloat(this.newPayment.forfeited) || 0;
    const companyCommission = parseFloat(this.newPayment.companyCommission) || 0;
    const subscriptionPaid = parseFloat(this.newPayment.subscriptionPaid) || 0;
    const stampsOther = parseFloat(this.newPayment.stampsOther) || 0;
    const rectificationAdjustment = parseFloat(this.newPayment.rectificationAdjustment) || 0;

    const netPayable = amt - (includingCharges + postageDue + boc + forfeited + companyCommission + subscriptionPaid + stampsOther + rectificationAdjustment);
    const paidAmount = netPayable; // simple assumption

    const entry = {
      id: Date.now(),
      groupName: this.newPayment.groupName || '',
      ticketNo: this.newPayment.ticketNo || '',
      paidTo: this.newPayment.paidTo || '',
      series: this.newPayment.series || '',
      no: this.newPayment.no || '',
      transactionDate: this.newPayment.transactionDate || '',
      account: this.newPayment.account || '',
      includingCharges,
      postageDue,
      boc,
      forfeited,
      amount: amt,
      narration: this.newPayment.narration || '',
      chequeNumber: this.newPayment.chequeNumber || '',
      chequeDate: this.newPayment.chequeDate || '',
      enrollmentOn: this.newPayment.enrollmentOn || '',
      canceledOn: this.newPayment.canceledOn || '',
      chitAmount: parseFloat(this.newPayment.chitAmount) || 0,
      companyCommission,
      subscriptionPaid,
      stampsOther,
      rectificationAdjustment,
      paidAmount,
      netPayable
    };

    this.payments.push(entry);
    this.newPayment = {};
    this.showForm = false;
    this.filterPayments();
    alert('Payment recorded');
  }
}
