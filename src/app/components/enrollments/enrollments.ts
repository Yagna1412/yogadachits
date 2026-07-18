import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import {

  EnrollmentsService,

  EnrollmentResponse,

  AgentOption,

  EnrollmentCreatePayload,

  EnrollmentUpdatePayload,

  ChitGroupEnrollmentSummary,

  InstallmentResponse,

  EnrollmentKpiSummary,

} from '../../service/enrollments.service';

import { ChitGroupsService } from '../../service/chit-groups.service';

import { MemberService, MemberResponse } from '../../service/member.service';

import { AuthService } from '../../service/auth';

import { ToastService } from '../../service/toast.service';



interface EnrollmentChitGroupOption {

  id: number;

  groupName: string;

  maxMembers?: number;

  noOfInstallments?: number;

}



@Component({

  selector: 'app-enrollments',

  standalone: true,

  imports: [CommonModule, FormsModule, ReactiveFormsModule],

  templateUrl: './enrollments.html',

  styleUrls: ['./enrollments.scss']

})

export class EnrollmentsComponent implements OnInit, OnDestroy {

  private platformId = inject(PLATFORM_ID);

  private destroy$ = new Subject<void>();

  private memberSearch$ = new Subject<string>();



  isLoading = false;

  showAddModal = false;

  showViewModal = false;

  showEditModal = false;

  isLoadingDetail = false;

  saving = false;



  enrollments: EnrollmentResponse[] = [];

  searchTerm = '';

  statusFilter = '';

  chitGroupFilter: number | null = null;

  dateFromFilter = '';

  dateToFilter = '';



  currentPage = 1;

  pageSize = 10;

  totalElements = 0;

  totalPages = 1;

  sortColumn = 'id';

  sortDirection: 'asc' | 'desc' = 'desc';



  chitGroups: EnrollmentChitGroupOption[] = [];

  groupsLoading = false;

  memberSearchResults: MemberResponse[] = [];

  membersSearching = false;

  agents: AgentOption[] = [];

  agentsLoading = false;



  canManageEnrollments = false;

  canApproveEnrollments = false;

  kpiSummary: EnrollmentKpiSummary | null = null;

  addForm!: FormGroup;

  addFormSubmitted = false;



  viewingEnrollment: EnrollmentResponse | null = null;

  viewingInstallments: InstallmentResponse[] = [];

  installmentsLoading = false;



  editingEnrollment: EnrollmentResponse | null = null;

  editForm = {

    businessAgentId: null as number | null,

    collectionAgentId: null as number | null,

    status: 'active',

    enrollmentFeePaid: false,

  };



  memberId: number | null = null;

  memberSearchTerm = '';

  showMemberDropdown = false;

  selectedGroupId: number | null = null;

  groupSummary: ChitGroupEnrollmentSummary | null = null;

  groupSummaryLoading = false;

  businessAgentId: number | null = null;

  collectionAgentId: number | null = null;

  enrollmentDate = '';

  enrollmentFeePaid = false;

  nomineeName = '';

  nomineeRelation = '';

  nomineeMobile = '';



  readonly statusOptions = [

    { value: '', label: 'All Status' },

    { value: 'active', label: 'Active' },

    { value: 'pending', label: 'Pending' },

    { value: 'inactive', label: 'Inactive' },

    { value: 'withdrawn', label: 'Withdrawn' },

    { value: 'suspended', label: 'Suspended' },

  ];



  readonly enrollmentStatusOptions = [

    { value: 'active', label: 'Active' },

    { value: 'pending', label: 'Pending' },

    { value: 'inactive', label: 'Inactive' },

    { value: 'withdrawn', label: 'Withdrawn' },

    { value: 'suspended', label: 'Suspended' },

  ];



  get totalEnrollments(): number {

    return this.kpiSummary?.totalEnrollments ?? this.totalElements;

  }



  get activeEnrollments(): number {

    return this.kpiSummary?.activeEnrollments ?? 0;

  }



  get pendingApprovalCount(): number {

    return this.kpiSummary?.pendingApprovalCount ?? 0;

  }



  get totalGroups(): number {

    return this.kpiSummary?.distinctChitGroups ?? 0;

  }



  get selectedGroupCapacityHint(): string {

    if (this.groupSummary) {

      const fee = this.groupSummary.enrollmentFee ?? 0;

      const feeText = fee > 0 ? ` | Enrollment fee: ₹${fee}` : '';

      return `Tickets: ${this.groupSummary.usedTickets}/${this.groupSummary.maxTickets} used (${this.groupSummary.availableTickets} available)${feeText}`;

    }

    if (!this.selectedGroupId) {

      return '';

    }

    const group = this.chitGroups.find(g => g.id === this.selectedGroupId);

    if (!group) {

      return '';

    }

    const max = group.maxMembers && group.maxMembers > 0

      ? group.maxMembers

      : (group.noOfInstallments ?? 0);

    return max > 0 ? `Max tickets: ${max}` : '';

  }



  get groupEnrollmentFee(): number {

    return this.groupSummary?.enrollmentFee ?? 0;

  }



  get selectedMemberLabel(): string {

    if (!this.memberId) {

      return '';

    }

    const member = this.memberSearchResults.find(m => m.id === this.memberId);

    return member ? `${member.name} (Mob: ${member.mobileNumber})` : '';

  }



  constructor(

    private enrollmentsService: EnrollmentsService,

    private chitGroupsService: ChitGroupsService,

    private memberService: MemberService,

    private authService: AuthService,

    private toastService: ToastService,

    private cdr: ChangeDetectorRef,

    private fb: FormBuilder

  ) { }



  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {

      return;

    }

    this.canManageEnrollments = this.authService.canManageEnrollments();

    this.canApproveEnrollments = this.authService.canApproveEnrollments();

    this.initAddForm();

    this.setupMemberSearch();

    this.loadKpiSummary();

    this.loadEnrollments();

    this.loadChitGroups();

    this.loadAgents();

  }



  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }



  private initAddForm(): void {

    const today = new Date().toISOString().substring(0, 10);

    this.addForm = this.fb.group({

      chitGroupId: [null, Validators.required],

      enrollmentDate: [today, Validators.required],

      listNo: [null, [Validators.min(1)]],

      routeName: ['', [Validators.maxLength(120)]],

      areaName: ['', [Validators.maxLength(80)]],

      businessAgentId: [null],

      collectionAgentId: [null],

      enrollmentFeePaid: [false],

      nomineeName: ['', [Validators.maxLength(120)]],

      nomineeRelation: ['', [Validators.maxLength(60)]],

      nomineeMobile: ['', [Validators.maxLength(20)]],

    });

  }



  private setupMemberSearch(): void {

    this.memberSearch$

      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))

      .subscribe(term => this.searchMembers(term));

  }



  loadKpiSummary(): void {

    this.enrollmentsService.getKpiSummary({

      status: this.statusFilter,

      chitGroupId: this.chitGroupFilter,

      dateFrom: this.dateFromFilter || null,

      dateTo: this.dateToFilter || null,

    }).subscribe({

      next: (kpi) => {

        this.kpiSummary = kpi;

        this.cdr.detectChanges();

      },

      error: () => {

        this.kpiSummary = null;

      }

    });

  }



  loadEnrollments(resetPage = false): void {

    if (resetPage) {

      this.currentPage = 1;

    }

    this.isLoading = true;



    this.enrollmentsService.getEnrollmentsPaged({

      page: this.currentPage - 1,

      size: this.pageSize,

      search: this.searchTerm,

      status: this.statusFilter,

      chitGroupId: this.chitGroupFilter,

      dateFrom: this.dateFromFilter || null,

      dateTo: this.dateToFilter || null,

      sortBy: this.mapSortColumn(this.sortColumn),

      sortDir: this.sortDirection,

    }).subscribe({

      next: (data) => {

        this.enrollments = data?.content ?? [];

        this.totalElements = data?.totalElements ?? 0;

        this.totalPages = Math.max(data?.totalPages ?? 1, 1);

        if (this.currentPage > this.totalPages) {

          this.currentPage = this.totalPages;

        }

        this.isLoading = false;

        this.cdr.detectChanges();

      },

      error: (err) => {

        this.enrollments = [];

        this.totalElements = 0;

        this.totalPages = 1;

        this.isLoading = false;

        this.toastService.error(this.resolveApiError(err, 'Failed to load enrollments.'));

        this.cdr.detectChanges();

      }

    });

  }



  loadChitGroups(): void {

    this.groupsLoading = true;

    this.chitGroupsService.getChitGroups().subscribe({

      next: (res: any) => {

        const data = res?.data || [];

        this.chitGroups = Array.isArray(data)

          ? data.map((group: any) => ({

            id: Number(group.id),

            groupName: group.groupName || group.name || `Group #${group.id}`,

            maxMembers: group.maxMembers,

            noOfInstallments: group.noOfInstallments,

          }))

          : [];

        this.groupsLoading = false;

      },

      error: () => {

        this.chitGroups = [];

        this.groupsLoading = false;

      }

    });

  }



  onMemberSearchInput(): void {

    this.showMemberDropdown = true;

    this.memberSearch$.next(this.memberSearchTerm.trim());

  }



  searchMembers(term: string): void {

    if (!term || term.length < 2) {

      this.memberSearchResults = [];

      this.membersSearching = false;

      return;

    }

    this.membersSearching = true;

    this.memberService.getMembersPaged({ page: 0, size: 20, search: term, sortBy: 'name', sortDir: 'asc' }).subscribe({

      next: (data) => {

        this.memberSearchResults = data?.content ?? [];

        this.membersSearching = false;

        this.cdr.detectChanges();

      },

      error: () => {

        this.memberSearchResults = [];

        this.membersSearching = false;

      }

    });

  }



  selectMember(member: MemberResponse): void {

    this.memberId = member.id;

    this.memberSearchTerm = `${member.name} (Mob: ${member.mobileNumber})`;

    this.showMemberDropdown = false;

    this.addForm.patchValue({

      routeName: member.route || '',

      areaName: member.city || '',

      nomineeName: member.nomineeName || this.addForm.get('nomineeName')?.value || '',

      nomineeRelation: member.nomineeRelation || this.addForm.get('nomineeRelation')?.value || '',

      nomineeMobile: member.nomineeMobileNumber || this.addForm.get('nomineeMobile')?.value || '',

    });

  }



  clearMemberSelection(): void {

    this.memberId = null;

    this.memberSearchTerm = '';

    this.memberSearchResults = [];

  }



  onGroupChange(): void {

    this.groupSummary = null;

    const groupId = this.addForm.get('chitGroupId')?.value as number | null;

    this.selectedGroupId = groupId;

    if (groupId == null) {

      return;

    }

    this.groupSummaryLoading = true;

    this.enrollmentsService.getChitGroupSummary(groupId).subscribe({

      next: (summary) => {

        this.groupSummary = summary;

        this.groupSummaryLoading = false;

        this.cdr.detectChanges();

      },

      error: () => {

        this.groupSummary = null;

        this.groupSummaryLoading = false;

      }

    });

  }



  loadAgents(): void {

    this.agentsLoading = true;

    this.enrollmentsService.getAgents().subscribe({

      next: (agents) => {

        this.agents = agents;

        this.agentsLoading = false;

      },

      error: () => {

        this.agents = [];

        this.agentsLoading = false;

      }

    });

  }



  onSearchChange(): void {

    this.loadEnrollments(true);

    this.loadKpiSummary();

  }



  onFilterChange(): void {

    this.loadEnrollments(true);

    this.loadKpiSummary();

  }



  sort(column: string): void {

    if (this.sortColumn === column) {

      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';

    } else {

      this.sortColumn = column;

      this.sortDirection = 'asc';

    }

    this.loadEnrollments(true);

  }



  getVisibleStartIndex(): number {

    return this.totalElements === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;

  }



  getVisibleEndIndex(): number {

    return Math.min(this.currentPage * this.pageSize, this.totalElements);

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



  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.loadEnrollments();

    }

  }



  nextPage(): void {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      this.loadEnrollments();

    }

  }



  goToPage(page: number): void {

    this.currentPage = page;

    this.loadEnrollments();

  }



  openAddModal(): void {

    this.showAddModal = true;

    this.resetAddForm();

  }



  closeAddModal(): void {

    this.showAddModal = false;

    this.resetAddForm();

  }



  resetAddForm(): void {

    this.memberId = null;

    this.memberSearchTerm = '';

    this.memberSearchResults = [];

    this.showMemberDropdown = false;

    this.selectedGroupId = null;

    this.groupSummary = null;

    this.addFormSubmitted = false;

    this.initAddForm();

    this.saving = false;

  }



  isFormValid(): boolean {

    return !!(this.memberId && this.addForm.valid);

  }



  isAddFieldInvalid(field: string): boolean {

    const control = this.addForm.get(field);

    return !!(control && control.invalid && (control.touched || this.addFormSubmitted));

  }



  saveEnrollment(): void {

    if (!this.canManageEnrollments) {

      this.toastService.warning('Only administrators and agents can add enrollments.');

      return;

    }

    if (!this.memberId) {

      this.toastService.error('Please select a member.');

      return;

    }

    if (!this.addForm.get('chitGroupId')?.value) {

      this.toastService.error('Please select a chit group.');

      return;

    }

    this.addFormSubmitted = true;

    if (this.addForm.invalid) {

      this.addForm.markAllAsTouched();

      this.toastService.error('Please fix validation errors in the form.');

      return;

    }



    const assignedMember = this.memberSearchResults.find(m => m.id === this.memberId);

    if (!assignedMember) {

      this.toastService.error('Selected member could not be found. Search and select again.');

      return;

    }



    if (assignedMember.subscriberId == null) {

      this.saving = true;

      this.enrollmentsService.createSubscriberForMember(this.memberId, assignedMember.name).subscribe({

        next: (subRes) => {

          if (subRes?.success && subRes.data?.id) {

            assignedMember.subscriberId = subRes.data.id;

            this.proceedWithEnrollment(subRes.data.id);

          } else {

            this.saving = false;

            this.toastService.error(subRes?.message || 'Failed to create subscriber for member.');

          }

        },

        error: (err) => {

          this.saving = false;

          this.toastService.error(this.resolveApiError(err, 'Failed to create subscriber for member.'));

        }

      });

      return;

    }



    this.proceedWithEnrollment(assignedMember.subscriberId);

  }



  private proceedWithEnrollment(subscriberId: number): void {

    const form = this.addForm.getRawValue();

    const nomineePayload = form.nomineeName?.trim()

      ? {

        nomineeName: form.nomineeName.trim(),

        nomineeRelation: form.nomineeRelation?.trim() || undefined,

        nomineeMobile: form.nomineeMobile?.trim() || undefined,

      }

      : undefined;



    const payload: EnrollmentCreatePayload = {

      subscriberId,

      chitGroupId: form.chitGroupId,

      businessAgentId: form.businessAgentId || null,

      collectionAgentId: form.collectionAgentId || null,

      enrollmentDate: form.enrollmentDate || null,

      enrollmentFeePaid: this.groupEnrollmentFee > 0 ? form.enrollmentFeePaid : true,

      listNo: form.listNo || null,

      routeName: form.routeName?.trim() || null,

      areaName: form.areaName?.trim() || null,

      nominee: nomineePayload,

    };



    this.saving = true;

    this.enrollmentsService.createEnrollment(payload).subscribe({

      next: (res) => {

        this.saving = false;

        if (res?.success === false) {

          this.toastService.error(res.message || 'Failed to create enrollment.');

          return;

        }

        this.toastService.success('Enrollment created successfully.');

        this.closeAddModal();

        this.loadEnrollments(true);

        this.loadKpiSummary();

      },

      error: (err) => {

        this.saving = false;

        this.toastService.error(this.resolveApiError(err, 'Failed to create enrollment.'));

      }

    });

  }



  viewEnrollment(id: number): void {

    this.showViewModal = true;

    this.viewingEnrollment = null;

    this.viewingInstallments = [];

    this.isLoadingDetail = true;

    this.installmentsLoading = true;



    this.enrollmentsService.getEnrollmentById(id).subscribe({

      next: (res) => {

        this.isLoadingDetail = false;

        if (!res?.success || !res.data) {

          this.toastService.error(res?.message || 'Enrollment not found.');

          this.closeViewModal();

          return;

        }

        this.viewingEnrollment = res.data;

        this.cdr.detectChanges();

      },

      error: (err) => {

        this.isLoadingDetail = false;

        this.toastService.error(this.resolveApiError(err, 'Failed to load enrollment.'));

        this.closeViewModal();

      }

    });



    this.enrollmentsService.getInstallmentsByEnrollmentId(id).subscribe({

      next: (res) => {

        this.installmentsLoading = false;

        this.viewingInstallments = res?.data ?? [];

        this.cdr.detectChanges();

      },

      error: () => {

        this.installmentsLoading = false;

        this.viewingInstallments = [];

      }

    });

  }



  closeViewModal(): void {

    this.showViewModal = false;

    this.viewingEnrollment = null;

    this.viewingInstallments = [];

    this.isLoadingDetail = false;

    this.installmentsLoading = false;

  }



  canApprove(enrollment: EnrollmentResponse): boolean {

    return this.canApproveEnrollments

      && enrollment.approvalStatus?.toUpperCase() === 'PENDING'

      && enrollment.status?.toLowerCase() !== 'active';

  }



  approveEnrollment(enrollment: EnrollmentResponse): void {

    if (!this.canApprove(enrollment)) {

      return;

    }

    this.saving = true;

    this.enrollmentsService.approveEnrollment(enrollment.id).subscribe({

      next: (res) => {

        this.saving = false;

        if (res?.success === false) {

          this.toastService.error(res.message || 'Failed to approve enrollment.');

          return;

        }

        this.toastService.success('Enrollment approved and activated.');

        if (this.viewingEnrollment?.id === enrollment.id && res.data) {

          this.viewingEnrollment = res.data;

        }

        this.loadEnrollments();

        this.loadKpiSummary();

        this.cdr.detectChanges();

      },

      error: (err) => {

        this.saving = false;

        this.toastService.error(this.resolveApiError(err, 'Failed to approve enrollment.'));

      }

    });

  }



  rejectEnrollment(enrollment: EnrollmentResponse): void {

    if (!this.canApprove(enrollment)) {

      return;

    }

    const reason = prompt('Rejection reason (optional):') ?? '';

    this.saving = true;

    this.enrollmentsService.rejectEnrollment(enrollment.id, reason || undefined).subscribe({

      next: (res) => {

        this.saving = false;

        if (res?.success === false) {

          this.toastService.error(res.message || 'Failed to reject enrollment.');

          return;

        }

        this.toastService.success('Enrollment rejected.');

        this.closeViewModal();

        this.loadEnrollments();

        this.loadKpiSummary();

      },

      error: (err) => {

        this.saving = false;

        this.toastService.error(this.resolveApiError(err, 'Failed to reject enrollment.'));

      }

    });

  }



  downloadAgreement(enrollment: EnrollmentResponse): void {

    this.enrollmentsService.downloadAgreementPdf(enrollment.id).subscribe({

      next: (blob) => {

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;

        link.download = `enrollment-${enrollment.id}-agreement.pdf`;

        link.click();

        window.URL.revokeObjectURL(url);

      },

      error: (err) => {

        this.toastService.error(this.resolveApiError(err, 'Failed to download agreement PDF.'));

      }

    });

  }



  openEditModal(enrollment: EnrollmentResponse): void {

    if (!this.canManageEnrollments) {

      this.toastService.warning('Only administrators and agents can edit enrollments.');

      return;

    }

    this.editingEnrollment = enrollment;

    this.editForm = {

      businessAgentId: enrollment.businessAgentId ?? null,

      collectionAgentId: enrollment.collectionAgentId ?? null,

      status: enrollment.status || 'active',

      enrollmentFeePaid: enrollment.enrollmentFeePaid ?? false,

    };

    this.showEditModal = true;

  }



  closeEditModal(): void {

    this.showEditModal = false;

    this.editingEnrollment = null;

    this.saving = false;

  }



  saveEdit(): void {

    if (!this.editingEnrollment) {

      return;

    }

    const payload: EnrollmentUpdatePayload = {

      businessAgentId: this.editForm.businessAgentId,

      collectionAgentId: this.editForm.collectionAgentId,

      status: this.editForm.status,

      enrollmentFeePaid: this.editForm.enrollmentFeePaid,

    };



    this.saving = true;

    this.enrollmentsService.updateEnrollment(this.editingEnrollment.id, payload).subscribe({

      next: (res) => {

        this.saving = false;

        if (res?.success === false) {

          this.toastService.error(res.message || 'Failed to update enrollment.');

          return;

        }

        this.toastService.success('Enrollment updated successfully.');

        this.closeEditModal();

        this.loadEnrollments();

      },

      error: (err) => {

        this.saving = false;

        this.toastService.error(this.resolveApiError(err, 'Failed to update enrollment.'));

      }

    });

  }



  deleteEnrollment(enrollment: EnrollmentResponse): void {

    if (!this.canManageEnrollments) {

      this.toastService.warning('Only administrators and agents can delete enrollments.');

      return;

    }

    const label = `${enrollment.memberName || 'Member'} (#${enrollment.ticketNo})`;

    if (!confirm(`Delete enrollment for ${label}? This cannot be undone.`)) {

      return;

    }



    this.enrollmentsService.deleteEnrollment(enrollment.id).subscribe({

      next: (res) => {

        if (res?.success === false) {

          this.toastService.error(res.message || 'Failed to delete enrollment.');

          return;

        }

        this.toastService.success('Enrollment deleted successfully.');

        this.loadEnrollments();

        this.loadKpiSummary();

      },

      error: (err) => {

        this.toastService.error(this.resolveApiError(err, 'Failed to delete enrollment.'));

      }

    });

  }



  formatDate(d: string | undefined): string {

    if (!d) {

      return '—';

    }

    try {

      return new Date(d).toLocaleDateString('en-IN', {

        day: 'numeric', month: 'short', year: 'numeric'

      });

    } catch {

      return d;

    }

  }



  formatCurrency(amount: number | undefined): string {

    if (amount == null) {

      return '—';

    }

    return `₹${amount.toLocaleString('en-IN')}`;

  }



  formatStatusLabel(status: string | null | undefined): string {

    if (!status) {

      return '—';

    }

    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  }



  private resolveApiError(err: any, fallback: string): string {

    if (err?.status === 0) {

      return 'Cannot reach the backend API. Start the server: cd chitfunds-backend && mvn spring-boot:run';

    }

    if (err?.status === 401) {

      return 'Session expired. Please log in again.';

    }

    if (err?.status === 403) {

      return 'Access denied. You do not have permission for this action.';

    }

    return err?.error?.message || fallback;

  }



  private mapSortColumn(column: string): string {

    const allowed = ['id', 'ticketNo', 'status', 'enrollmentDate', 'createdAt'];

    return allowed.includes(column) ? column : 'id';

  }

}


