import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemberService, MemberResponse, MemberKpiSummary } from '../../service/member.service'; 
import { SubscriberService } from '../../service/subscriber.service'; // Added import

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members.html',
  styleUrl: './members.scss',
})
export class MembersComponent implements OnInit {
  searchTerm: string = '';
  statusFilter: string = '';
  showAddMemberModal: boolean = false;
  selectedMembers: number[] = [];
  allSelected: boolean = false;
  isLoading = false;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  paginatedMembers: MemberResponse[] = [];

  // Sorting
  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  currentStep: number = 1;
  totalSteps: number = 8;
  newMember: any = {}; 
  selectedFiles: { [key: string]: File } = {}; 
  isEditMode: boolean = false;
  editingMemberId: number | null = null;

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

  memberStats: MemberKpiSummary = {
    totalMembers: { count: 0, label: 'Total Members' },
    activeMembers: { count: 0, label: 'Active Members' },
    enrolledMembers: { count: 0, label: 'Enrolled Members' },
    pendingEnrollment: { count: 0, label: 'Pending Enrollment' }
  };

  allMembers: MemberResponse[] = [];
  filteredMembers: MemberResponse[] = [];

  constructor(
    private memberService: MemberService,
    private subscriberService: SubscriberService, // Injected the new service
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.resetForm();
    this.filterMembers();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadKpis();
      this.loadMembers();
    }
  }

  loadKpis(): void {
    this.memberService.getKpiSummary().subscribe({
      next: (data) => {
        if(data) this.memberStats = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading KPIs', err)
    });
  }

  loadMembers(): void {
    this.isLoading = true;
    this.memberService.getMembers().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
           this.allMembers = data;
        }
        this.filterMembers();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading members', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterMembers(): void {
    const searchStr = (this.searchTerm || '').trim().toLowerCase();
    const statusStr = (this.statusFilter || '').trim().toLowerCase();

    let result = this.allMembers.filter(member => {
      const memberName = (member.name || '').toString().toLowerCase();
      const memberId = member.id?.toString() || '';
      const memberCity = (member.city || '').toString().toLowerCase();
      const memberMobile = (member.mobileNumber || '').toString().toLowerCase();
      const memberStatus = (member.status || '').toString().toLowerCase();

      const matchesSearch = !searchStr ||
        memberName.includes(searchStr) ||
        memberId.includes(searchStr) ||
        memberCity.includes(searchStr) ||
        memberMobile.includes(searchStr);

      const matchesStatus = !statusStr || memberStatus === statusStr;
      return matchesSearch && matchesStatus;
    });

    result.sort((a: any, b: any) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredMembers = result;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredMembers.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedMembers = this.filteredMembers.slice(startIndex, startIndex + this.pageSize);
  }

  toggleSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.filterMembers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 3;
    let start = Math.max(1, this.currentPage - 1);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - (maxVisible - 1));
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  toggleSelectAll(event: any): void {
    this.allSelected = event.target.checked;
    if (this.allSelected) {
      this.selectedMembers = this.filteredMembers.map(m => m.id);
    } else {
      this.selectedMembers = [];
    }
  }

  toggleMemberSelection(id: number): void {
    const index = this.selectedMembers.indexOf(id);
    if (index > -1) {
      this.selectedMembers.splice(index, 1);
    } else {
      this.selectedMembers.push(id);
    }
    this.allSelected = this.selectedMembers.length === this.filteredMembers.length && this.filteredMembers.length > 0;
  }

  viewMember(id: number): void {
    const member = this.allMembers.find(m => m.id === id);
    if (member) {
      alert(`Member Details:\nID: ${member.id}\nName: ${member.name}\nCity: ${member.city}\nStatus: ${member.status}`);
    }
  }

  editMember(id: number): void {
    const member = this.allMembers.find(m => m.id === id);
    if (member) {
      this.isEditMode = true;
      this.editingMemberId = id;
      
      this.newMember = {
        fullName: member.name,
        mobileNumber: member.mobileNumber,
        city: member.city,
        status: member.status,
      };
      
      this.showAddMemberModal = true;
      this.currentStep = 1;
    }
  }

  onFileSelected(event: any, fieldName: string): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiles[fieldName] = file;
    }
  }

  submitForm(): void {
    const payload = {
      title: this.newMember.title || null,
      name: this.newMember.fullName, 
      guardianName: this.newMember.spouseOrFatherName || null,
      dob: this.newMember.dateOfBirth || null,
      age: this.newMember.age ? Number(this.newMember.age) : null,
      registrationDate: this.newMember.registrationDate || null, 
      gender: this.newMember.gender ? this.newMember.gender.toLowerCase() : null,
      mobileNumber: this.newMember.mobileNumber, 
      email: this.newMember.emailAddress || null,
      aadharNumber: this.newMember.aadharNumber || null,
      address: this.newMember.address || null,
      maritalStatus: this.newMember.maritalStatus || null,
      introducedAs: this.newMember.spouseName || null,
      
      photoUrl: null, 
      signatureUrl: null,
      passbookUrl: null,
      
      bankAccountNumber: this.newMember.accountNumber || null,
      bankAccountHolderName: this.newMember.accountHolderName || null,
      bankName: this.newMember.bankName || null,
      bankBranch: this.newMember.branchName || null,
      bankIfsc: this.newMember.ifscCode || null,
      occupation: this.newMember.occupation || null,
      employeeType: this.newMember.employeeType || null,
      organization: this.newMember.organization || null,
      designation: this.newMember.designation || null,
      dateOfJoining: this.newMember.dateOfJoining || null,
      doorNo: this.newMember.doorNo || null,
      streetName: this.newMember.streetName || null,
      city: this.newMember.city || null,
      pincode: this.newMember.pincode || null,
      nomineeName: this.newMember.nomineeName || null,
      nomineeAge: this.newMember.nomineeAge ? Number(this.newMember.nomineeAge) : null,
      nomineeRelation: this.newMember.nomineeRelation || null,
      nomineeDoorNo: this.newMember.nomineeDoorNo || null,
      nomineeStreetName: this.newMember.nomineeStreetName || null,
      nomineeCity: this.newMember.nomineeCity || null,
      nomineeAddress: this.newMember.nomineeAddress || null,
      nomineePincode: this.newMember.nomineePincode || null,
      nomineeMobileNumber: this.newMember.nomineeMobileNumber || null,
      fillSubscriberAddress: this.newMember.fillSubscriberAddress || null,
      route: this.newMember.route || null
    };

    const saveObservable = this.isEditMode && this.editingMemberId
      ? this.memberService.updateMember(this.editingMemberId, payload)
      : this.memberService.createMember(payload);

    saveObservable.subscribe({
      next: (response: MemberResponse) => {
        // SECONDARY GUARANTEE: Chain the subscriber sync automatically after member is saved
        const savedMemberId = response.id;
        
        this.subscriberService.syncSubscriber(savedMemberId).subscribe({
            next: () => {
                alert(this.isEditMode ? 'Member updated and subscriber synced successfully!' : 'Member added and subscriber synced successfully!');
                this.loadMembers(); 
                this.loadKpis();
                this.closeAddMemberModal();
            },
            error: (syncErr) => {
                console.error('Subscriber sync fallback failed:', syncErr);
                // We still want to load/close because the Member save *was* successful
                alert('Member saved successfully, but manual subscriber sync returned an error. Check console.');
                this.loadMembers(); 
                this.loadKpis();
                this.closeAddMemberModal();
            }
        });
      },
      error: (err: any) => {
        console.error('Save failed:', err);
        const msg = err.error?.message || 'Check console for details.';
        alert(`Failed to ${this.isEditMode ? 'update' : 'save'} member: ${msg}`);
      }
    });
  }

  resetForm(): void {
    this.newMember = {};
    this.selectedFiles = {}; 
    this.isEditMode = false;
    this.editingMemberId = null;
    this.steps.forEach(step => step.completed = false);
  }

  nextStep(): void { 
    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.currentStep < this.totalSteps) { 
      this.steps[this.currentStep - 1].completed = true; 
      this.currentStep++; 
    } 
  }
  
  validateCurrentStep(): boolean {
    if (this.currentStep === 1) {
      if (!this.newMember.fullName || !this.newMember.spouseOrFatherName || !this.newMember.registrationDate || !this.newMember.mobileNumber) {
        alert("Please fill in all mandatory fields: Name, Father/Spouse Name, Registration Date, and Mobile Number.");
        return false;
      }
    }
    return true;
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
  
  closeAddMemberModal(): void { 
    this.showAddMemberModal = false; 
    this.resetForm(); 
  }
  
  openAddMemberModal(): void { 
    this.showAddMemberModal = true; 
    this.currentStep = 1; 
    this.resetForm(); 
  }
  
  deleteMember(id: number): void {
    if (confirm('Delete member?')) {
      this.memberService.deleteMember(id).subscribe({
        next: () => { 
          this.loadMembers(); 
          this.loadKpis(); 
        }
      });
    }
  }

  calculateAge(): void {
    if (this.newMember.dateOfBirth) {
      const birthDate = new Date(this.newMember.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      this.newMember.age = age;
    } else {
      this.newMember.age = null;
    }
  }
}