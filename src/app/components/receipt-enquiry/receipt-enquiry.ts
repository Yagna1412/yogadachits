import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-receipt-enquiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receipt-enquiry.html',
  styleUrls: ['./receipt-enquiry.scss']
})
export class ReceiptEnquiryComponent {
  receiptTypes = ['All', 'Cash', 'UPI', 'Cheque', 'RTJS/NEFT', 'Others'];
  selectedType = 'All';
  seriesQuery = '';
  numberQuery = '';

  results: any[] = [];

  receipts: any[] = [
    { type: 'Cash', series: 'C001', number: '0001', date: '2026-01-10', amount: 5000, description: 'Monthly Subscription' },
    { type: 'UPI', series: 'U001', number: '0052', date: '2026-01-12', amount: 15000, description: 'Bid Amount' },
    { type: 'Cheque', series: 'Q001', number: '0103', date: '2026-01-15', amount: 7500, description: 'Penalty Payment' },
    { type: 'RTJS/NEFT', series: 'R001', number: '0023', date: '2026-01-18', amount: 25000, description: 'Advance Payment' }
  ];

  constructor() {
    this.results = [...this.receipts];
  }

  search() {
    const s = (this.seriesQuery || '').toLowerCase();
    const n = (this.numberQuery || '').toLowerCase();
    this.results = this.receipts.filter(r => {
      const matchType = this.selectedType === 'All' || !this.selectedType || r.type === this.selectedType;
      const matchSeries = !s || r.series.toLowerCase().includes(s);
      const matchNumber = !n || r.number.toLowerCase().includes(n);
      return matchType && matchSeries && matchNumber;
    });
  }
}
