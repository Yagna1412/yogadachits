import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReportRow {
  group: string;
  runningCount: number;
  closedCount: number;
  total: number;
}


@Component({
  selector: 'app-group-wise-consolidation-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-wise-consolidation-report.html',
  styleUrls: ['./group-wise-consolidation-report.scss']
})

export class GroupWiseConsolidationReportComponent {
  groupName = '';
  status = '';
  reportDate: string = '';
  showReport = false;

  statuses = ['Running', 'Closed', 'Both'];

  // sample report data; in a real app this would come from a service
  reportData: ReportRow[] = [
    { group: 'Group A', runningCount: 5, closedCount: 2, total: 7 },
    { group: 'Group B', runningCount: 3, closedCount: 4, total: 7 },
    { group: 'Group C', runningCount: 8, closedCount: 1, total: 9 }
  ];

  generate() {
    if (!this.reportDate) {
      alert('Report Date mandatory');
      return;
    }
    this.showReport = true;
  }

  reset() {
    this.groupName = '';
    this.status = '';
    this.reportDate = '';
    this.showReport = false;
  }

  filteredData(): ReportRow[] {
    return this.reportData.filter(r => {
      const matchName = !this.groupName || r.group.toLowerCase().includes(this.groupName.toLowerCase());
      if (!matchName) {
        return false;
      }
      if (this.status === 'Running') {
        return r.runningCount > 0;
      }
      if (this.status === 'Closed') {
        return r.closedCount > 0;
      }
      return true; // 'Both' or empty
    });
  }
}
