import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChitGroupsService } from '../../service/chit-groups.service';
import { AuthService } from '../../service/auth';
import { ToastService } from '../../service/toast.service';

export interface ChitGroup {
  id: number;
  name: string;
  chitAmount: number;
  calculatedChitAmount: number;
  commissionValue: number;
  netPrizeAmount: number;
  chitSeries: string;
  auctionType: string;
  noOfInstallments: number;
  psoDate: string;
  psoNumber: string;
  commencementDate: string;
  termDate: string;
  caNumber: string;
  caDate: string;
  enrollmentFee: number;
  companyChitNumber: string;
  noOfAuctionInstallments: number;
  companyCommission: number;
  maxCeiling: number;
  penaltyNps: number;
  penaltyPs: number;
  auctionsPerMonth: number;
  installmentAmount: number;
  auctionDate: string;
  auctionDay: string;
  auctionTimeFrom: string;
  auctionTimeTo: string;
  dividendMonth: string;
  sendSms: boolean;
  fdrNumber: string;
  fdrType: string;
  fdrAmount: number;
  fdrDate: string;
  numberOfMonths: number;
  maturityDate: string;
  roiPerYear: number;
  fdrMaturityAmount: number;
  bankNameBranch: string;
  tenure: number;
  monthlyAmount: number;
  commission: number;
  currentMembers: number;
  maxMembers: number;
  auctionSchedule: string;
  auctionTime: string;
  startDate: string;
  status: string;
}

@Component({
  selector: 'app-chit-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chit-groups.html',
  styleUrl: './chit-groups.scss',
})
export class ChitGroupsComponent implements OnInit, AfterViewInit {
  showAddGroupForm = false;
  isEditMode = false;
  editingGroupId: number | null = null;
  isLoadingGroup = false;
  showViewGroupModal = false;
  viewingGroup: any = null;
  isLoadingViewGroup = false;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  statusFilter = '';

  // Pagination & Sorting state
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 1;
  sortColumn: keyof ChitGroup = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  newGroup: Partial<ChitGroup> = this.getEmptyForm();
  chitGroups: ChitGroup[] = [];
  isLoading = false;
  isSaving = false;
  nameError: string | null = null;
  chitAmountError: string | null = null;
  installmentsError: string | null = null;
  commencementDateError: string | null = null;
  maxMembersError: string | null = null;
  commissionError: string | null = null;

  readonly statusOptions = [
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' },
  ];

  currentStep = 1;
  totalSteps = 4;
  steps = [
    { number: 1, title: 'General Info', completed: false },
    { number: 2, title: 'Company Info', completed: false },
    { number: 3, title: 'Auction Info', completed: false },
    { number: 4, title: 'FDR Info', completed: false },
  ];

  canManageChitGroups = false;

  constructor(
    private chitGroupService: ChitGroupsService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.canManageChitGroups = this.authService.canManageChitGroups();
    this.loadGroupsFromDatabase();
  }

  ngAfterViewInit(): void {
    // UI bindings can be explicitly loaded here
  }

  loadGroupsFromDatabase(resetPage = false): void {
    if (resetPage) {
      this.currentPage = 1;
    }

    this.isLoading = true;
    this.chitGroupService.getChitGroupsPaged({
      page: this.currentPage - 1,
      size: this.pageSize,
      search: this.searchTerm,
      status: this.statusFilter,
      sortBy: this.mapSortColumn(this.sortColumn),
      sortDir: this.sortDirection,
    }).subscribe({
      next: (data) => {
        const groups = data?.content ?? [];
        this.chitGroups = groups.map((item: any) => this.mapGroupItem(item));
        this.totalElements = data?.totalElements ?? 0;
        this.totalPages = Math.max(data?.totalPages ?? 1, 1);
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading chit groups', err);
        this.chitGroups = [];
        this.totalElements = 0;
        this.totalPages = 1;
        this.isLoading = false;
        this.toastService.error(this.resolveApiError(err, 'Failed to load chit groups.'));
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(): void {
    this.loadGroupsFromDatabase(true);
  }

  onStatusFilterChange(): void {
    this.loadGroupsFromDatabase(true);
  }

  private mapSortColumn(column: keyof ChitGroup): string {
    const mapping: Partial<Record<keyof ChitGroup, string>> = {
      id: 'id',
      name: 'groupName',
      status: 'status',
      chitAmount: 'chitAmount',
      tenure: 'noOfInstallments',
      startDate: 'commencementDate',
      maxMembers: 'maxMembers',
    };
    return mapping[column] ?? 'id';
  }

  private mapGroupItem(item: any): ChitGroup {
    const activeMembersCount = item.activeMemberCount ?? 0;

    const maxMem = item.maxMembers || item.noOfInstallments || 0;
    const monthly = Number(item.installmentAmount) || 0;
    const commPct = Number(item.companyCommissionPct) || 0;
    const calculatedChitAmount = maxMem * monthly;
    const commissionValue = (calculatedChitAmount * commPct) / 100;
    const netPrizeAmount = calculatedChitAmount - commissionValue;

    const weekday = item.auctionSchedule?.auctionWeekday ?? item.auctionDay;
    const weekdayLabel = this.formatAuctionWeekday(weekday);

    return {
      ...item,
      id: item.id,
      name: item.groupName || 'Unnamed Group',
      chitAmount: item.chitAmount || 0,
      calculatedChitAmount,
      commissionValue,
      netPrizeAmount,
      status: item.status || 'ACTIVE',
      tenure: item.noOfInstallments || 0,
      monthlyAmount: monthly,
      commission: commPct,
      maxMembers: maxMem,
      currentMembers: activeMembersCount,
      chitSeries: item.regulatory?.chitSeries || '',
      psoDate: item.regulatory?.psoDate || '',
      psoNumber: item.regulatory?.psoNo || '',
      termDate: item.regulatory?.termEndDate || '',
      caNumber: item.regulatory?.caNo || '',
      caDate: item.regulatory?.caDate || '',
      enrollmentFee: item.regulatory?.enrollmentFee || 0,
      maxCeiling: item.regulatory?.maxCeilingPct || 0,
      noOfAuctionInstallments: item.noOfAuctionInstallments || 0,
      auctionTimeFrom: item.auctionSchedule?.timeFrom || '',
      auctionTimeTo: item.auctionSchedule?.timeTo || '',
      dividendMonth: item.auctionSchedule?.dividendMonth?.toString() || '',
      sendSms: item.auctionSchedule?.smsOnCreate ?? false,
      fdrNumber: item.fdr?.fdrNumber || '',
      fdrType: item.fdr?.fdrType || '',
      fdrAmount: item.fdr?.fdrAmount || 0,
      fdrDate: item.fdr?.startDate || '',
      maturityDate: item.fdr?.maturityDate || '',
      roiPerYear: item.fdr?.roiPct || 0,
      numberOfMonths: item.fdr?.numberOfMonths || 0,
      bankNameBranch: item.fdr?.bankName || '',
      auctionDay: weekdayLabel,
      auctionSchedule: weekdayLabel !== 'N/A' ? weekdayLabel : 'N/A'
    } as ChitGroup;
  }

  private buildRegulatoryPayload(): Record<string, unknown> | null {
    const hasData = !!(
      this.newGroup.chitSeries ||
      this.newGroup.psoNumber ||
      this.newGroup.psoDate ||
      this.newGroup.caNumber ||
      this.newGroup.caDate ||
      this.newGroup.termDate ||
      this.newGroup.enrollmentFee ||
      this.newGroup.maxCeiling
    );
    if (!hasData) {
      return null;
    }
    return {
      chitSeries: this.newGroup.chitSeries || null,
      psoNo: this.newGroup.psoNumber || null,
      psoDate: this.newGroup.psoDate || null,
      caNo: this.newGroup.caNumber || null,
      caDate: this.newGroup.caDate || null,
      termEndDate: this.newGroup.termDate || null,
      enrollmentFee: this.newGroup.enrollmentFee ?? null,
      maxCeilingPct: this.newGroup.maxCeiling ?? null,
    };
  }

  private buildAuctionSchedulePayload(auctionWeekday: number | null): Record<string, unknown> | null {
    const timeFrom = this.normalizeTimeValue(this.newGroup.auctionTimeFrom);
    const timeTo = this.normalizeTimeValue(this.newGroup.auctionTimeTo);
    const dividendMonth = this.parseDividendMonth(this.newGroup.dividendMonth);
    const hasData = !!(
      auctionWeekday ||
      timeFrom ||
      timeTo ||
      dividendMonth ||
      this.newGroup.sendSms === true
    );
    if (!hasData) {
      return null;
    }
    return {
      auctionWeekday,
      timeFrom,
      timeTo,
      dividendMonth,
      smsOnCreate: this.newGroup.sendSms === true,
    };
  }

  private buildFdrPayload(): Record<string, unknown> | null {
    const hasData = !!(
      this.newGroup.fdrNumber ||
      this.newGroup.fdrType ||
      this.newGroup.fdrAmount ||
      this.newGroup.fdrDate ||
      this.newGroup.maturityDate ||
      this.newGroup.roiPerYear ||
      this.newGroup.numberOfMonths ||
      this.newGroup.bankNameBranch
    );
    if (!hasData) {
      return null;
    }
    return {
      fdrNumber: this.newGroup.fdrNumber || null,
      fdrType: this.newGroup.fdrType || 'FDR',
      fdrAmount: this.newGroup.fdrAmount ?? null,
      bankName: this.newGroup.bankNameBranch || null,
      startDate: this.newGroup.fdrDate || null,
      maturityDate: this.newGroup.maturityDate || null,
      roiPct: this.newGroup.roiPerYear ?? null,
      numberOfMonths: this.newGroup.numberOfMonths ?? null,
    };
  }

  private normalizeTimeValue(value: string | undefined): string | null {
    if (!value) {
      return null;
    }
    return value.length >= 5 ? value.substring(0, 5) : value;
  }

  private parseDividendMonth(value: string | undefined): number | null {
    if (!value || !value.trim()) {
      return null;
    }
    const parsed = Number(value.replace(/\D/g, ''));
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 12) {
      return null;
    }
    return parsed;
  }

  private formatAuctionWeekday(weekday: number | null | undefined): string {
    const labels = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!weekday || weekday < 1 || weekday > 7) {
      return 'N/A';
    }
    return labels[weekday];
  }

  sortBy(column: keyof ChitGroup): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadGroupsFromDatabase(true);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadGroupsFromDatabase();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadGroupsFromDatabase();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadGroupsFromDatabase();
    }
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

  toggleAddGroupForm(): void {
    if (this.showAddGroupForm) {
      this.closeForm();
    } else {
      this.openAddForm();
    }
  }

  openAddForm(): void {
    this.isEditMode = false;
    this.editingGroupId = null;
    this.isLoadingGroup = false;
    this.newGroup = this.getEmptyForm();
    this.clearValidationErrors();
    this.resetSteps();
    this.showAddGroupForm = true;
  }

  closeForm(): void {
    this.showAddGroupForm = false;
    this.isEditMode = false;
    this.editingGroupId = null;
    this.isLoadingGroup = false;
    this.newGroup = this.getEmptyForm();
    this.clearValidationErrors();
    this.resetSteps();
  }

  editGroup(id: number): void {
    if (!this.canManageChitGroups) {
      this.toastService.warning('Only administrators can edit chit groups.');
      return;
    }
    this.isEditMode = true;
    this.editingGroupId = id;
    this.showAddGroupForm = true;
    this.isLoadingGroup = true;
    this.currentStep = 1;
    this.clearValidationErrors();

    this.chitGroupService.getChitGroupById(id).subscribe({
      next: (response) => {
        this.isLoadingGroup = false;
        if (!response?.success || !response.data) {
          this.toastService.error(response?.message || 'Chit group not found.');
          this.closeForm();
          return;
        }
        this.newGroup = this.mapApiResponseToForm(response.data);
        this.steps.forEach(step => step.completed = true);
        this.currentStep = 1;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingGroup = false;
        this.toastService.error(err.error?.message || 'Failed to load chit group.');
        this.closeForm();
        this.cdr.detectChanges();
      }
    });
  }

  viewGroup(id: number): void {
    this.showViewGroupModal = true;
    this.viewingGroup = null;
    this.isLoadingViewGroup = true;

    this.chitGroupService.getChitGroupById(id).subscribe({
      next: (response) => {
        this.isLoadingViewGroup = false;
        if (!response?.success || !response.data) {
          this.toastService.error(response?.message || 'Chit group not found.');
          this.closeViewGroupModal();
          return;
        }
        this.viewingGroup = this.mapGroupItem(response.data);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingViewGroup = false;
        this.toastService.error(err.error?.message || 'Failed to load chit group.');
        this.closeViewGroupModal();
        this.cdr.detectChanges();
      }
    });
  }

  closeViewGroupModal(): void {
    this.showViewGroupModal = false;
    this.viewingGroup = null;
    this.isLoadingViewGroup = false;
  }

  deleteGroup(id: number, name?: string): void {
    if (!this.canManageChitGroups) {
      this.toastService.warning('Only administrators can delete chit groups.');
      return;
    }
    const label = name ? `"${name}"` : 'this chit group';
    if (!confirm(`Delete ${label}? This cannot be undone.`)) {
      return;
    }

    this.chitGroupService.deleteChitGroup(id).subscribe({
      next: (response) => {
        if (response?.success) {
          this.toastService.success('Chit group deleted successfully.');
          this.loadGroupsFromDatabase();
        } else {
          this.toastService.error(response?.message || 'Failed to delete chit group.');
        }
      },
      error: (err) => {
        this.toastService.error(this.resolveApiError(err, 'Failed to delete chit group.'));
      }
    });
  }

  formatStatusLabel(status: string | null | undefined): string {
    if (!status) {
      return '—';
    }
    const normalized = status.trim().toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  private mapApiResponseToForm(item: any): Partial<ChitGroup> {
    const weekday = item.auctionSchedule?.auctionWeekday ?? item.auctionDay;
    return {
      name: item.groupName || '',
      chitAmount: Number(item.chitAmount) || 0,
      chitSeries: item.regulatory?.chitSeries || '',
      maxMembers: item.maxMembers || 0,
      auctionType: item.auctionType || '',
      noOfInstallments: item.noOfInstallments || 0,
      psoDate: item.regulatory?.psoDate || '',
      psoNumber: item.regulatory?.psoNo || '',
      commencementDate: item.commencementDate || '',
      termDate: item.regulatory?.termEndDate || '',
      caNumber: item.regulatory?.caNo || '',
      caDate: item.regulatory?.caDate || '',
      enrollmentFee: item.regulatory?.enrollmentFee || 0,
      companyChitNumber: item.companyChitNumber || '',
      noOfAuctionInstallments: item.noOfAuctionInstallments || 0,
      companyCommission: Number(item.companyCommissionPct) || 0,
      maxCeiling: item.regulatory?.maxCeilingPct || 0,
      penaltyNps: Number(item.penaltyNpsPct) || 0,
      penaltyPs: Number(item.penaltyPsPct) || 0,
      auctionsPerMonth: item.auctionsPerMonth || 1,
      installmentAmount: Number(item.installmentAmount) || 0,
      auctionDate: item.auctionDate || '',
      auctionDay: this.weekdayNumberToName(weekday),
      auctionTimeFrom: item.auctionSchedule?.timeFrom || '',
      auctionTimeTo: item.auctionSchedule?.timeTo || '',
      dividendMonth: item.auctionSchedule?.dividendMonth?.toString() || '',
      sendSms: item.auctionSchedule?.smsOnCreate ?? false,
      fdrNumber: item.fdr?.fdrNumber || '',
      fdrType: item.fdr?.fdrType || '',
      fdrAmount: item.fdr?.fdrAmount || 0,
      fdrDate: item.fdr?.startDate || '',
      numberOfMonths: item.fdr?.numberOfMonths || 0,
      maturityDate: item.fdr?.maturityDate || '',
      roiPerYear: item.fdr?.roiPct || 0,
      bankNameBranch: item.fdr?.bankName || '',
      startDate: item.startDate || '',
      status: item.status || 'UPCOMING',
    };
  }

  private weekdayNumberToName(weekday: number | null | undefined): string {
    const labels = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!weekday || weekday < 1 || weekday > 7) {
      return '';
    }
    return labels[weekday];
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  saveGroup(): void {
    if (!this.validateAllStepsBeforeSubmit()) {
      return;
    }

    const payload = this.buildSavePayload();
    this.isSaving = true;

    const request$ = this.isEditMode && this.editingGroupId
      ? this.chitGroupService.updateChitGroup(this.editingGroupId, payload)
      : this.chitGroupService.createChitGroup(payload);

    request$.subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response?.success) {
          this.toastService.success(
            this.isEditMode ? 'Chit group updated successfully.' : 'Chit group created successfully.'
          );
          this.closeForm();
          this.loadGroupsFromDatabase();
        } else {
          this.toastService.error(response?.message || 'Failed to save chit group.');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Save group failed', err);
        this.toastService.error(this.resolveApiError(err, 'Failed to save chit group.'));
        this.cdr.detectChanges();
      }
    });
  }

  private buildSavePayload(): Record<string, unknown> {
    const installments = Number(this.newGroup.noOfInstallments);
    const chitAmount = Number(this.newGroup.chitAmount);
    const monthlyAmount = this.newGroup.installmentAmount && this.newGroup.installmentAmount > 0
      ? Number(this.newGroup.installmentAmount)
      : Math.round(chitAmount / installments);

    const formattedTime = this.newGroup.auctionTimeFrom ? `${this.newGroup.auctionTimeFrom}:00` : null;
    const membersToSave = (this.newGroup.maxMembers && this.newGroup.maxMembers > 0)
      ? this.newGroup.maxMembers
      : installments;

    const auctionWeekday = this.newGroup.auctionDay
      ? this.getAuctionDayNumber(this.newGroup.auctionDay as string)
      : null;

    return {
      groupName: (this.newGroup.name || '').trim(),
      companyChitNumber: this.newGroup.companyChitNumber || null,
      chitAmount,
      noOfInstallments: installments,
      installmentAmount: monthlyAmount,
      commencementDate: this.newGroup.commencementDate,
      maxMembers: membersToSave,
      auctionsPerMonth: this.newGroup.auctionsPerMonth || 1,
      auctionDay: auctionWeekday,
      auctionDate: this.newGroup.auctionDate || null,
      startDate: this.newGroup.startDate || this.newGroup.commencementDate,
      auctionTime: formattedTime,
      auctionType: this.newGroup.auctionType || 'Fixed',
      companyCommissionPct: this.newGroup.companyCommission ?? 5,
      penaltyNpsPct: this.newGroup.penaltyNps || 0,
      penaltyPsPct: this.newGroup.penaltyPs || 0,
      noOfAuctionInstallments: this.newGroup.noOfAuctionInstallments || null,
      status: (this.newGroup.status || 'UPCOMING').toUpperCase(),
      regulatory: this.buildRegulatoryPayload(),
      auctionSchedule: this.buildAuctionSchedulePayload(auctionWeekday),
      fdr: this.buildFdrPayload(),
    };
  }

  createGroup(): void {
    this.saveGroup();
  }

  private getAuctionDayNumber(day: string): number {
    const days: { [key: string]: number } = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
      'Friday': 5, 'Saturday': 6, 'Sunday': 7
    };
    return days[day] || 1;
  }

  canSubmit(): boolean {
    const name = (this.newGroup.name || '').trim();
    return !!(
      name.length >= 2 &&
      Number(this.newGroup.chitAmount) > 0 &&
      Number(this.newGroup.noOfInstallments) >= 1 &&
      this.newGroup.commencementDate
    );
  }

  validateForm(): boolean {
    this.clearValidationErrors();
    return this.runFullValidation();
  }

  validateStep1(): boolean {
    this.nameError = null;
    this.chitAmountError = null;
    this.installmentsError = null;
    this.commencementDateError = null;
    this.maxMembersError = null;

    const name = (this.newGroup.name || '').trim();
    const chitAmount = Number(this.newGroup.chitAmount);
    const installments = Number(this.newGroup.noOfInstallments);
    const maxMembers = Number(this.newGroup.maxMembers);

    if (!name) {
      this.nameError = 'Group name is required.';
    } else if (name.length < 2) {
      this.nameError = 'Group name must be at least 2 characters.';
    }

    if (!chitAmount || chitAmount <= 0) {
      this.chitAmountError = 'Chit amount must be greater than 0.';
    }

    if (!installments || installments < 1) {
      this.installmentsError = 'Number of installments must be at least 1.';
    }

    if (!this.newGroup.commencementDate) {
      this.commencementDateError = 'Commencement date is required.';
    }

    if (maxMembers > 0 && installments > 0 && maxMembers > installments) {
      this.maxMembersError = 'Max members cannot exceed number of installments.';
    }

    if (chitAmount > 0 && installments > 0) {
      const monthly = this.newGroup.installmentAmount && this.newGroup.installmentAmount > 0
        ? Number(this.newGroup.installmentAmount)
        : Math.round(chitAmount / installments);
      const expectedTotal = monthly * installments;
      if (Math.abs(expectedTotal - chitAmount) > 1) {
        this.chitAmountError = `Chit amount must equal monthly installment × tenure (expected ₹${expectedTotal}).`;
      }
    }

    const hasErrors = !!(this.nameError || this.chitAmountError || this.installmentsError
      || this.commencementDateError || this.maxMembersError);

    if (hasErrors) {
      this.toastService.warning('Please complete all required general information fields.');
    }

    return !hasErrors;
  }

  validateStep2(): boolean {
    this.commissionError = null;
    const commission = Number(this.newGroup.companyCommission);

    if (commission < 0 || commission > 100) {
      this.commissionError = 'Commission must be between 0 and 100.';
      this.toastService.warning('Please fix the commission percentage.');
      return false;
    }

    return true;
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      default:
        return true;
    }
  }

  validateAllStepsBeforeSubmit(): boolean {
    if (!this.validateStep1()) {
      this.currentStep = 1;
      return false;
    }
    if (!this.validateStep2()) {
      this.currentStep = 2;
      return false;
    }
    return true;
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

  canGoToStep(step: number): boolean {
    if (this.isEditMode) {
      return true;
    }
    return step <= this.currentStep;
  }

  resetSteps(): void {
    this.currentStep = 1;
    this.steps.forEach(step => step.completed = false);
  }

  private runFullValidation(): boolean {
    const step1Valid = this.validateStep1();
    const step2Valid = this.validateStep2();
    return step1Valid && step2Valid;
  }

  onChitAmountOrInstallmentsChange(): void {
    const chitAmount = Number(this.newGroup.chitAmount);
    const installments = Number(this.newGroup.noOfInstallments);
    if (chitAmount > 0 && installments > 0 && (!this.newGroup.installmentAmount || this.newGroup.installmentAmount <= 0)) {
      this.newGroup.installmentAmount = Math.round(chitAmount / installments);
    }
    this.chitAmountError = null;
    this.installmentsError = null;
  }

  clearValidationErrors(): void {
    this.nameError = null;
    this.chitAmountError = null;
    this.installmentsError = null;
    this.commencementDateError = null;
    this.maxMembersError = null;
    this.commissionError = null;
  }

  getComputedInstallmentAmount(): number {
    const chitAmount = Number(this.newGroup.chitAmount);
    const installments = Number(this.newGroup.noOfInstallments);
    if (this.newGroup.installmentAmount && this.newGroup.installmentAmount > 0) {
      return Number(this.newGroup.installmentAmount);
    }
    if (chitAmount > 0 && installments > 0) {
      return Math.round(chitAmount / installments);
    }
    return 0;
  }

  private resolveApiError(err: any, fallback: string): string {
    if (err?.status === 403) {
      return 'Access denied. You do not have permission for this action.';
    }
    return err?.error?.message || fallback;
  }

  private getEmptyForm(): Partial<ChitGroup> {
    return {
      name: '',
      chitAmount: 0,
      noOfInstallments: 0,
      commencementDate: '',
      auctionDay: '',
      companyCommission: 5,
      maxMembers: 0,
      auctionsPerMonth: 1,
      status: 'UPCOMING',
    };
  }

  formatCurrency(amount: number | undefined | null): string {
    if (amount === undefined || amount === null) return '0';
    try {
      return new Intl.NumberFormat('en-IN').format(amount);
    } catch (e) {
      return '0';
    }
  }
}
