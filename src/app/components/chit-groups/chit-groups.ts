import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChitGroupsService } from '../../service/chit-groups.service';
import { EnrollmentsService } from '../../service/enrollments.service';

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
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  statusFilter = '';
  isLoading = false;
  selectedGroupIds: Set<number> = new Set();
  isAllSelected = false;

  // Pagination & Sorting state
  currentPage = 1;
  pageSize = 10;
  sortColumn: keyof ChitGroup = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  newGroup: Partial<ChitGroup> = this.getEmptyForm();
  chitGroups: ChitGroup[] = [];

  constructor(
    private chitGroupService: ChitGroupsService,
    private enrollmentsService: EnrollmentsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadGroupsFromDatabase();
  }

  ngAfterViewInit(): void {
    // UI bindings can be explicitly loaded here
  }

  loadGroupsFromDatabase(): void {
    this.isLoading = true;
    // 1. Fetch all Chit Groups
    this.chitGroupService.getChitGroups().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          // 2. Fetch all Enrollments to calculate current members dynamically
          this.enrollmentsService.getEnrollments().subscribe({
            next: (enrollRes: any) => {
              const allEnrollments = enrollRes?.data || [];

              this.chitGroups = response.data.map((item: any) => {
                const activeMembersCount = allEnrollments.filter((e: any) =>
                  e.chitGroupId === item.id &&
                  e.status?.toLowerCase() === 'active'
                ).length;

                const maxMem = item.maxMembers || item.noOfInstallments || 0;
                const monthly = item.installmentAmount || 0;
                const commPct = item.companyCommissionPct || 0;
                const calculatedChitAmount = maxMem * monthly;
                const commissionValue = (calculatedChitAmount * commPct) / 100;
                const netPrizeAmount = calculatedChitAmount - commissionValue;

                return {
                  ...item,
                  id: item.id,
                  name: item.groupName || 'Unnamed Group',
                  chitAmount: item.chitAmount || 0,
                  calculatedChitAmount,
                  commissionValue,
                  netPrizeAmount,
                  status: item.status || 'Active',
                  tenure: item.noOfInstallments || 0,
                  monthlyAmount: monthly,
                  commission: commPct,
                  maxMembers: maxMem,
                  currentMembers: activeMembersCount,
                  auctionDay: item.auctionDay || 'N/A',
                  auctionSchedule: item.auctionDay ? `Day ${item.auctionDay}` : 'N/A'
                };
              });
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error fetching enrollments:', err);
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching groups:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredGroups(): ChitGroup[] {
    let filtered = this.chitGroups;

    if (this.searchTerm) {
      filtered = filtered.filter(
        (group) =>
          (group.name && group.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (group.id && group.id.toString().includes(this.searchTerm))
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(
        (group) => group.status && group.status.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }

    return filtered;
  }

  get paginatedGroups(): ChitGroup[] {
    // 1. Sort the filtered data
    const sorted = [...this.filteredGroups].sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // 2. Paginate the sorted data
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return sorted.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredGroups.length / this.pageSize);
  }

  sortBy(column: keyof ChitGroup): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1; // Reset to first page after sorting
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
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
    this.showAddGroupForm = !this.showAddGroupForm;
    if (!this.showAddGroupForm) {
      this.newGroup = this.getEmptyForm();
    }
  }

  setViewMode(mode: 'grid' | 'list'): void {
    console.log('Changing view mode to:', mode);
    this.viewMode = mode;
    this.cdr.detectChanges();
  }

  toggleAll(event: any): void {
    this.isAllSelected = event.target.checked;
    if (this.isAllSelected) {
      this.paginatedGroups.forEach(group => this.selectedGroupIds.add(group.id));
    } else {
      this.paginatedGroups.forEach(group => this.selectedGroupIds.delete(group.id));
    }
    this.cdr.detectChanges();
  }

  toggleSelection(groupId: number): void {
    if (this.selectedGroupIds.has(groupId)) {
      this.selectedGroupIds.delete(groupId);
    } else {
      this.selectedGroupIds.add(groupId);
    }
    
    // Update isAllSelected state
    const allOnPageSelected = this.paginatedGroups.every(group => this.selectedGroupIds.has(group.id));
    this.isAllSelected = allOnPageSelected;
    
    this.cdr.detectChanges();
  }

  createGroup(): void {
    if (this.isFormValid()) {
      const monthlyAmount =
        this.newGroup.installmentAmount ||
        Math.round((this.newGroup.chitAmount ?? 0) / (this.newGroup.noOfInstallments ?? 1));

      const formattedTime = this.newGroup.auctionTimeFrom ? `${this.newGroup.auctionTimeFrom}:00` : null;

      const membersToSave = (this.newGroup.maxMembers && this.newGroup.maxMembers > 0)
        ? this.newGroup.maxMembers
        : this.newGroup.noOfInstallments;

      const payload = {
        groupName: this.newGroup.name,
        companyChitNumber: this.newGroup.companyChitNumber || null,
        chitAmount: this.newGroup.chitAmount,
        noOfInstallments: this.newGroup.noOfInstallments,
        installmentAmount: monthlyAmount,
        commencementDate: this.newGroup.commencementDate,
        maxMembers: membersToSave,
        auctionsPerMonth: this.newGroup.auctionsPerMonth || 1,
        auctionDay: this.getAuctionDayNumber(this.newGroup.auctionDay as string),
        startDate: this.newGroup.startDate || this.newGroup.commencementDate,
        auctionTime: formattedTime,
        auctionType: this.newGroup.auctionType || 'Fixed',
        companyCommissionPct: this.newGroup.companyCommission || 5,
        penaltyNpsPct: this.newGroup.penaltyNps || 0,
        penaltyPsPct: this.newGroup.penaltyPs || 0,
        status: this.newGroup.status || 'Active',
        fdr: this.newGroup.fdrNumber ? {
          fdrNumber: this.newGroup.fdrNumber,
          fdrType: this.newGroup.fdrType,
          fdrAmount: this.newGroup.fdrAmount || 0
        } : null
      };

      this.chitGroupService.createChitGroup(payload).subscribe((response: any) => {
        if (response && response.success) {
          // Optimistically refresh the array and close the modal instantly without blocking alert wrappers
          const newId = response.data?.id || Date.now();
          const optimisticChitGroup: ChitGroup = {
            id: newId,
            name: this.newGroup.name || 'Unnamed',
            chitAmount: this.newGroup.chitAmount || 0,
            calculatedChitAmount: (this.newGroup.chitAmount || 0),
            commissionValue: 0,
            netPrizeAmount: (this.newGroup.chitAmount || 0),
            chitSeries: '',
            auctionType: this.newGroup.auctionType || 'Fixed',
            noOfInstallments: this.newGroup.noOfInstallments || 1,
            psoDate: '',
            psoNumber: '',
            commencementDate: this.newGroup.commencementDate || '',
            termDate: '',
            caNumber: '',
            caDate: '',
            enrollmentFee: 0,
            companyChitNumber: this.newGroup.companyChitNumber || '',
            noOfAuctionInstallments: 0,
            companyCommission: this.newGroup.companyCommission || 5,
            maxCeiling: 0,
            penaltyNps: this.newGroup.penaltyNps || 0,
            penaltyPs: this.newGroup.penaltyPs || 0,
            auctionsPerMonth: this.newGroup.auctionsPerMonth || 1,
            installmentAmount: monthlyAmount,
            auctionDate: '',
            auctionDay: this.newGroup.auctionDay?.toString() || '1',
            auctionTimeFrom: '',
            auctionTimeTo: '',
            dividendMonth: '',
            sendSms: false,
            fdrNumber: this.newGroup.fdrNumber || '',
            fdrType: this.newGroup.fdrType || '',
            fdrAmount: this.newGroup.fdrAmount || 0,
            fdrDate: '',
            numberOfMonths: 0,
            maturityDate: '',
            roiPerYear: 0,
            fdrMaturityAmount: 0,
            bankNameBranch: '',
            tenure: this.newGroup.noOfInstallments || 1,
            monthlyAmount: monthlyAmount,
            commission: this.newGroup.companyCommission || 5,
            currentMembers: 0, // Freshly created group obviously has 0
            maxMembers: membersToSave || 0,
            auctionSchedule: `Day ${this.newGroup.auctionDay || '1'}`,
            auctionTime: formattedTime || '',
            startDate: this.newGroup.startDate || this.newGroup.commencementDate || '',
            status: this.newGroup.status || 'Active'
          };
          
          this.chitGroups.unshift(optimisticChitGroup);

          this.currentPage = 1;
          this.sortColumn = 'id';
          this.sortDirection = 'desc';
          this.toggleAddGroupForm();
          this.loadGroupsFromDatabase(); // Background fetch syncs quietly securely
        } else {
          // Provide silent fallback or fail-soft logging rather than breaking UI flow
          console.error(response?.message || 'Failed to create group. Check inputs.');
        }
      });
    }
  }

  private getAuctionDayNumber(day: string): number {
    const days: { [key: string]: number } = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
      'Friday': 5, 'Saturday': 6, 'Sunday': 7
    };
    return days[day] || 1;
  }

  isFormValid(): boolean {
    return !!(
      this.newGroup.name &&
      this.newGroup.chitAmount &&
      this.newGroup.noOfInstallments &&
      this.newGroup.commencementDate
    );
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
      status: 'Active',
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
