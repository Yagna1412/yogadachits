import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AccountRow {
  account: string;
  outstanding: number;
}

@Component({
  selector: 'app-accounts-outstanding-compare-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts-outstanding-compare-report.html',
  styleUrls: ['./accounts-outstanding-compare-report.scss']
})
export class AccountsOutstandingCompareReportComponent {
  reportType = '';
  reportDate: string = '';
  groupName = '';
  showReport = false;

  reportTypes = ['Summary', 'Detailed'];
  groups = ['Group A', 'Group B', 'Group C'];

  // sample data to demonstrate the compare table
  sampleData: { account: string; group: string; outstanding: number }[] = [
    { account: 'Account 1001', group: 'Group A', outstanding: 22000 },
    { account: 'Account 1002', group: 'Group A', outstanding: 15000 },
    { account: 'Account 2001', group: 'Group B', outstanding: 8000 },
    { account: 'Account 2002', group: 'Group B', outstanding: 9000 },
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

  // returns list of unique accounts in the data
  accounts(): string[] {
    const set = new Set(this.sampleData.map(d => d.account));
    return Array.from(set);
  }

  // builds a map of account -> outstanding for selected group
  dataForGroup(group: string): AccountRow[] {
    const accounts = this.accounts();
    return accounts.map(a => {
      const row = this.sampleData.find(d => d.account === a && d.group === group);
      return { account: a, outstanding: row ? row.outstanding : 0 };
    });
  }
}
