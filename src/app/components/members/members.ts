import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Data models for easy backend integration
export interface MemberStats {
  total: number;
  totalChange: number;
  active: number;
  activeChange: number;
  enrolled: number;
  pending: number;
}

export interface Member {
  id: string;
  name: string;
  mobile: string;
  chits: string;
  location: string;
  status: 'Active' | 'Upcoming' | 'Inactive';
  email?: string;
  address?: string;
  joinDate?: Date;
  lastActivity?: Date;
}

// JSON structure for backend developers
export interface MemberApiResponse {
  success: boolean;
  data: {
    members: Member[];
    stats: MemberStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
  message: string;
}

@Component({
  selector: 'app-members',
  imports: [CommonModule, FormsModule],
  templateUrl: './members.html',
  styleUrl: './members.scss',
})
export class MembersComponent implements OnInit {
  // UI State
  searchTerm: string = '';
  statusFilter: string = '';
  showAddMemberModal: boolean = false;
  selectedMembers: string[] = [];
  allSelected: boolean = false;

  // Step-wise form state
  currentStep: number = 1;
  totalSteps: number = 8;
  newMember: any = {
    // Step 1 - Basic
    title: '',
    fullName: '',
    gender: '',
    spouseOrFatherName: '',
    dateOfBirth: '',
    age: '',
    registrationDate: '',
    emailAddress: '',
    mobileNumber: '',
    aadharNumber: '',
    address: '',
    // Step 2 - Personal
    maritalStatus: '',
    spouseName: '', // "Introduced As"
    // Step 3 - Documents
    photo: '',
    signature: '',
    passbook: '',
    // Step 4 - Bank Details
    accountNumber: '',
    accountHolderName: '',
    bankName: '',
    branchName: '',
    ifscCode: '',
    // Step 5 - Occupation
    occupation: '',
    employeeType: '',
    organization: '',
    designation: '',
    dateOfJoining: '',
    // Step 6 - Address Details
    doorNo: '',
    streetName: '',
    city: '',
    pincode: '',
    // reusing address field for step 6
    // Step 7 - Nominee Details
    nomineeName: '',
    nomineeAge: '',
    nomineeRelation: '',
    nomineeDoorNo: '',
    nomineeStreetName: '',
    nomineeCity: '',
    nomineeAddress: '',
    nomineePincode: '',
    nomineeMobileNumber: '',
    fillSubscriberAddress: '',
    // Step 8 - Location Details
    route: ''
  };

  steps = [
    { number: 1, title: 'Basic Info', completed: false },
    { number: 2, title: 'Personal Info', completed: false },
    { number: 3, title: 'Documents', completed: false },
    { number: 4, title: 'Bank', completed: false },
    { number: 5, title: 'Occupation', completed: false },
    { number: 6, title: 'Address', completed: false },
    { number: 7, title: 'Nominee', completed: false },
    { number: 8, title: 'Location', completed: false },
  ];

  // Data properties
  memberStats: MemberStats = {
    total: 124,
    totalChange: 2.5,
    active: 112,
    activeChange: 8.3,
    enrolled: 27,
    pending: 23
  };

  // Mock data matching the UX screenshot
  allMembers: Member[] = [
    {
      id: 'MEM001',
      name: 'Rajesh Kumar',
      mobile: '9876543210',
      chits: '9876543210',
      location: 'Chennai',
      status: 'Active'
    },
    {
      id: 'MEM002',
      name: 'Priya Sharma',
      mobile: '9876543210',
      chits: '9876543210',
      location: 'Bangalore',
      status: 'Active'
    },
    {
      id: 'MEM003',
      name: 'Amit Patel',
      mobile: '9876543210',
      chits: '9876543210',
      location: 'Mumbai',
      status: 'Upcoming'
    },
    {
      id: 'MEM004',
      name: 'Sunita Devi',
      mobile: '9876543210',
      chits: '9876543210',
      location: 'Hyderabad',
      status: 'Active'
    },
    {
      id: 'MEM001',
      name: 'Rajesh Kumar',
      mobile: '9876543210',
      chits: '9876543210',
      location: 'Chennai',
      status: 'Active'
    },
    {
      id: 'MEM002',
      name: 'Priya Sharma',
      mobile: '9876543210',
      chits: '9876543210',
      location: 'Bangalore',
      status: 'Active'
    },
    {
      id: 'MEM003',
      name: 'Amit Patel',
      mobile: '9876543210',
      chits: '9876543210',
      location: 'Mumbai',
      status: 'Upcoming'
    },
    {
      id: 'MEM004',
      name: 'Sunita Devi',
      mobile: '9876543210',
      chits: '9876543210',
      location: 'Hyderabad',
      status: 'Active'
    }
  ];

  filteredMembers: Member[] = [...this.allMembers];

  constructor() { }

  ngOnInit(): void {
    this.filterMembers();
  }

  // Filter functionality
  filterMembers(): void {
    this.filteredMembers = this.allMembers.filter(member => {
      const matchesSearch = !this.searchTerm ||
        member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.mobile.includes(this.searchTerm);

      const matchesStatus = !this.statusFilter || member.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // Selection functionality
  toggleSelectAll(event: any): void {
    this.allSelected = event.target.checked;
    if (this.allSelected) {
      this.selectedMembers = this.filteredMembers.map(m => m.id);
    } else {
      this.selectedMembers = [];
    }
  }

  toggleMemberSelection(memberId: string): void {
    const index = this.selectedMembers.indexOf(memberId);
    if (index > -1) {
      this.selectedMembers.splice(index, 1);
    } else {
      this.selectedMembers.push(memberId);
    }
    this.allSelected = this.selectedMembers.length === this.filteredMembers.length;
  }

  // Modal functionality
  openAddMemberModal(): void {
    this.showAddMemberModal = true;
    this.currentStep = 1;
    this.resetForm();
  }

  closeAddMemberModal(): void {
    this.showAddMemberModal = false;
    this.currentStep = 1;
    this.resetForm();
  }

  resetForm(): void {
    this.newMember = {
      title: '',
      fullName: '',
      gender: '',
      spouseOrFatherName: '',
      dateOfBirth: '',
      age: '',
      registrationDate: '',
      emailAddress: '',
      mobileNumber: '',
      aadharNumber: '',
      address: '',

      maritalStatus: '',
      spouseName: '',

      photo: '',
      signature: '',
      passbook: '',

      accountNumber: '',
      accountHolderName: '',
      bankName: '',
      branchName: '',
      ifscCode: '',

      occupation: '',
      employeeType: '',
      organization: '',
      designation: '',
      dateOfJoining: '',

      doorNo: '',
      streetName: '',
      city: '',
      pincode: '',

      nomineeName: '',
      nomineeAge: '',
      nomineeRelation: '',
      nomineeDoorNo: '',
      nomineeStreetName: '',
      nomineeCity: '',
      nomineeAddress: '',
      nomineePincode: '',
      nomineeMobileNumber: '',
      fillSubscriberAddress: '',

      route: ''
    };
    this.steps.forEach(step => step.completed = false);
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.steps[this.currentStep - 1].completed = true;
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.steps[this.currentStep - 1].completed = false;
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  submitForm(): void {
    // Mark final step as completed
    this.steps[this.currentStep - 1].completed = true;

    // Generate new member ID
    const newId = `MEM${String(this.allMembers.length + 1).padStart(3, '0')}`;

    // Add to members array
    const memberData: Member = {
      id: newId,
      name: this.newMember.fullName,
      mobile: this.newMember.mobileNumber,
      chits: this.newMember.mobileNumber, // Using mobile as chits for now
      location: this.newMember.address,
      status: 'Active' as const,
      email: this.newMember.emailAddress
    };

    this.allMembers.unshift(memberData);
    this.filterMembers();

    console.log('New member added:', memberData);
    this.closeAddMemberModal();
  }

  // Member actions (ready for backend integration)
  viewMember(memberId: string): void {
    console.log('View member:', memberId);
    // TODO: Navigate to member details page or open view modal
    // this.router.navigate(['/admin/members', memberId]);
  }

  editMember(memberId: string): void {
    console.log('Edit member:', memberId);
    // TODO: Open edit form or navigate to edit page
    // this.router.navigate(['/admin/members/edit', memberId]);
  }

  deleteMember(memberId: string): void {
    if (confirm('Are you sure you want to delete this member?')) {
      console.log('Delete member:', memberId);
      // TODO: Call delete API
      // this.memberService.deleteMember(memberId).subscribe(...)
    }
  }

  // Future API integration methods (ready to implement)
  /*
  
  // When backend is ready, these methods can be implemented:
  
  async loadMembers(): Promise<void> {
    try {
      const response = await this.memberService.getMembers({
        page: 1,
        limit: 50,
        search: this.searchTerm,
        status: this.statusFilter
      }).toPromise();
      
      this.allMembers = response.data.members;
      this.memberStats = response.data.stats;
      this.filterMembers();
    } catch (error) {
      console.error('Error loading members:', error);
    }
  }

  async createMember(memberData: Partial<Member>): Promise<void> {
    try {
      const response = await this.memberService.createMember(memberData).toPromise();
      this.allMembers.unshift(response.data);
      this.filterMembers();
      this.closeAddMemberModal();
    } catch (error) {
      console.error('Error creating member:', error);
    }
  }

  */
}

// Export data structures for backend team
export const MEMBER_API_ENDPOINTS = {
  GET_MEMBERS: '/api/members',
  GET_MEMBER_BY_ID: '/api/members/:id',
  CREATE_MEMBER: '/api/members',
  UPDATE_MEMBER: '/api/members/:id',
  DELETE_MEMBER: '/api/members/:id',
  GET_MEMBER_STATS: '/api/members/stats'
};

export const SAMPLE_MEMBER_JSON = {
  "id": "MEM001",
  "name": "Rajesh Kumar",
  "mobile": "9876543210",
  "email": "rajesh@example.com",
  "chits": "9876543210",
  "location": "Chennai",
  "address": "123 Main Street, Chennai, Tamil Nadu 600001",
  "status": "Active",
  "joinDate": "2024-01-15T00:00:00Z",
  "lastActivity": "2024-02-08T10:30:00Z"
};