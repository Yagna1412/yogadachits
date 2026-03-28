import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-surety-entry',
  imports: [CommonModule, FormsModule],
  templateUrl: './surety-entry.html',
  styleUrls: ['./surety-entry.scss']
})
export class SuretyEntryComponent {
  showForm = false;
  validationError = '';
  successMessage = '';

  // search / filter fields
  searchTerm: string = '';

  sureties: any[] = [
    { groupName: 'Group A', ticketNo: '101', subscriberName: 'Ramesh', suretyName: 'Kumar', suretyRelation: 'Father', suretyDate: '2026-02-25' },
    { groupName: 'Group B', ticketNo: '202', subscriberName: 'Suresh', suretyName: 'Rita', suretyRelation: 'Wife', suretyDate: '2026-02-28' },
    { groupName: 'Group C', ticketNo: '303', subscriberName: 'Meena', suretyName: 'Krishnan', suretyRelation: 'Brother', suretyDate: '2026-01-15' },
    { groupName: 'Group D', ticketNo: '404', subscriberName: 'Anita', suretyName: 'Lakshmi', suretyRelation: 'Mother', suretyDate: '2026-01-20' },
    { groupName: 'Group E', ticketNo: '505', subscriberName: 'Vikas', suretyName: 'Sundar', suretyRelation: 'Friend', suretyDate: '2026-02-05' },
    { groupName: 'Group F', ticketNo: '606', subscriberName: 'Priya', suretyName: 'Raj', suretyRelation: 'Husband', suretyDate: '2026-02-08' },
    { groupName: 'Group G', ticketNo: '707', subscriberName: 'Sunil', suretyName: 'Ramesh', suretyRelation: 'Father', suretyDate: '2026-02-12' },
    { groupName: 'Group H', ticketNo: '808', subscriberName: 'Geeta', suretyName: 'Nisha', suretyRelation: 'Sister', suretyDate: '2026-02-16' },
    { groupName: 'Group I', ticketNo: '909', subscriberName: 'Rohit', suretyName: 'Manoj', suretyRelation: 'Brother', suretyDate: '2026-02-18' },
    { groupName: 'Group J', ticketNo: '1001', subscriberName: 'Sunita', suretyName: 'Kavita', suretyRelation: 'Mother', suretyDate: '2026-02-20' }
  ];

  filteredSureties: any[] = [...this.sureties];

  newSurety: any = {};

  constructor() {}

  ngOnInit(): void {}

  saveSurety() {
    this.validationError = '';
    this.successMessage = '';

    // Validation
    if (!this.newSurety.suretyName || !this.newSurety.suretyRelation || !this.newSurety.suretyDate) {
      this.validationError = 'Please fill out all mandatory fields (Name, Relation, and Date).';
      return;
    }

    this.sureties.push({ ...this.newSurety });
    this.successMessage = 'Surety details added successfully!';
    this.newSurety = {};
    
    // Auto-hide success message and toggle form
    setTimeout(() => {
      this.successMessage = '';
      this.showForm = false;
    }, 1500);

    this.filterSureties();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  filterSureties() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredSureties = this.sureties.filter(s => {
      return (
        !q ||
        (s.groupName && s.groupName.toLowerCase().includes(q)) ||
        (s.ticketNo && s.ticketNo.toLowerCase().includes(q)) ||
        (s.subscriberName && s.subscriberName.toLowerCase().includes(q)) ||
        (s.suretyName && s.suretyName.toLowerCase().includes(q))
      );
    });
  }
}
