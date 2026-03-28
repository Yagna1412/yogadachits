import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-suit-filed-receipt',
  imports: [CommonModule, FormsModule],
  templateUrl: './suit-filed-receipt.html',
  styleUrls: ['./suit-filed-receipt.scss']
})
export class SuitFiledReceiptComponent {
  showForm = false;
  searchTerm = '';

  // Suit Filed Receipts data
  receipts: any[] = [
    { id:1, groupName:'Group A', ticketNumber:'TK001', receiptDate:'2026-02-01', paymentMode:'Cheque', receiptSeries:'SFR', receiptNo:'001', trNo:'TR001', trDate:'2026-01-31', subscriberName:'John Doe', debitTo:'Account 1', collectionAgent:'Agent A', receiptAmount:5000, bankCharge:50, penalty:0, incCharge:100, verificationCharge:0, enrollmentFee:0, totalCharges:150, subscription:'Active', reasons:'Court fee payment', bankName:'HDFC Bank', chequeDate:'2026-02-01', depositDate:'2026-02-01', localNLocal:'Local', sameChequePending:'No' },
    { id:2, groupName:'Group B', ticketNumber:'TK002', receiptDate:'2026-02-05', paymentMode:'RTGS', receiptSeries:'SFR', receiptNo:'002', trNo:'TR002', trDate:'2026-02-04', subscriberName:'Jane Smith', debitTo:'Account 2', collectionAgent:'Agent B', receiptAmount:7500, bankCharge:75, penalty:500, incCharge:150, verificationCharge:100, enrollmentFee:0, totalCharges:825, subscription:'Active', reasons:'Legal expenses', bankName:'SBI Bank', chequeDate:'', depositDate:'2026-02-05', localNLocal:'N-Local', sameChequePending:'No' }
  ];

  filteredReceipts: any[] = [...this.receipts];
  newReceipt: any = {};

  toggleForm() { this.showForm = !this.showForm; }

  filterReceipts() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredReceipts = this.receipts.filter(r => {
      return (!q ||
        (r.groupName && r.groupName.toLowerCase().includes(q)) ||
        (r.ticketNumber && r.ticketNumber.toLowerCase().includes(q)) ||
        (r.subscriberName && r.subscriberName.toLowerCase().includes(q))
      );
    });
  }

  saveReceipt() {
    if (!this.newReceipt.groupName || !this.newReceipt.ticketNumber || !this.newReceipt.subscriberName) {
      alert('Group Name, Ticket Number, and Subscriber Name are required');
      return;
    }

    const receiptAmt = parseFloat(this.newReceipt.receiptAmount) || 0;
    if (!receiptAmt || isNaN(receiptAmt)) {
      alert('Receipt Amount must be numeric');
      return;
    }

    // Parse numeric fields
    ['receiptAmount', 'bankCharge', 'penalty', 'incCharge', 'verificationCharge', 'enrollmentFee', 'totalCharges'].forEach(f => {
      if (this.newReceipt[f] !== undefined) this.newReceipt[f] = parseFloat(this.newReceipt[f]) || 0;
    });

    const entry = { ...this.newReceipt, id: Date.now() };
    this.receipts.push(entry);
    this.newReceipt = {};
    this.showForm = false;
    this.filterReceipts();
    alert('Suit receipt recorded');
  }
}
