import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-receipts',
  imports: [CommonModule, FormsModule],
  templateUrl: './receipts.html',
  styleUrls: ['./receipts.scss']
})
export class ReceiptsComponent {

  showForm = false;
  receiptType = 'Daily';

  // search / filter fields
  searchTerm: string = '';
  searchType: string = '';
  searchDate: string = '';
  searchGroup: string = '';
  searchSubscriber: string = '';
  searchAgent: string = '';

  // data arrays
  receipts: any[] = [
    {
      type: 'Daily',
      groupName: 'Group A',
      ticketNo: '101',
      receiptDate: '2026-03-01',
      receiptNo: 'R001',
      paymentMode: 'Cash',
      amount: 5000,
      subscriber: 'Ramesh',
      balance: 2000,
      bankName: 'ABC Bank',
      instrumentNo: '12345',
      chequeDate: '2026-03-01',
      agent: 'Agent X'
    },
    {
      type: 'Future',
      groupName: 'Group B',
      ticketNo: '202',
      receiptDate: '2026-03-05',
      receiptNo: 'R002',
      paymentMode: 'UPI',
      amount: 8000,
      subscriber: 'Suresh',
      balance: 0,
      agent: 'Agent Y'
    }
  ];

  filteredReceipts: any[] = [...this.receipts];

  newReceipt: any = {};

  constructor() {}

  ngOnInit(): void {
    this.filterReceipts();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  saveReceipt() {
    // normalize amount, balance as numbers
    if (this.newReceipt.amount) {
      this.newReceipt.amount = +this.newReceipt.amount;
    }
    if (this.newReceipt.balance) {
      this.newReceipt.balance = +this.newReceipt.balance;
    }

    this.receipts.push({ ...this.newReceipt, type: this.receiptType });
    this.newReceipt = {};
    this.receiptType = 'Daily';
    this.showForm = false;
    this.filterReceipts();
  }

  filterReceipts(): void {
    this.filteredReceipts = this.receipts.filter(r => {
      const matchesSearch = !this.searchTerm ||
        (r.groupName && r.groupName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (r.ticketNo && r.ticketNo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (r.subscriber && r.subscriber.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesType = !this.searchType || r.type === this.searchType;
      const matchesDate = !this.searchDate || r.receiptDate === this.searchDate;
      const matchesGroup = !this.searchGroup || (r.groupName && r.groupName.toLowerCase().includes(this.searchGroup.toLowerCase()));
      const matchesSubscriber = !this.searchSubscriber || (r.subscriber && r.subscriber.toLowerCase().includes(this.searchSubscriber.toLowerCase()));
      const matchesAgent = !this.searchAgent || (r.agent && r.agent.toLowerCase().includes(this.searchAgent.toLowerCase()));

      return matchesSearch && matchesType && matchesDate && matchesGroup && matchesSubscriber && matchesAgent;
    });
  }

  totalAmount(): number {
    return this.filteredReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  }
}