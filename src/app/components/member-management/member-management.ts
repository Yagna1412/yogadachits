import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  MemberManagementService,
  Member,
  MemberRemoval,
  MemberTransfer,
  MemberReallotment,
} from '../../service/member-management.service';

@Component({
  selector: 'app-member-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './member-management.html',
  styleUrls: ['./member-management.scss']
})
export class MemberManagementComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  showForm = false;
  operationType: 'removal' | 'transfer' | 'reallotment' = 'removal';
  searchTerm = '';
  searchGroup = '';
  searchStatus = '';

  newRemoval: MemberRemoval = this.initRemoval();
  newTransfer: MemberTransfer = this.initTransfer();
  newReallotment: MemberReallotment = this.initReallotment();

  submitted = false;
  fieldErrors: Record<string, string> = {};
  apiError = '';
  successMessage = '';
  isLoading = false;
  isSaving = false;
  loadError = '';

  allMembers: Member[] = [];

  filteredMembers: Member[] = [];
  paginatedMembers: Member[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  groups: string[] = [];
  agents: string[] = [];
  authorizedBy: string[] = [];
  addressTypes = ['Residential', 'Commercial', 'Business'];

  constructor(
    private memberManagementService: MemberManagementService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Minimal fix: defer load + force UI refresh after withFetch callback
    setTimeout(() => this.loadData(), 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get addButtonLabel(): string {
    if (this.operationType === 'transfer') return '+ Add Transfer';
    if (this.operationType === 'reallotment') return '+ Add Reallotment';
    return '+ Add Removal';
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private loadData(): void {
    this.isLoading = true;
    this.loadError = '';
    this.cdr.detectChanges();

    this.memberManagementService.getLookupOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res.success && res.data) {
              this.groups = res.data.groups ?? [];
              this.authorizedBy = res.data.authorizedBy ?? [];
              this.agents = res.data.agents ?? [];
            }
            this.cdr.detectChanges();
          });
        }
      });

    this.memberManagementService.getMembers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.allMembers = res.success && res.data ? res.data : [];
            this.filterMembers();
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.loadError = this.extractErrorMessage(err, 'Unable to load members. Please ensure the backend is running.');
            this.allMembers = [];
            this.filterMembers();
            this.cdr.detectChanges();
          });
        }
      });

  }

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
      mobile: ''
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

  clearValidation(): void {
    this.submitted = false;
    this.fieldErrors = {};
    this.apiError = '';
  }

  hasError(field: string): boolean {
    return this.submitted && !!this.fieldErrors[field];
  }

  getError(field: string): string {
    return this.fieldErrors[field] || '';
  }

  dismissApiError(): void {
    this.apiError = '';
  }

  dismissLoadError(): void {
    this.loadError = '';
  }

  openBlankForm(): void {
    this.clearValidation();
    this.successMessage = '';

    if (this.operationType === 'removal') {
      this.newRemoval = { ...this.initRemoval(), removalDate: this.today() };
    } else if (this.operationType === 'transfer') {
      this.newTransfer = { ...this.initTransfer(), transferDate: this.today() };
    } else {
      this.newReallotment = { ...this.initReallotment(), reallotmentDate: this.today() };
    }

    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForms();
    this.clearValidation();
    this.successMessage = '';
  }

  setOperationType(type: 'removal' | 'transfer' | 'reallotment'): void {
    this.operationType = type;
  }

  resetForms(): void {
    this.newRemoval = this.initRemoval();
    this.newTransfer = this.initTransfer();
    this.newReallotment = this.initReallotment();
  }

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
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredMembers.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedMembers = this.filteredMembers.slice(startIndex, startIndex + this.pageSize);
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
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get paginationEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredMembers.length);
  }

  openRemovalForm(member: Member): void {
    this.operationType = 'removal';
    this.clearValidation();
    this.successMessage = '';
    this.newRemoval = {
      groupName: member.groupName,
      ticketNo: member.ticketNo,
      subscriber: member.name,
      removalDate: this.today(),
      authorizedBy: '',
      reason: ''
    };
    this.showForm = true;
  }

  openTransferForm(member: Member): void {
    this.operationType = 'transfer';
    this.clearValidation();
    this.successMessage = '';
    this.newTransfer = {
      ...this.initTransfer(),
      groupName: member.groupName,
      ticketNo: member.ticketNo,
      subscriber: member.name,
      transferDate: this.today(),
      enrollDate: member.enrollDate || '',
      memberAddr: member.address || '',
      paidUpTo: member.paidUpTo || '',
      payable: member.payable || 0,
      paid: member.paid || 0,
      mobile: member.mobile
    };
    this.showForm = true;
  }

  openReallotmentForm(member: Member): void {
    this.operationType = 'reallotment';
    this.clearValidation();
    this.successMessage = '';
    this.newReallotment = {
      ...this.initReallotment(),
      groupName: member.groupName,
      ticketNumber: member.ticketNo,
      reallotmentDate: this.today(),
      enrollmentDate: member.enrollDate || '',
      address: member.address || '',
      subscriptionPayable: member.payable || 0,
      paidAmount: member.paid || 0,
      balanceAmount: (member.payable || 0) - (member.paid || 0)
    };
    this.showForm = true;
  }

  private setFieldError(field: string, message: string): void {
    this.fieldErrors[field] = message;
  }

  private validateRemovalForm(): boolean {
    this.fieldErrors = {};
    if (!this.newRemoval.groupName) {
      this.setFieldError('groupName', 'Please select a group.');
    }
    if (!this.newRemoval.ticketNo?.trim()) {
      this.setFieldError('ticketNo', 'Please enter the ticket number.');
    }
    if (!this.newRemoval.subscriber?.trim()) {
      this.setFieldError('subscriber', 'Please enter the subscriber name.');
    }
    if (!this.newRemoval.removalDate) {
      this.setFieldError('removalDate', 'Please select the removal date.');
    }
    if (!this.newRemoval.authorizedBy) {
      this.setFieldError('authorizedBy', 'Please select who authorized this removal.');
    }
    if (!this.newRemoval.reason?.trim()) {
      this.setFieldError('reason', 'Please enter a reason for removal.');
    }
    return Object.keys(this.fieldErrors).length === 0;
  }

  private validateTransferForm(): boolean {
    this.fieldErrors = {};
    if (!this.newTransfer.transferDate) {
      this.setFieldError('transferDate', 'Please select the transfer date.');
    }
    if (!this.newTransfer.groupName) {
      this.setFieldError('groupName', 'Please select the current group.');
    }
    if (!this.newTransfer.ticketNo?.trim()) {
      this.setFieldError('ticketNo', 'Please enter the ticket number.');
    }
    if (!this.newTransfer.subscriber?.trim()) {
      this.setFieldError('subscriber', 'Please enter the subscriber name.');
    }
    if (!this.newTransfer.transferTo) {
      this.setFieldError('transferTo', 'Please select the destination group.');
    }
    if (!this.newTransfer.transferee?.trim()) {
      this.setFieldError('transferee', 'Please enter the transferee name.');
    }
    if (!this.newTransfer.authorizedBy) {
      this.setFieldError('authorizedBy', 'Please select who authorized this transfer.');
    }
    if (!this.newTransfer.reason?.trim()) {
      this.setFieldError('reason', 'Please enter a reason for transfer.');
    }
    return Object.keys(this.fieldErrors).length === 0;
  }

  private validateReallotmentForm(): boolean {
    this.fieldErrors = {};
    if (!this.newReallotment.groupName) {
      this.setFieldError('groupName', 'Please select a group.');
    }
    if (!this.newReallotment.ticketNumber?.trim()) {
      this.setFieldError('ticketNumber', 'Please enter the ticket number.');
    }
    if (!this.newReallotment.bidder?.trim()) {
      this.setFieldError('bidder', 'Please enter the bidder name.');
    }
    if (!this.newReallotment.reallotmentDate) {
      this.setFieldError('reallotmentDate', 'Please select the reallotment date.');
    }
    if (!this.newReallotment.authorizedBy) {
      this.setFieldError('authorizedBy', 'Please select who authorized this reallotment.');
    }
    if (!this.newReallotment.reason?.trim()) {
      this.setFieldError('reason', 'Please enter a reason for reallotment.');
    }
    return Object.keys(this.fieldErrors).length === 0;
  }

  saveRemoval(): void {
    this.submitted = true;
    this.apiError = '';
    this.successMessage = '';

    if (!this.validateRemovalForm()) {
      this.cdr.detectChanges();
      return;
    }

    this.isSaving = true;
    this.memberManagementService.createRemoval(this.newRemoval)
      .pipe(finalize(() => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        });
      }))
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res.success) {
              this.successMessage = res.message || 'Member removed successfully.';
              this.loadData();
              setTimeout(() => this.closeForm(), 1500);
            } else {
              this.apiError = res.message || 'Unable to save removal.';
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.apiError = this.extractErrorMessage(err, 'Unable to save removal. Please verify the details.');
            this.cdr.detectChanges();
          });
        }
      });
  }

  saveTransfer(): void {
    this.submitted = true;
    this.apiError = '';
    this.successMessage = '';

    if (!this.validateTransferForm()) {
      this.cdr.detectChanges();
      return;
    }

    this.isSaving = true;
    this.memberManagementService.createTransfer(this.newTransfer)
      .pipe(finalize(() => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        });
      }))
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res.success) {
              this.successMessage = res.message || 'Member transferred successfully.';
              this.loadData();
              setTimeout(() => this.closeForm(), 1500);
            } else {
              this.apiError = res.message || 'Unable to save transfer.';
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.apiError = this.extractErrorMessage(err, 'Unable to save transfer. Please verify the details.');
            this.cdr.detectChanges();
          });
        }
      });
  }

  saveReallotment(): void {
    this.submitted = true;
    this.apiError = '';
    this.successMessage = '';

    if (!this.validateReallotmentForm()) {
      this.cdr.detectChanges();
      return;
    }

    this.isSaving = true;
    this.memberManagementService.createReallotment(this.newReallotment)
      .pipe(finalize(() => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        });
      }))
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res.success) {
              this.successMessage = res.message || 'Member reallocated successfully.';
              this.loadData();
              setTimeout(() => this.closeForm(), 1500);
            } else {
              this.apiError = res.message || 'Unable to save reallotment.';
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.apiError = this.extractErrorMessage(err, 'Unable to save reallotment. Please verify the details.');
            this.cdr.detectChanges();
          });
        }
      });
  }

  private extractErrorMessage(err: any, fallback: string): string {
    if (err?.error?.message) {
      return err.error.message;
    }
    if (typeof err?.error === 'string') {
      return err.error;
    }
    return fallback;
  }
}
