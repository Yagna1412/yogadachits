import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface GroupRow {
  group: string;
  runningOutstanding: number;
  closedOutstanding: number;
}

@Component({
  selector: 'app-group-wise-outstanding-accounts-compare-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-wise-outstanding-accounts-compare-report.html',
  styleUrls: ['./group-wise-outstanding-accounts-compare-report.scss']
})
export class GroupWiseOutstandingAccountsCompareReportComponent {
  reportType = '';
  reportDate: string = '';
  groupName = '';
  status = '';
  showReport = false;

  reportTypes = ['Summary', 'Detailed'];
  statuses = ['Running', 'Closed', 'Both'];

  // sample data
  reportData: GroupRow[] = [
    { group: 'Group A', runningOutstanding: 12000, closedOutstanding: 2000 },
    { group: 'Group B', runningOutstanding: 8000, closedOutstanding: 1000 },
    { group: 'Group C', runningOutstanding: 15000, closedOutstanding: 500 }
  ];

  generate() {
    if (!this.reportDate) {
      alert('Report Date mandatory');
      return;
    }
    if (!this.isWithinCurrentFinancialYear(this.reportDate)) {
      alert('Report Date must be within the current financial year');
      return;
    }
    if (!this.status) {
      alert('Please select at least one group status (Running / Closed / Both)');
      return;
    }
    this.showReport = true;
  }

  reset() {
    this.reportType = '';
    this.reportDate = '';
    this.groupName = '';
    this.status = '';
    this.showReport = false;
  }

  // financial year assumed April 1 - March 31
  isWithinCurrentFinancialYear(dateStr: string): boolean {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    const year = today.getFullYear();
    // determine fy start: if today >= Apr 1 this year, fyStart = Apr 1 this year, fyEnd = Mar 31 next year
    const fyStart = new Date(year, 3, 1); // April is month 3 (0-based)
    let fyEnd = new Date(year + 1, 2, 31);
    if (today < fyStart) {
      // we are in Jan-Mar of year, so current FY started last year
      fyStart.setFullYear(year - 1);
      fyEnd = new Date(year, 2, 31);
    }
    // compare only date part
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return dateOnly >= new Date(fyStart.getFullYear(), fyStart.getMonth(), fyStart.getDate()) &&
      dateOnly <= new Date(fyEnd.getFullYear(), fyEnd.getMonth(), fyEnd.getDate());
  }

  filteredData(): GroupRow[] {
    return this.reportData.filter(r => {
      const matchName = !this.groupName || r.group.toLowerCase().includes(this.groupName.toLowerCase());
      if (!matchName) return false;
      if (this.status === 'Running') return r.runningOutstanding > 0;
      if (this.status === 'Closed') return r.closedOutstanding > 0;
      return true; // Both
    });
  }
}
