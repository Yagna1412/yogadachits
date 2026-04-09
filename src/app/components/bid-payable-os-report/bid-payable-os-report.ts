import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BidRow {
  group: string;
  payable: number;
  type: string;
}

@Component({
  selector: 'app-bid-payable-os-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bid-payable-os-report.html',
  styleUrls: ['./bid-payable-os-report.scss']
})
export class BidPayableOsReportComponent {
  reportType = '';
  reportDate: string = '';
  groupName = '';
  showReport = false;

  types = ['Summary', 'Detailed'];

  data: BidRow[] = [
    { group: 'Group A', payable: 12500, type: 'Summary' },
    { group: 'Group A', payable: 5000, type: 'Detailed' },
    { group: 'Group B', payable: 8300, type: 'Summary' },
    { group: 'Group B', payable: 1200, type: 'Detailed' },
    { group: 'Group C', payable: 0, type: 'Summary' },
    { group: 'Group D', payable: 2500, type: 'Summary' }
  ];

  generate() {
    if (!this.reportDate) {
      alert('Report Date mandatory');
      return;
    }
    this.showReport = true;
  }

  reset() {
    this.reportType = '';
    this.reportDate = '';
    this.groupName = '';
    this.showReport = false;
  }

  filtered(): BidRow[] {
    return this.data.filter(r => {
      const matchGroup = !this.groupName || r.group.toLowerCase().includes(this.groupName.toLowerCase());
      const matchType = !this.reportType || r.type === this.reportType;
      return matchGroup && matchType;
    });
  }
}
