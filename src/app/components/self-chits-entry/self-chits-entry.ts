import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Subscriber {
  id: string;
  name: string;
}

interface ChitGroup {
  id: string;
  name: string;
}

interface SelfChit {
  subscriberId: string;
  chitGroupId: string;
  ticketNo: string;
  person: string;
}

@Component({
  selector: 'app-self-chits-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './self-chits-entry.html',
  styleUrls: ['./self-chits-entry.scss'],
})
export class SelfChitsEntryComponent {
  subscribers: Subscriber[] = [
    { id: 'SUB001', name: 'Internal Fund A' },
    { id: 'SUB002', name: 'Internal Fund B' },
  ];

  chitGroups: ChitGroup[] = [
    { id: 'CHIT001', name: 'Golden Circle 2024' },
    { id: 'CHIT002', name: 'Diamond Elite' },
    { id: 'CHIT003', name: 'Silver Saver' },
  ];

  persons: string[] = ['John Smith', 'Sarah Williams', 'David Miller'];

  entries: SelfChit[] = [
    { subscriberId: 'SUB001', chitGroupId: 'CHIT001', ticketNo: 'TKT101', person: 'John Smith' },
    { subscriberId: 'SUB002', chitGroupId: 'CHIT002', ticketNo: 'TKT102', person: 'Sarah Williams' },
    { subscriberId: 'SUB001', chitGroupId: 'CHIT003', ticketNo: 'TKT103', person: 'David Miller' },
  ];

  showForm = false;
  selectedSubscriberId = '';
  selectedGroupId = '';
  ticketNo = '';
  selectedPerson = '';

  errorMessage = '';
  successMessage = '';

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.selectedSubscriberId = '';
    this.selectedGroupId = '';
    this.ticketNo = '';
    this.selectedPerson = '';
    this.errorMessage = '';
  }

  validate(): boolean {
    this.errorMessage = '';
    if (!this.selectedSubscriberId) {
      this.errorMessage = 'Please select a subscriber';
      return false;
    }
    if (!this.selectedGroupId) {
      this.errorMessage = 'Please select a chit group';
      return false;
    }
    if (!this.ticketNo) {
      this.errorMessage = 'Ticket number is required';
      return false;
    }
    if (!this.selectedPerson) {
      this.errorMessage = 'Please select a person';
      return false;
    }
    if (this.entries.some(e => e.ticketNo === this.ticketNo)) {
      this.errorMessage = 'Ticket number already taken';
      return false;
    }
    return true;
  }

  saveEntry() {
    if (!this.validate()) {
      return;
    }
    const newEntry: SelfChit = {
      subscriberId: this.selectedSubscriberId,
      chitGroupId: this.selectedGroupId,
      ticketNo: this.ticketNo,
      person: this.selectedPerson,
    };
    this.entries.push(newEntry);
    this.successMessage = 'Entry saved successfully';
    this.resetForm();
    setTimeout(() => {
      this.successMessage = '';
      this.showForm = false;
    }, 2000);
  }

  subscriberName(id: string) {
    return this.subscribers.find(s => s.id === id)?.name || id;
  }

  groupName(id: string) {
    return this.chitGroups.find(g => g.id === id)?.name || id;
  }
}
