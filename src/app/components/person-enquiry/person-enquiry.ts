import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-person-enquiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './person-enquiry.html',
  styleUrls: ['./person-enquiry.scss']
})
export class PersonEnquiryComponent {
  enquiryTypes = ['Member', 'Subscriber', 'Agent'];
  selectedType = '';
  nameQuery = '';

  results: any[] = [];

  // sample data
  people: any[] = [
    { type: 'Member', name: 'Alice', contact: '1234567890', memberId: 'M001' },
    { type: 'Subscriber', name: 'Bob', contact: '9876543210', subscriberId: 'S001' },
    { type: 'Agent', name: 'Charlie', contact: '5555555555', agentId: 'A001' }
  ];

  constructor() {
    // initialize results to show table on load
    this.results = [...this.people];
  }

  search() {
    const q = (this.nameQuery || '').toLowerCase();
    this.results = this.people.filter(p => {
      const matchType = !this.selectedType || p.type === this.selectedType;
      const matchName = !q || p.name.toLowerCase().includes(q);
      return matchType && matchName;
    });
  }
}
