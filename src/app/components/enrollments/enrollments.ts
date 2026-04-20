import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EnrollmentsService,
  EnrollmentResponse,
  ApiResponse,
  EnrollmentPayload
} from '../../service/enrollments.service';
import { ChitGroupsService } from '../../service/chit-groups.service';
import { MemberService, MemberResponse } from '../../service/member.service';

interface EnrollmentChitGroupOption {
  id: number;
  groupName: string;
}

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enrollments.html',
  styleUrls: ['./enrollments.scss']
})
export class EnrollmentsComponent implements OnInit, AfterViewInit {

  isLoading = false;
  errorMessage = '';
  showAddModal = false;

  enrollments: EnrollmentResponse[] = [];
  filteredEnrollments: EnrollmentResponse[] = [];
  searchTerm = '';
  allSelected = false;
  selectedEnrollments: number[] = [];

  // Pagination & Sorting Flags
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  chitGroups: EnrollmentChitGroupOption[] = [];
  groupsLoading = false;

  membersList: MemberResponse[] = [];
  membersLoading = false;

  // Form Fields
  memberId: number | null = null;
  selectedGroupId: number | null = null;
  businessAgentId: number | null = null;
  collectionAgentId: number | null = null;

  saveError: string | null = null;
  saveSuccess: string | null = null;
  saving = false;

  // KPIs dynamically calculate based on the current 'enrollments' array.
  get totalEnrollments(): number {
    return this.enrollments.length;
  }

  get activeEnrollments(): number {
    return this.enrollments.filter(e => e.status?.toLowerCase() === 'active').length;
  }

  get totalGroups(): number {
    return new Set(this.enrollments.map(e => e.chitGroupId)).size;
  }

  get paginatedEnrollments(): EnrollmentResponse[] {
    let result = [...this.filteredEnrollments];

    // Apply Sorting
    result.sort((a: any, b: any) => {
      let valA = a[this.sortColumn] ? a[this.sortColumn] : '';
      let valB = b[this.sortColumn] ? b[this.sortColumn] : '';

      // Specifically handle exact mathematical numeric ordering on IDs so 10 isn't improperly alphabetized under 2
      if (this.sortColumn === 'id') {
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return this.sortDirection === 'asc' ? numA - numB : numB - numA;
        }
      }
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply Pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return result.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Pagination controls
  get totalPages(): number {
    return Math.ceil(this.filteredEnrollments.length / this.itemsPerPage);
  }

  get pages(): number[] {
    const total = this.totalPages;
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
    
    let start = Math.max(1, this.currentPage - 1);
    let end = Math.min(total, this.currentPage + 1);

    if (this.currentPage === 1) end = 3;
    else if (this.currentPage === total) start = total - 2;

    const p = [];
    for (let i = start; i <= end; i++) p.push(i);
    return p;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.resetSelection();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.resetSelection();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.resetSelection();
  }

  goToFirstPage(): void {
    this.currentPage = 1;
    this.resetSelection();
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.resetSelection();
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  private resetSelection() {
    this.allSelected = false;
    this.selectedEnrollments = [];
  }

  constructor(
    private enrollmentsService: EnrollmentsService,
    private chitGroupsService: ChitGroupsService,
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadEnrollments();
    this.loadChitGroups();
    this.loadMembers();
  }

  ngAfterViewInit(): void {
    // UI bindings can be explicitly loaded here if needed
  }

  loadEnrollments(): void {
    if (this.enrollments.length === 0) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    this.enrollmentsService.getEnrollments().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        if (Array.isArray(data)) {
          this.enrollments = data;
          this.filteredEnrollments = [...this.enrollments];
        } else {
          this.enrollments = [];
          this.filteredEnrollments = [];
          this.errorMessage = res?.message || 'Failed to load enrollments.';
        }
        this.isLoading = false;
        this.cdr.detectChanges(); // Manually flush explicitly so native `fetch` API doesn't maroon UI
      },
      error: () => {
        this.errorMessage = 'Failed to load enrollments. Please check the backend is running.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadChitGroups(): void {
    this.groupsLoading = true;

    this.chitGroupsService.getChitGroups().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        if (Array.isArray(data)) {
          this.chitGroups = data.map((group: any) => ({
            id: Number(group.id),
            groupName: group.groupName || group.name || `Group #${group.id}`
          }));
        } else {
          this.chitGroups = [];
        }
        this.groupsLoading = false;
      },
      error: () => {
        this.chitGroups = [];
        this.groupsLoading = false;
      }
    });
  }

  loadMembers(): void {
    this.membersLoading = true;

    this.memberService.getMembers().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        if (Array.isArray(data)) {
          this.membersList = data;
        } else {
          this.membersList = [];
        }
        this.membersLoading = false;
      },
      error: () => {
        this.membersList = [];
        this.membersLoading = false;
      }
    });
  }

  filterEnrollments(): void {
    const s = this.searchTerm.trim().toLowerCase();
    this.filteredEnrollments = this.enrollments.filter(e =>
      !s ||
      e.id?.toString()?.includes(s) ||
      e.memberName?.toLowerCase()?.includes(s) ||
      e.chitGroupName?.toLowerCase()?.includes(s) ||
      e.ticketNo?.toString()?.includes(s) ||
      e.status?.toLowerCase()?.includes(s)
    );
    this.currentPage = 1;
    this.resetSelection();
  }

  toggleSelectAll(event: any): void {
    this.allSelected = event.target.checked;
    this.selectedEnrollments = this.allSelected
      ? this.paginatedEnrollments.map(e => e.id) : [];
  }

  toggleSelection(id: number): void {
    const i = this.selectedEnrollments.indexOf(id);
    if (i > -1) {
      this.selectedEnrollments.splice(i, 1);
    } else {
      this.selectedEnrollments.push(id);
    }
    this.allSelected = this.selectedEnrollments.length === this.paginatedEnrollments.length && this.paginatedEnrollments.length > 0;
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.resetForm();
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.memberId = null;
    this.selectedGroupId = null;
    this.businessAgentId = null;
    this.collectionAgentId = null;
    this.saveError = null;
    this.saveSuccess = null;
    this.saving = false;
  }

  isFormValid(): boolean {
    return !!(this.memberId && this.selectedGroupId);
  }

  saveEnrollment(): void {
    this.saveError = null;
    this.saveSuccess = null;

    if (!this.memberId) {
      this.saveError = 'Please select a valid Member.';
      return;
    }
    if (!this.selectedGroupId) {
      this.saveError = 'Chit Group is required.';
      return;
    }

    const assignedMember = this.membersList.find(m => m.id === this.memberId);

    if (!assignedMember) {
      this.saveError = 'Selected Member could not be found.';
      return;
    }

    // Auto-generate Subscriber if missing!
    if (assignedMember.subscriberId === undefined || assignedMember.subscriberId === null) {
      this.saving = true;
      this.enrollmentsService.createSubscriberForMember(this.memberId, assignedMember.name).subscribe({
        next: (subRes: any) => {
          if (subRes && subRes.success && subRes.data) {
            // Update the locally cached member to now hold the newly created subscriber ID
            assignedMember.subscriberId = subRes.data.id;
            this._proceedWithEnrollment(assignedMember.subscriberId);
          } else {
            this.saving = false;
            this.saveError = subRes?.message || 'Failed to generate Subscriber ID automatically.';
          }
        },
        error: (err: any) => {
          this.saving = false;
          this.saveError = err?.error?.message || 'Error generating Subscriber ID automatically.';
        }
      });
      return;
    }

    this._proceedWithEnrollment(assignedMember.subscriberId);
  }

  private _proceedWithEnrollment(subscriberId: number): void {
    const payload: EnrollmentPayload = {
      subscriberId: subscriberId,
      memberId: this.memberId!,
      chitGroupId: this.selectedGroupId!,
      businessAgentId: this.businessAgentId || null,
      collectionAgentId: this.collectionAgentId || null
    };

    this.saving = true;
    this.enrollmentsService.createEnrollment(payload).subscribe({
      next: (res: any) => {
        this.saving = false;

        if (res && res.success === false) {
          this.saveError = res.message || 'Failed to create enrollment.';
        } else {
          // OPTIMISTIC UI: Instantly paint the new data directly onto the live DOM table to crush all latency perception
          const newRecord = res?.data || payload;
          const assignedMember = this.membersList.find(m => m.id === this.memberId);
          const assignedGroup = this.chitGroups.find(c => c.id === this.selectedGroupId);
          
          const displayObj: EnrollmentResponse = {
            id: newRecord.id || Date.now(),
            memberId: this.memberId!,
            memberName: assignedMember ? assignedMember.name : 'Recently Added',
            chitGroupId: this.selectedGroupId!,
            chitGroupName: assignedGroup ? assignedGroup.groupName : 'New Group',
            ticketNo: newRecord.ticketNo || 1,
            businessAgentId: this.businessAgentId || undefined,
            collectionAgentId: this.collectionAgentId || undefined,
            status: 'active'
          };

          this.enrollments.unshift(displayObj);
          this.filteredEnrollments = [...this.enrollments];

          // Instantaneously aggressively route to the paginated table overview
          this.currentPage = 1;
          this.sortColumn = 'id';
          this.sortDirection = 'desc';
          this.closeAddModal();
          this.loadEnrollments(); // Re-trigger quietly in background to ensure total server sync
        }
      },
      error: (err: any) => {
        this.saving = false;
        this.saveError = err?.error?.message || 'Error saving enrollment. Check console for details.';
        console.error('Enrollment Save Error:', err);
      }
    });
  }

  formatDate(d: string): string {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch { return d; }
  }
}
