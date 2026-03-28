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
  receiptTypes = ['Cash', 'Bank', 'Journal'];
  selectedType = '';
  seriesQuery = '';
  numberQuery = '';

  results: any[] = [];

  receipts: any[] = [
    { type: 'Cash', series: 'C001', number: '0001', date: '2026-01-10', amount: 500, description: 'Office supplies' },
    { type: 'Bank', series: 'B001', number: '0002', date: '2026-01-12', amount: 1500, description: 'Vendor payment' },
    { type: 'Journal', series: 'J001', number: '0003', date: '2026-01-15', amount: 750, description: 'Adjustment' }
  ];

  constructor() {
    this.results = [...this.receipts];
  }

  search() {
    const s = (this.seriesQuery || '').toLowerCase();
    const n = (this.numberQuery || '').toLowerCase();
    this.results = this.receipts.filter(r => {
      const matchType = !this.selectedType || r.type === this.selectedType;
      const matchSeries = !s || r.series.toLowerCase().includes(s);
      const matchNumber = !n || r.number.toLowerCase().includes(n);
      return matchType && matchSeries && matchNumber;
    });
  }
}