import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AuctionRow {
  auction: string;
  outstanding: number;
}

@Component({
  selector: 'app-auction-wise-outstanding-accounts-compare-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auction-wise-outstanding-accounts-compare-report.html',
  styleUrls: ['./auction-wise-outstanding-accounts-compare-report.scss']
})
export class AuctionWiseOutstandingAccountsCompareReportComponent {
  reportType = '';
  reportDate: string = '';
  groupName = '';
  showReport = false;

  reportTypes = ['Summary', 'Detailed'];
  groups = ['Group A', 'Group B', 'Group C'];

  // sample data to demonstrate the compare table
  sampleData: { auction: string; group: string; outstanding: number }[] = [
    { auction: 'Auction 1', group: 'Group A', outstanding: 12000 },
    { auction: 'Auction 2', group: 'Group A', outstanding: 15000 },
    { auction: 'Auction 1', group: 'Group B', outstanding: 8000 },
    { auction: 'Auction 2', group: 'Group B', outstanding: 9000 },
  ];

  generate() {
    if (!this.reportDate) {
      alert('Report Date mandatory');
      return;
    }
    // in a real app a service call would populate the data based on criteria
    this.showReport = true;
  }

  reset() {
    this.reportType = '';
    this.reportDate = '';
    this.groupName = '';
    this.showReport = false;
  }

  // returns list of unique auctions in the data
  auctions(): string[] {
    const set = new Set(this.sampleData.map(d => d.auction));
    return Array.from(set);
  }

  // builds a map of auction -> outstanding for selected group
  dataForGroup(group: string): AuctionRow[] {
    const auctions = this.auctions();
    return auctions.map(a => {
      const row = this.sampleData.find(d => d.auction === a && d.group === group);
      return { auction: a, outstanding: row ? row.outstanding : 0 };
    });
  }
}
