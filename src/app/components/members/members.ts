import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemberService, MemberResponse, MemberKpiSummary } from '../../service/member.service'; 
import { FileUploadService } from '../../service/file-upload.service';
import { ToastService } from '../../service/toast.service';

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
  isLoadingMember = false;
  isLoadingViewMember = false;
  showViewMemberModal = false;
  viewingMember: MemberResponse | null = null;

  // Pagination (server-side)
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;
  paginatedMembers: MemberResponse[] = [];

  // Sorting
  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  currentStep: number = 1;
  totalSteps: number = 8;
  newMember: any = {}; 
  selectedFiles: { [key: string]: File } = {};
  uploadingDocuments: { [key: string]: boolean } = {};
  isEditMode: boolean = false;
  editingMemberId: number | null = null;
  aadharError: string | null = null;
  mobileError: string | null = null;
  emailError: string | null = null;
  ifscError: string | null = null;
  pincodeError: string | null = null;
  nomineePincodeError: string | null = null;
  nomineeAgeError: string | null = null;
  nomineeMobileError: string | null = null;
  panError: string | null = null;
  gstError: string | null = null;

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


  readonly statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'SUSPENDED', label: 'Suspended' },
  ];

  constructor(
    private memberService: MemberService,
    private fileUploadService: FileUploadService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.resetForm();
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

  loadMembers(resetPage = false): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    this.isLoading = true;
    this.memberService.getMembersPaged({
      page: this.currentPage - 1,
      size: this.pageSize,
      search: this.searchTerm,
      status: this.statusFilter,
      sortBy: this.sortColumn,
      sortDir: this.sortDirection,
    }).subscribe({
      next: (data) => {
        this.paginatedMembers = data?.content ?? [];
        this.totalElements = data?.totalElements ?? 0;
        this.totalPages = Math.max(data?.totalPages ?? 1, 1);
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
        this.selectedMembers = [];
        this.allSelected = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading members', err);
        this.paginatedMembers = [];
        this.totalElements = 0;
        this.totalPages = 1;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(): void {
    this.loadMembers(true);
  }

  onStatusFilterChange(): void {
    this.loadMembers(true);
  }

  toggleSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadMembers(true);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMembers();
    }
  }

  normalizeStatus(status: string | null | undefined): string {
    return (status || '').toString().trim().toLowerCase();
  }

  formatStatusLabel(status: string | null | undefined): string {
    const normalized = this.normalizeStatus(status);
    if (!normalized) {
      return '—';
    }
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  getStatusBadgeClass(status: string | null | undefined): string {
    const normalized = this.normalizeStatus(status);
    return normalized ? `status-${normalized}` : 'status-unknown';
  }

  getVisibleStartIndex(): number {
    if (this.totalElements === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getVisibleEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalElements);
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
      this.selectedMembers = this.paginatedMembers.map(m => m.id);
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
    this.allSelected = this.selectedMembers.length === this.paginatedMembers.length && this.paginatedMembers.length > 0;
  }

  viewMember(id: number): void {
    this.isLoadingViewMember = true;
    this.showViewMemberModal = true;
    this.viewingMember = null;
    this.memberService.getMemberById(id).subscribe({
      next: (member) => {
        this.isLoadingViewMember = false;
        if (!member) {
          this.toastService.error('Member not found.');
          this.closeViewMemberModal();
          return;
        }
        this.viewingMember = member;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingViewMember = false;
        console.error('Error loading member details', err);
        this.toastService.error(err.error?.message || 'Failed to load member details.');
        this.closeViewMemberModal();
        this.cdr.detectChanges();
      }
    });
  }

  closeViewMemberModal(): void {
    this.showViewMemberModal = false;
    this.viewingMember = null;
    this.isLoadingViewMember = false;
  }

  editMember(id: number): void {
    this.isLoadingMember = true;
    this.memberService.getMemberById(id).subscribe({
      next: (member) => {
        this.isLoadingMember = false;
        if (!member) {
          this.toastService.error('Member not found.');
          return;
        }

        this.isEditMode = true;
        this.editingMemberId = id;
        this.newMember = this.mapMemberResponseToForm(member);
        this.selectedFiles = {};
        this.aadharError = null;
        this.mobileError = null;
        this.emailError = null;
        this.steps.forEach(step => step.completed = true);
        this.showAddMemberModal = true;
        this.currentStep = 1;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingMember = false;
        console.error('Error loading member for edit', err);
        this.toastService.error(err.error?.message || 'Failed to load member details.');
        this.cdr.detectChanges();
      }
    });
  }

  private mapMemberResponseToForm(member: MemberResponse): Record<string, unknown> {
    return {
      title: member.title || '',
      fullName: member.name || '',
      gender: this.formatGenderForForm(member.gender),
      spouseOrFatherName: member.guardianName || '',
      dateOfBirth: member.dob || '',
      age: member.age ?? null,
      registrationDate: member.registrationDate || '',
      emailAddress: member.email || '',
      mobileNumber: member.mobileNumber || '',
      aadharNumber: member.aadharNumber || '',
      address: member.address || '',
      maritalStatus: member.maritalStatus || '',
      spouseName: member.introducedAs || '',
      accountNumber: member.bankAccountNumber || '',
      accountHolderName: member.bankAccountHolderName || '',
      bankName: member.bankName || '',
      branchName: member.bankBranch || '',
      ifscCode: member.bankIfsc || '',
      occupation: member.occupation || '',
      employeeType: member.employeeType || '',
      organization: member.organization || '',
      designation: member.designation || '',
      dateOfJoining: member.dateOfJoining || '',
      doorNo: member.doorNo || '',
      streetName: member.streetName || '',
      city: member.city || '',
      pincode: member.pincode || '',
      nomineeName: member.nomineeName || '',
      nomineeAge: member.nomineeAge ?? '',
      nomineeRelation: member.nomineeRelation || '',
      nomineeDoorNo: member.nomineeDoorNo || '',
      nomineeStreetName: member.nomineeStreetName || '',
      nomineeCity: member.nomineeCity || '',
      nomineeAddress: member.nomineeAddress || '',
      nomineePincode: member.nomineePincode || '',
      nomineeMobileNumber: member.nomineeMobileNumber || '',
      fillSubscriberAddress: member.fillSubscriberAddress || '',
      route: member.route || '',
      status: member.status || '',
      panCardNumber: member.panCardNumber || '',
      gstNumber: member.gstNumber || '',
      photoUrl: member.photoUrl || '',
      signatureUrl: member.signatureUrl || '',
      passbookUrl: member.passbookUrl || '',
    };
  }

  private formatGenderForForm(gender: string | null | undefined): string {
    if (!gender) {
      return '';
    }
    const normalized = gender.trim().toLowerCase();
    if (normalized === 'male') return 'Male';
    if (normalized === 'female') return 'Female';
    if (normalized === 'other') return 'Other';
    return gender;
  }

  onFileSelected(event: Event, fieldName: 'photo' | 'signature' | 'passbook'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!this.validateDocumentFile(file)) {
      input.value = '';
      return;
    }

    this.selectedFiles[fieldName] = file;
    this.uploadDocument(fieldName, file);
  }

  private validateDocumentFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.toastService.warning('Allowed file types: JPEG, PNG, WEBP, PDF.');
      return false;
    }
    if (file.size > maxSize) {
      this.toastService.warning('File size must not exceed 5 MB.');
      return false;
    }
    return true;
  }

  private uploadDocument(fieldName: 'photo' | 'signature' | 'passbook', file: File): void {
    this.uploadingDocuments[fieldName] = true;
    this.fileUploadService.uploadMemberDocument(file, fieldName).subscribe({
      next: (url) => {
        if (fieldName === 'photo') {
          this.newMember.photoUrl = url;
        } else if (fieldName === 'signature') {
          this.newMember.signatureUrl = url;
        } else {
          this.newMember.passbookUrl = url;
        }
        this.uploadingDocuments[fieldName] = false;
        this.toastService.success(`${this.formatDocumentLabel(fieldName)} uploaded successfully.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploadingDocuments[fieldName] = false;
        delete this.selectedFiles[fieldName];
        console.error('Document upload failed', err);
        this.toastService.error(err.error?.message || `Failed to upload ${this.formatDocumentLabel(fieldName).toLowerCase()}.`);
        this.cdr.detectChanges();
      }
    });
  }

  private formatDocumentLabel(fieldName: 'photo' | 'signature' | 'passbook'): string {
    if (fieldName === 'photo') return 'Photo';
    if (fieldName === 'signature') return 'Signature';
    return 'Passbook';
  }

  hasDocumentUrl(fieldName: 'photo' | 'signature' | 'passbook'): boolean {
    if (fieldName === 'photo') return !!this.newMember.photoUrl;
    if (fieldName === 'signature') return !!this.newMember.signatureUrl;
    return !!this.newMember.passbookUrl;
  }

  isDocumentUploading(fieldName: 'photo' | 'signature' | 'passbook'): boolean {
    return !!this.uploadingDocuments[fieldName];
  }

  onFillSubscriberAddressChange(): void {
    if (this.newMember.fillSubscriberAddress === 'Yes') {
      this.newMember.nomineeDoorNo = this.newMember.doorNo || '';
      this.newMember.nomineeStreetName = this.newMember.streetName || '';
      this.newMember.nomineeCity = this.newMember.city || '';
      this.newMember.nomineeAddress = this.newMember.address || '';
      this.newMember.nomineePincode = this.newMember.pincode || '';
      this.nomineePincodeError = null;
    }
  }

  onPanInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    input.value = normalized;
    this.newMember.panCardNumber = normalized;
    this.panError = null;
  }

  onGstInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value.toUpperCase().replace(/\s/g, '').slice(0, 15);
    input.value = normalized;
    this.newMember.gstNumber = normalized;
    this.gstError = null;
  }

  submitForm(): void {
    if (Object.values(this.uploadingDocuments).some(Boolean)) {
      this.toastService.warning('Please wait for document uploads to finish.');
      return;
    }

    if (!this.validateAllStepsBeforeSubmit()) {
      return;
    }

    const normalizedAadhar = this.normalizeAadhar(this.newMember.aadharNumber);
    const normalizedMobile = this.normalizeMobile(this.newMember.mobileNumber)!;
    const normalizedIfsc = this.normalizeIfsc(this.newMember.ifscCode);
    const normalizedPincode = this.normalizePincode(this.newMember.pincode);
    const normalizedNomineePincode = this.normalizePincode(this.newMember.nomineePincode);
    const parsedNomineeAge = this.parseNomineeAge(this.newMember.nomineeAge);
    const normalizedNomineeMobile = this.normalizeMobile(this.newMember.nomineeMobileNumber);
    const normalizedPan = this.normalizePan(this.newMember.panCardNumber);
    const normalizedGst = this.normalizeGst(this.newMember.gstNumber);

    const payload = {
      title: this.newMember.title || null,
      name: this.newMember.fullName.trim(), 
      guardianName: this.newMember.spouseOrFatherName.trim(),
      dob: this.newMember.dateOfBirth || null,
      age: this.newMember.age ? Number(this.newMember.age) : null,
      registrationDate: this.newMember.registrationDate || null, 
      gender: this.newMember.gender ? this.newMember.gender.toLowerCase() : null,
      mobileNumber: normalizedMobile, 
      email: this.newMember.emailAddress?.trim() || null,
      aadharNumber: normalizedAadhar,
      address: this.newMember.address || null,
      maritalStatus: this.newMember.maritalStatus || null,
      introducedAs: this.newMember.spouseName || null,
      
      photoUrl: this.newMember.photoUrl || null,
      signatureUrl: this.newMember.signatureUrl || null,
      passbookUrl: this.newMember.passbookUrl || null,
      
      bankAccountNumber: this.newMember.accountNumber || null,
      bankAccountHolderName: this.newMember.accountHolderName || null,
      bankName: this.newMember.bankName || null,
      bankBranch: this.newMember.branchName || null,
      bankIfsc: normalizedIfsc,
      occupation: this.newMember.occupation || null,
      employeeType: this.newMember.employeeType || null,
      organization: this.newMember.organization || null,
      designation: this.newMember.designation || null,
      dateOfJoining: this.newMember.dateOfJoining || null,
      doorNo: this.newMember.doorNo || null,
      streetName: this.newMember.streetName || null,
      city: this.newMember.city || null,
      pincode: normalizedPincode,
      nomineeName: this.newMember.nomineeName || null,
      nomineeAge: parsedNomineeAge,
      nomineeRelation: this.newMember.nomineeRelation || null,
      nomineeDoorNo: this.newMember.nomineeDoorNo || null,
      nomineeStreetName: this.newMember.nomineeStreetName || null,
      nomineeCity: this.newMember.nomineeCity || null,
      nomineeAddress: this.newMember.nomineeAddress || null,
      nomineePincode: normalizedNomineePincode,
      nomineeMobileNumber: normalizedNomineeMobile,
      fillSubscriberAddress: this.newMember.fillSubscriberAddress || null,
      route: this.newMember.route || null,
      panCardNumber: normalizedPan,
      gstNumber: normalizedGst,
      ...(this.isEditMode && this.newMember.status ? { status: this.newMember.status } : {}),
    };

    const saveObservable = this.isEditMode && this.editingMemberId
      ? this.memberService.updateMember(this.editingMemberId, payload)
      : this.memberService.createMember(payload);

    saveObservable.subscribe({
      next: () => {
        this.toastService.success(
          this.isEditMode ? 'Member updated successfully!' : 'Member added successfully!'
        );
        this.loadMembers();
        this.loadKpis();
        this.closeAddMemberModal();
      },
      error: (err: any) => {
        console.error('Save failed:', err);
        const msg = err.error?.message || 'Check console for details.';
        this.toastService.error(`Failed to ${this.isEditMode ? 'update' : 'save'} member: ${msg}`);
      }
    });
  }

  resetForm(): void {
    this.newMember = {};
    this.selectedFiles = {};
    this.uploadingDocuments = {};
    this.aadharError = null;
    this.mobileError = null;
    this.emailError = null;
    this.ifscError = null;
    this.pincodeError = null;
    this.nomineePincodeError = null;
    this.nomineeAgeError = null;
    this.nomineeMobileError = null;
    this.panError = null;
    this.gstError = null;
    this.isEditMode = false;
    this.editingMemberId = null;
    this.isLoadingMember = false;
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
    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 4:
        return this.validateStep4();
      case 6:
        return this.validateStep6();
      case 7:
        return this.validateStep7();
      default:
        return true;
    }
  }

  validateAllStepsBeforeSubmit(): boolean {
    const steps: Array<{ step: number; valid: () => boolean }> = [
      { step: 1, valid: () => this.validateStep1() },
      { step: 4, valid: () => this.validateStep4() },
      { step: 6, valid: () => this.validateStep6() },
      { step: 7, valid: () => this.validateStep7() },
    ];

    for (const item of steps) {
      if (!item.valid()) {
        this.currentStep = item.step;
        return false;
      }
    }

    return true;
  }

  validateStep1(): boolean {
    const name = (this.newMember.fullName || '').trim();
    const guardian = (this.newMember.spouseOrFatherName || '').trim();

    if (!name || !guardian || !this.newMember.registrationDate || !this.newMember.mobileNumber) {
      this.toastService.warning(
        'Please fill in all mandatory fields: Name, Father/Spouse Name, Registration Date, and Mobile Number.'
      );
      return false;
    }

    if (name.length < 2) {
      this.toastService.warning('Name must be at least 2 characters.');
      return false;
    }

    if (!this.validateMobileNumber()) {
      return false;
    }

    if (!this.validateEmailAddress()) {
      return false;
    }

    if (!this.validateAadharNumber()) {
      return false;
    }

    if (!this.validatePanNumber()) {
      return false;
    }

    if (!this.validateGstNumber()) {
      return false;
    }

    return true;
  }

  validateStep4(): boolean {
    return this.validateIfscCode();
  }

  validateStep6(): boolean {
    return this.validatePincodeField(this.newMember.pincode, 'pincodeError', 'Pincode');
  }

  validateStep7(): boolean {
    const pincodeValid = this.validatePincodeField(this.newMember.nomineePincode, 'nomineePincodeError', 'Nominee pincode');
    const ageValid = this.validateNomineeAge();
    const mobileValid = this.validateNomineeMobileNumber();
    return pincodeValid && ageValid && mobileValid;
  }

  canGoToStep(step: number): boolean {
    if (this.isEditMode) {
      return true;
    }
    return step <= this.currentStep;
  }

  onAadharInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 12);
    input.value = digitsOnly;
    this.newMember.aadharNumber = digitsOnly;
    this.aadharError = null;
  }

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = digitsOnly;
    this.newMember.mobileNumber = digitsOnly;
    this.mobileError = null;
  }

  onEmailInput(): void {
    this.emailError = null;
  }

  onIfscInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const normalized = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    input.value = normalized;
    this.newMember.ifscCode = normalized;
    this.ifscError = null;
  }

  onPincodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = digitsOnly;
    this.newMember.pincode = digitsOnly;
    this.pincodeError = null;
  }

  onNomineePincodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = digitsOnly;
    this.newMember.nomineePincode = digitsOnly;
    this.nomineePincodeError = null;
  }

  onNomineeAgeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 3);
    input.value = digitsOnly;
    this.newMember.nomineeAge = digitsOnly;
    this.nomineeAgeError = null;
  }

  onNomineeMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = digitsOnly;
    this.newMember.nomineeMobileNumber = digitsOnly;
    this.nomineeMobileError = null;
  }

  private normalizeAadhar(value: string | null | undefined): string | null {
    if (!value || !value.trim()) {
      return null;
    }
    const digits = value.replace(/\D/g, '');
    return digits.length ? digits : null;
  }

  private validateAadharNumber(): boolean {
    const aadhar = this.normalizeAadhar(this.newMember.aadharNumber);
    if (!aadhar) {
      this.aadharError = null;
      return true;
    }
    if (!/^\d{12}$/.test(aadhar)) {
      this.aadharError = 'Aadhaar number must be exactly 12 digits.';
      return false;
    }
    if (aadhar.startsWith('0') || aadhar.startsWith('1')) {
      this.aadharError = 'Invalid Aadhaar number.';
      return false;
    }
    this.aadharError = null;
    return true;
  }

  private normalizeMobile(value: string | null | undefined): string | null {
    if (!value || !value.trim()) {
      return null;
    }
    const digits = value.replace(/\D/g, '');
    return digits.length ? digits : null;
  }

  private validateMobileNumber(): boolean {
    const mobile = this.normalizeMobile(this.newMember.mobileNumber);
    if (!mobile) {
      this.mobileError = 'Mobile number is required.';
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      this.mobileError = 'Enter a valid 10-digit Indian mobile number (starts with 6–9).';
      return false;
    }
    this.mobileError = null;
    return true;
  }

  private validateEmailAddress(): boolean {
    const email = (this.newMember.emailAddress || '').trim();
    if (!email) {
      this.emailError = null;
      return true;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.emailError = 'Enter a valid email address.';
      return false;
    }
    this.emailError = null;
    return true;
  }

  private normalizePincode(value: string | null | undefined): string | null {
    if (!value || !value.trim()) {
      return null;
    }
    const digits = value.replace(/\D/g, '');
    return digits.length ? digits : null;
  }

  private normalizeIfsc(value: string | null | undefined): string | null {
    if (!value || !value.trim()) {
      return null;
    }
    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return normalized.length ? normalized : null;
  }

  private validateIfscCode(): boolean {
    const ifsc = this.normalizeIfsc(this.newMember.ifscCode);
    if (!ifsc) {
      this.ifscError = null;
      return true;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      this.ifscError = 'Enter a valid 11-character IFSC code (e.g. SBIN0001234).';
      return false;
    }
    this.ifscError = null;
    return true;
  }

  private validatePincodeField(
    value: string | null | undefined,
    errorField: 'pincodeError' | 'nomineePincodeError',
    label: string
  ): boolean {
    const pincode = this.normalizePincode(value);
    if (!pincode) {
      this[errorField] = null;
      return true;
    }
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      this[errorField] = `${label} must be a valid 6-digit Indian pincode.`;
      return false;
    }
    this[errorField] = null;
    return true;
  }

  private parseNomineeAge(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : NaN;
  }

  private validateNomineeAge(): boolean {
    const parsed = this.parseNomineeAge(this.newMember.nomineeAge);
    if (parsed === null) {
      this.nomineeAgeError = null;
      return true;
    }
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 120) {
      this.nomineeAgeError = 'Nominee age must be a whole number between 1 and 120.';
      return false;
    }
    this.nomineeAgeError = null;
    return true;
  }

  private validateNomineeMobileNumber(): boolean {
    const mobile = this.normalizeMobile(this.newMember.nomineeMobileNumber);
    if (!mobile) {
      this.nomineeMobileError = null;
      return true;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      this.nomineeMobileError = 'Enter a valid 10-digit Indian mobile number (starts with 6–9).';
      return false;
    }
    this.nomineeMobileError = null;
    return true;
  }

  private normalizePan(value: string | null | undefined): string | null {
    if (!value || !value.trim()) {
      return null;
    }
    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return normalized.length ? normalized : null;
  }

  private normalizeGst(value: string | null | undefined): string | null {
    if (!value || !value.trim()) {
      return null;
    }
    const normalized = value.toUpperCase().replace(/\s/g, '');
    return normalized.length ? normalized : null;
  }

  private validatePanNumber(): boolean {
    const pan = this.normalizePan(this.newMember.panCardNumber);
    if (!pan) {
      this.panError = null;
      return true;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      this.panError = 'PAN must be in format ABCDE1234F.';
      return false;
    }
    this.panError = null;
    return true;
  }

  private validateGstNumber(): boolean {
    const gst = this.normalizeGst(this.newMember.gstNumber);
    if (!gst) {
      this.gstError = null;
      return true;
    }
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gst)) {
      this.gstError = 'Enter a valid 15-character GST number.';
      return false;
    }
    this.gstError = null;
    return true;
  }
  
  previousStep(): void { 
    if (this.currentStep > 1) { 
      this.steps[this.currentStep - 1].completed = false; 
      this.currentStep--; 
    } 
  }
  
  goToStep(step: number): void {
    if (!this.canGoToStep(step)) {
      return;
    }
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
          this.toastService.success('Member deleted successfully.');
          this.loadMembers();
          this.loadKpis();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.toastService.error(err.error?.message || 'Failed to delete member.');
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