import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Member {
  id: string;
  name: string;
}

interface ChitGroup {
  id: string;
  name: string;
}

interface Enrollment {
  memberId: string;
  chitGroupId: string;
  ticketNo: string;
  businessAgent: string;
  collectionAgent: string;
}

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enrollments.html',
  styleUrls: ['./enrollments.scss'],
})
export class EnrollmentsComponent {
  // mock data lists; in a real app these would come from the backend
  members: Member[] = [
    { id: 'MEM001', name: 'Rajesh Kumar' },
    { id: 'MEM002', name: 'Priya Sharma' },
    { id: 'MEM003', name: 'Amit Patel' },
    { id: 'MEM004', name: 'Sunita Devi' },
  ];

  chitGroups: ChitGroup[] = [
    { id: 'CHIT001', name: 'Golden Circle 2024' },
    { id: 'CHIT002', name: 'Diamond Elite' },
    { id: 'CHIT003', name: 'Silver Saver' },
  ];

  enrollments: Enrollment[] = [
    {
      memberId: 'MEM001',
      chitGroupId: 'CHIT001',
      ticketNo: 'TKT001',
      businessAgent: 'John Smith',
      collectionAgent: 'Robert Johnson',
    },
    {
      memberId: 'MEM002',
      chitGroupId: 'CHIT002',
      ticketNo: 'TKT002',
      businessAgent: 'Sarah Williams',
      collectionAgent: 'Michael Brown',
    },
    {
      memberId: 'MEM003',
      chitGroupId: 'CHIT001',
      ticketNo: 'TKT003',
      businessAgent: 'David Miller',
      collectionAgent: 'John Smith',
    },
  ];

  // form model
  showForm = false;
  selectedMemberId = '';
  selectedGroupId = '';
  ticketNo = '';
  businessAgent = '';
  collectionAgent = '';

  errorMessage = '';
  successMessage = '';
  validationErrors: { [key: string]: boolean } = {};

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.selectedMemberId = '';
    this.selectedGroupId = '';
    this.ticketNo = '';
    this.businessAgent = '';
    this.collectionAgent = '';
    this.errorMessage = '';
  }

  validate(): boolean {
    this.errorMessage = '';
    this.validationErrors = {};
    let isValid = true;
    
    if (!this.selectedMemberId) {
      this.validationErrors['member'] = true;
      this.errorMessage = 'Please select a member';
      isValid = false;
    }
    if (!this.selectedGroupId) {
      this.validationErrors['group'] = true;
      this.errorMessage = this.errorMessage || 'Please select a chit group';
      isValid = false;
    }
    if (!this.ticketNo) {
      this.validationErrors['ticket'] = true;
      this.errorMessage = this.errorMessage || 'Ticket number is required';
      isValid = false;
    }
    // unique ticket check
    if (this.ticketNo && this.enrollments.some(e => e.ticketNo === this.ticketNo)) {
      this.validationErrors['ticket'] = true;
      this.errorMessage = this.errorMessage || 'Ticket number already taken';
      isValid = false;
    }
    // member already enrolled
    if (this.selectedMemberId && this.enrollments.some(e => e.memberId === this.selectedMemberId && e.chitGroupId === this.selectedGroupId)) {
      this.validationErrors['member'] = true;
      this.errorMessage = this.errorMessage || 'Member has already been enrolled in this group';
      isValid = false;
    }
    return isValid;
  }

  saveEnrollment() {
    if (!this.validate()) {
      alert(this.errorMessage);
      return;
    }

    const newEnroll: Enrollment = {
      memberId: this.selectedMemberId,
      chitGroupId: this.selectedGroupId,
      ticketNo: this.ticketNo,
      businessAgent: this.businessAgent,
      collectionAgent: this.collectionAgent,
    };
    this.enrollments.unshift(newEnroll);

    alert(`Member successfully assigned to Group! Ticket No: ${this.ticketNo}`);
    this.successMessage = 'Enrollment saved successfully';
    this.showForm = false;
    this.resetForm();

    // hide success and form after a short delay
    setTimeout(() => {
      this.successMessage = '';
      this.showForm = false;
    }, 200);
  }

  memberName(id: string) {
    return this.members.find(m => m.id === id)?.name || id;
  }

  groupName(id: string) {
    return this.chitGroups.find(g => g.id === id)?.name || id;
  }
}