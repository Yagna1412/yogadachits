import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group-enquiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-enquiry.html',
  styleUrls: ['./group-enquiry.scss']
})
export class GroupEnquiryComponent {
  nameQuery = '';
  results: any[] = [];

  groups: any[] = [
    { name: 'Golden Circle 2024', status: 'Active', members: 12, startDate: '2024-01-01', endDate: '2025-12-31', amount: 50000 },
    { name: 'Diamond Elite', status: 'Active', members: 8, startDate: '2024-02-15', endDate: '2025-12-31', amount: 75000 },
    { name: 'Silver Saver', status: 'Closed', members: 10, startDate: '2023-01-01', endDate: '2024-12-31', amount: 30000 },
    { name: 'Platinum Plus', status: 'Active', members: 15, startDate: '2024-03-01', endDate: '2025-12-31', amount: 100000 }
  ];

  constructor() {
    this.results = [...this.groups];
  }

  search() {
    const q = (this.nameQuery || '').toLowerCase();
    this.results = this.groups.filter(g => {
      return !q || g.name.toLowerCase().includes(q);
    });
  }
}
