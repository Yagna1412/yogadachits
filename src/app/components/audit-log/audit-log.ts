import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AuditEntry {
  date: string;
  time: string;
  user: string;
  action: string;
}

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-log.html',
  styleUrls: ['./audit-log.scss']
})
export class AuditLogComponent {
  fromDate: string = '';
  toDate: string = '';
  showReport = true; // used to control appearance after generate or reset

  data: AuditEntry[] = [
    { date: '2026-03-01', time: '09:15', user: 'admin', action: 'Login' },
    { date: '2026-03-01', time: '09:20', user: 'jdoe', action: 'Create member' },
    { date: '2026-03-02', time: '14:05', user: 'asmith', action: 'Update group details' },
    { date: '2026-03-03', time: '11:30', user: 'admin', action: 'Delete receipt' },
    { date: '2026-03-04', time: '08:45', user: 'jdoe', action: 'Logout' }
  ];

  generate() {
    if (!this.fromDate || !this.toDate) {
      alert('Both dates are required');
      return;
    }
    if (this.fromDate > this.toDate) {
      alert('From Date must be earlier than or equal to To Date');
      return;
    }
    this.showReport = true;
  }

  reset() {
    this.fromDate = '';
    this.toDate = '';
    this.showReport = false;
  }

  filtered(): AuditEntry[] {
    // only show when both dates are provided
    if (!this.fromDate || !this.toDate) {
      return [];
    }
    return this.data.filter(entry => {
      return entry.date >= this.fromDate && entry.date <= this.toDate;
    });
  }

  /**
   * returns true if both dates are present and the range is valid
   */
  get validRange(): boolean {
    return !!this.fromDate && !!this.toDate && this.fromDate <= this.toDate;
  }
}
