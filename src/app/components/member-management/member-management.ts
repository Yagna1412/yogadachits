import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Data models
export interface Member {
  id: string;
  name: string;
  groupName: string;
  ticketNo: string;
  mobile: string;
  status: 'Active' | 'Inactive' | 'Transferred' | 'Removed';
  enrollDate?: string;
  address?: string;
  paidUpTo?: string;
  payable?: number;
  paid?: number;
}

export interface MemberRemoval {
  groupName: string;
  ticketNo: string;
  subscriber: string;
  removalDate: string;
  authorizedBy: string;
  reason: string;
  id?: string;
}

export interface MemberTransfer {
  transferDate: string;
  groupName: string;
  ticketNo: string;
  subscriber: string;
  transferTo: string;
  busAgent: string;
  collAgent: string;
  authorizedBy: string;
  reason: string;
  addressType: string;
  enrollDate: string;
  memberAddr: string;
  paidUpTo: string;
  payable: number;
  paid: number;
  transferee: string;
  transfereeAddr: string;
  nominee: string;
  age: string;
  relation: string;
  mobile: string;
  doorNo: string;
  street: string;
  city: string;
  pincode: string;
  id?: string;
}

export interface MemberReallotment {
  groupName: string;
  ticketNumber: string;
  bidder: string;
  reallotmentDate: string;
  authorizedBy: string;
  reason: string;
  enrollmentDate: string;
  address: string;
  runningInstallmentNo: number;
  subscriptionPayable: number;
  paidAmount: number;
  balanceAmount: number;
  id?: string;
}

@Component({
  selector: 'app-member-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './member-management.html',
  styleUrls: ['./member-management.scss']
})
export class MemberManagementComponent implements OnInit {
  // UI State
  showForm = false;
  operationType: 'removal' | 'transfer' | 'reallotment' = 'removal';
  searchTerm: string = '';
  searchGroup: string = '';
  searchStatus: string = '';

  // Form data
  newRemoval: MemberRemoval = this.initRemoval();
  newTransfer: MemberTransfer = this.initTransfer();
  newReallotment: MemberReallotment = this.initReallotment();

  errorMessage: string = '';
  successMessage: string = '';

  // Data arrays - Master members list
  allMembers: Member[] = [
    {
      id: 'MEM001',
      name: 'Rajesh Kumar',
      groupName: 'Group A',
      ticketNo: '101',
      mobile: '9876543210',
      status: 'Active',
      enrollDate: '2024-01-15',
      address: '123 Main St, Chennai',
      paidUpTo: '2026-02-28',
      payable: 50000,
      paid: 35000
    },
    {
      id: 'MEM002',
      name: 'Priya Sharma',
      groupName: 'Group B',
      ticketNo: '202',
      mobile: '9876543211',
      status: 'Active',
      enrollDate: '2024-02-10',
      address: '456 Park Ave, Bangalore',
      paidUpTo: '2026-02-28',
      payable: 60000,
      paid: 45000
    },
    {
      id: 'MEM003',
      name: 'Amit Patel',
      groupName: 'Group A',
      ticketNo: '102',
      mobile: '9876543212',
      status: 'Active',
      enrollDate: '2024-01-20',
      address: '789 Oak Ln, Mumbai',
      paidUpTo: '2026-02-28',
      payable: 55000,
      paid: 40000
    },
    {
      id: 'MEM004',
      name: 'Sunita Devi',
      groupName: 'Group C',
      ticketNo: '303',
      mobile: '9876543213',
      status: 'Active',
      enrollDate: '2024-03-05',
      address: '321 Elm St, Hyderabad',
      paidUpTo: '2026-02-28',
      payable: 45000,
      paid: 30000
    }
  ];

  removals: MemberRemoval[] = [];
  transfers: MemberTransfer[] = [];
  reallotments: MemberReallotment[] = [];

  filteredMembers: Member[] = [];
  filteredRemovals: MemberRemoval[] = [];
  filteredTransfers: MemberTransfer[] = [];
  filteredReallotments: MemberReallotment[] = [];

  // Dropdown options
  groups = ['Group A', 'Group B', 'Group C', 'Group D'];
  agents = ['Agent X', 'Agent Y', 'Agent Z'];
  authorizedBy = ['Manager 1', 'Manager 2', 'Director'];
  addressTypes = ['Residential', 'Commercial', 'Business'];

  constructor() {}

  ngOnInit(): void {
    this.filterMembers();
  }

  // Initialization methods
  private initRemoval(): MemberRemoval {
    return {
      groupName: '',
      ticketNo: '',
      subscriber: '',
      removalDate: '',
      authorizedBy: '',
      reason: ''
    };
  }

  private initTransfer(): MemberTransfer {
    return {
      transferDate: '',
      groupName: '',
      ticketNo: '',
      subscriber: '',
      transferTo: '',
      busAgent: '',
      collAgent: '',
      authorizedBy: '',
      reason: '',
      addressType: '',
      enrollDate: '',
      memberAddr: '',
      paidUpTo: '',
      payable: 0,
      paid: 0,
      transferee: '',
      transfereeAddr: '',
      nominee: '',
      age: '',
      relation: '',
      mobile: '',
      doorNo: '',
      street: '',
      city: '',
      pincode: ''
    };
  }

  private initReallotment(): MemberReallotment {
    return {
      groupName: '',
      ticketNumber: '',
      bidder: '',
      reallotmentDate: '',
      authorizedBy: '',
      reason: '',
      enrollmentDate: '',
      address: '',
      runningInstallmentNo: 0,
      subscriptionPayable: 0,
      paidAmount: 0,
      balanceAmount: 0
    };
  }

  // UI Methods
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForms();
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  setOperationType(type: 'removal' | 'transfer' | 'reallotment'): void {
    this.operationType = type;
  }

  resetForms(): void {
    this.newRemoval = this.initRemoval();
    this.newTransfer = this.initTransfer();
    this.newReallotment = this.initReallotment();
  }

  // Filter methods
  filterMembers(): void {
    this.filteredMembers = this.allMembers.filter(member => {
      const matchesSearch = !this.searchTerm ||
        member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.ticketNo.includes(this.searchTerm) ||
        member.mobile.includes(this.searchTerm);

      const matchesGroup = !this.searchGroup || member.groupName === this.searchGroup;
      const matchesStatus = !this.searchStatus || member.status === this.searchStatus;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }

  // Removal methods
  saveRemoval(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newRemoval.groupName || !this.newRemoval.subscriber || !this.newRemoval.removalDate || !this.newRemoval.reason) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const removal = {
      ...this.newRemoval,
      id: 'REM' + Date.now()
    };

    this.removals.push(removal);

    // Update member status to removed
    const member = this.allMembers.find(m => m.name === this.newRemoval.subscriber);
    if (member) {
      member.status = 'Removed';
    }

    this.successMessage = 'Member removed successfully!';
    setTimeout(() => {
      this.toggleForm();
      this.filterMembers();
    }, 1500);
  }

  // Transfer methods
  saveTransfer(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newTransfer.groupName || !this.newTransfer.subscriber || !this.newTransfer.transferDate || !this.newTransfer.reason) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const transfer = {
      ...this.newTransfer,
      id: 'TRF' + Date.now()
    };

    this.transfers.push(transfer);

    // Update member status to transferred
    const member = this.allMembers.find(m => m.name === this.newTransfer.subscriber);
    if (member) {
      member.status = 'Transferred';
    }

    this.successMessage = 'Member transferred successfully!';
    setTimeout(() => {
      this.toggleForm();
      this.filterMembers();
    }, 1500);
  }

  // Reallotment methods
  saveReallotment(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newReallotment.groupName || !this.newReallotment.bidder || !this.newReallotment.reallotmentDate || !this.newReallotment.reason) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const reallotment = {
      ...this.newReallotment,
      id: 'REALL' + Date.now()
    };

    this.reallotments.push(reallotment);
    this.successMessage = 'Member reallocated successfully!';
    setTimeout(() => {
      this.toggleForm();
      this.filterMembers();
    }, 1500);
  }

  // Load member data into transfer form
  loadMemberForTransfer(member: Member): void {
    if (member) {
      this.newTransfer.groupName = member.groupName;
      this.newTransfer.ticketNo = member.ticketNo;
      this.newTransfer.subscriber = member.name;
      this.newTransfer.enrollDate = member.enrollDate || '';
      this.newTransfer.memberAddr = member.address || '';
      this.newTransfer.paidUpTo = member.paidUpTo || '';
      this.newTransfer.payable = member.payable || 0;
      this.newTransfer.paid = member.paid || 0;
      this.newTransfer.mobile = member.mobile;
    }
  }

  // Load member data for reallotment
  loadMemberForReallotment(member: Member): void {
    if (member) {
      this.newReallotment.groupName = member.groupName;
      this.newReallotment.ticketNumber = member.ticketNo;
      this.newReallotment.enrollmentDate = member.enrollDate || '';
      this.newReallotment.address = member.address || '';
      this.newReallotment.subscriptionPayable = member.payable || 0;
      this.newReallotment.paidAmount = member.paid || 0;
      this.newReallotment.balanceAmount = (member.payable || 0) - (member.paid || 0);
    }
  }

  // Get member name from removal for display
  getMemberName(removal: MemberRemoval): string {
    return removal.subscriber;
  }

  getTotalRemovals(): number {
    return this.removals.length;
  }

  getTotalTransfers(): number {
    return this.transfers.length;
  }

  getTotalReallotments(): number {
    return this.reallotments.length;
  }
}
