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
  enquiryTypes = ['Member', 'Subscriber'];
  selectedType = 'Member';
  nameQuery = 'Rajesh Kumar';

  results: any[] = [];
  selectedPerson: any = null;
  activeTab = 'kyc';
  activeAddressTab = 'residential';

  // Detail info tabs
  detailTabs = [
    { key: 'kyc', label: 'KYC' },
    { key: 'self-chits', label: 'Self Chits' },
    { key: 'cancel-chits', label: 'Cancel Chits' },
    { key: 'guarantor', label: 'As A Guarantor' },
    { key: 'surety-info', label: 'Surety Info' },
    { key: 'auctions-payment', label: 'Auctions & Payment Info' },
    { key: 'dues', label: 'Dues' },
    { key: 'receipts-info', label: 'Receipts Info' },
    { key: 'notice-info', label: 'Notices Info' },
    { key: 'additional-info', label: 'Additional Info' },
    { key: 'closed-chits', label: 'Closed Chits' }
  ];

  addressTabs = [
    { key: 'residential', label: 'Residential' },
    { key: 'office', label: 'Office' },
    { key: 'correspondence', label: 'Correspondence' },
    { key: 'others', label: 'Others' }
  ];

  // Sample data
  people: any[] = [
    {
      type: 'Member', name: 'Rajesh Kumar', contact: '9876543210', memberId: 'M001',
      fatherName: 'Ravi Kumar', dob: '1990-05-15', aadhar: '1234-5678-9012', address: '12, MG Road, Hyderabad',
      email: 'rajesh@email.com', status: 'Active'
    },
    {
      type: 'Subscriber', name: 'Priya Sharma', contact: '9988776655', subscriberId: 'S001',
      fatherName: 'Suresh Sharma', dob: '1985-08-22', aadhar: '9876-5432-1098', address: '56, Jubilee Hills, Hyderabad',
      email: 'priya@email.com', status: 'Active'
    }
  ];

  constructor() {
    this.selectedPerson = this.people[0];
  }

  search() {
    const q = (this.nameQuery || '').toLowerCase();
    const found = this.people.find(p => {
      const matchType = !this.selectedType || p.type === this.selectedType;
      const matchName = !q || p.name.toLowerCase().includes(q);
      return matchType && matchName;
    });

    if (found) {
      this.selectedPerson = found;
    }
  }

  setTab(tabKey: string) {
    this.activeTab = tabKey;
  }

  setAddressTab(tabKey: string) {
    this.activeAddressTab = tabKey;
  }

  cancelMember(person: any) {
    if (confirm(`Are you sure you want to cancel member "${person.name}"?`)) {
      person.status = 'Cancelled';
      alert(`Member ${person.name} has been cancelled.`);
    }
  }
}
