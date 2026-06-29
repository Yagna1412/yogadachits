import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  BidAdvanceService,
  BidAdvanceListItem,
  BidAdvanceFormDetails,
  BidAdvanceSaveRequest,
  EligibleEnrollmentOption
} from '../../service/bid-advance.service';
import { ChitGroupsService } from '../../service/chit-groups.service';

@Component({
  selector: 'app-bid-advance',
  imports: [CommonModule, FormsModule],
  templateUrl: './bid-advance.html',
  styleUrls: ['./bid-advance.scss']
})
export class BidAdvanceComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  showForm = false;
  searchTerm = '';
  isLoadingTable = false;
  isSaving = false;
  isLoadingForm = false;
  isLoadingGroups = false;
  isLoadingMembers = false;

  advances: BidAdvanceListItem[] = [];
  filteredAdvances: BidAdvanceListItem[] = [];
  newAdvance: Partial<BidAdvanceFormDetails> = {};

  chitGroups: any[] = [];
  groupMembers: EligibleEnrollmentOption[] = [];
  selectedGroupId: number | null = null;
  selectedEnrollmentId: number | null = null;

  loadError = '';
  apiError = '';
  successMessage = '';

  constructor(
    private bidAdvanceService: BidAdvanceService,
    private chitGroupsService: ChitGroupsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => this.loadData(), 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.resetFormState();
      setTimeout(() => this.loadChitGroups(), 0);
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.resetFormState();
  }

  private resetFormState(): void {
    this.newAdvance = {};
    this.selectedGroupId = null;
    this.selectedEnrollmentId = null;
    this.groupMembers = [];
    this.apiError = '';
    this.successMessage = '';
  }

  loadData(): void {
    this.isLoadingTable = true;
    this.loadError = '';
    this.cdr.detectChanges();

    this.bidAdvanceService.getAdvances()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingTable = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res?.success === false) {
              this.loadError = res.message || 'Unable to load bid advances.';
              this.advances = [];
              this.filteredAdvances = [];
            } else {
              this.advances = res?.data || [];
              this.filterAdvances();
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.loadError = err?.error?.message || 'Unable to load bid advances. Please ensure the backend is running on port 8080.';
            this.advances = [];
            this.filteredAdvances = [];
            this.cdr.detectChanges();
          });
        }
      });
  }

  loadChitGroups(): void {
    this.isLoadingGroups = true;
    this.apiError = '';
    this.cdr.detectChanges();

    this.chitGroupsService.getChitGroups(true)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingGroups = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.chitGroups = Array.isArray(res?.data) ? res.data : [];
            if (!this.chitGroups.length) {
              this.apiError = res?.message || 'No chit groups found. Please add groups in Chit Groups master.';
            }
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.apiError = 'Unable to load chit groups. Please ensure the backend is running on port 8080.';
            this.chitGroups = [];
            this.cdr.detectChanges();
          });
        }
      });
  }

  onGroupSelect(): void {
    this.selectedEnrollmentId = null;
    this.groupMembers = [];
    this.newAdvance = { transactionDate: this.today() };
    this.apiError = '';

    if (!this.selectedGroupId) {
      this.cdr.detectChanges();
      return;
    }

    const group = this.chitGroups.find(g => g.id === this.selectedGroupId);
    if (group) {
      this.newAdvance.groupName = group.groupName;
      this.newAdvance.series = group.companyChitNumber;
      this.newAdvance.chitAmount = group.chitAmount;
    }

    this.isLoadingMembers = true;
    this.cdr.detectChanges();

    this.bidAdvanceService.getEnrollmentsByChitGroup(this.selectedGroupId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingMembers = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.groupMembers = res?.success !== false ? (res?.data || []) : [];
            if (!this.groupMembers.length) {
              this.apiError = 'No active members found for this group.';
            }
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.apiError = 'Unable to load members for the selected group.';
            this.groupMembers = [];
            this.cdr.detectChanges();
          });
        }
      });
  }

  onEnrollmentSelect(): void {
    if (!this.selectedEnrollmentId) {
      return;
    }
    this.isLoadingForm = true;
    this.apiError = '';
    this.cdr.detectChanges();

    this.bidAdvanceService.getFormDetails(this.selectedEnrollmentId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoadingForm = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (!res?.success || !res.data) {
              this.apiError = res?.message || 'Unable to load member details.';
            } else {
              this.applyFormDetails(res.data);
            }
            this.cdr.detectChanges();
          });
        }
      });
  }

  private applyFormDetails(data: BidAdvanceFormDetails): void {
    this.newAdvance = {
      ...this.newAdvance,
      ...data,
      amount: data.amount ?? 0,
      advanceAmount: data.advanceAmount ?? 0,
      adjustmentAmount: data.adjustmentAmount ?? 0
    };
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  filterAdvances(): void {
    const q = (this.searchTerm || '').toLowerCase().trim();
    this.filteredAdvances = this.advances.filter(a =>
      !q ||
      (a.groupName && a.groupName.toLowerCase().includes(q)) ||
      (a.ticketNo && a.ticketNo.toLowerCase().includes(q)) ||
      (a.paidTo && a.paidTo.toLowerCase().includes(q))
    );
  }

  saveAdvance(): void {
    const amount = Number(this.newAdvance.amount);
    if (!this.selectedGroupId) {
      this.apiError = 'Please select a chit group.';
      return;
    }
    if (!this.newAdvance.enrollmentId) {
      this.apiError = 'Please select a member / ticket for the group.';
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      this.apiError = 'Please enter a valid amount.';
      return;
    }
    if (!this.newAdvance.transactionDate) {
      this.apiError = 'Please enter the transaction date.';
      return;
    }

    const payload: BidAdvanceSaveRequest = {
      enrollmentId: this.newAdvance.enrollmentId,
      groupName: this.newAdvance.groupName,
      ticketNo: this.newAdvance.ticketNo,
      paidTo: this.newAdvance.paidTo,
      series: this.newAdvance.series,
      no: this.newAdvance.no,
      transactionDate: this.newAdvance.transactionDate!,
      account: this.newAdvance.account || 'cash',
      amount,
      narration: this.newAdvance.narration,
      chequeNumber: this.newAdvance.chequeNumber,
      chequeDate: this.newAdvance.chequeDate,
      currentInstallmentNo: this.newAdvance.currentInstallmentNo,
      paidUpTo: this.newAdvance.paidUpTo,
      chitAmount: this.newAdvance.chitAmount != null ? Number(this.newAdvance.chitAmount) : undefined,
      companyCommission: this.newAdvance.companyCommission != null ? Number(this.newAdvance.companyCommission) : undefined,
      advanceAmount: this.newAdvance.advanceAmount != null ? Number(this.newAdvance.advanceAmount) : amount,
      adjustmentAmount: this.newAdvance.adjustmentAmount != null ? Number(this.newAdvance.adjustmentAmount) : 0,
      totalPaid: this.newAdvance.totalPaid != null ? Number(this.newAdvance.totalPaid) : undefined
    };

    this.isSaving = true;
    this.apiError = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.bidAdvanceService.saveAdvance(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (!res?.success || !res.data) {
              this.apiError = res?.message || 'Failed to save bid advance.';
            } else {
              this.showForm = false;
              this.resetFormState();
              this.loadData();
            }
            this.cdr.detectChanges();
          });
        }
      });
  }
}
