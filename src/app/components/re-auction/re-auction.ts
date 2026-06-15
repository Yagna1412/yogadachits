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
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, finalize, skip, takeUntil } from 'rxjs/operators';
import {
  ReAuctionService,
  ReAuctionDetailsResponse,
  EligibleMember,
  PastAuction,
  PreviousWinnerInfo,
  ReAuctionPreviewResponse,
} from '../../service/reauction.service';

@Component({
  selector: 'app-re-auction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './re-auction.html',
  styleUrl: './re-auction.scss',
})
export class ReAuctionComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();

  showConfirmModal = false;
  showSuccessModal = false;

  isLoading = false;
  isSaving = false;
  isPreviewLoading = false;
  loadError = '';
  saveError = '';

  auctionId: number | null = null;
  chitGroupId: number | null = null;
  chitGroupName = '';
  status = '';
  failureReason = '';

  previous: PreviousWinnerInfo = {
    ticket: '',
    name: '',
    bidAmount: 0,
    auctionDate: '',
    netPayable: 0,
  };

  eligibleMembers: EligibleMember[] = [];
  pastAuctions: PastAuction[] = [];

  newWinnerEnrollmentId: number | null = null;
  newBid = 0;

  preview: ReAuctionPreviewResponse | null = null;

  constructor(
    private reAuctionService: ReAuctionService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    setTimeout(() => this.loadFromRoute(), 0);

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter((event) => event.urlAfterRedirects.includes('/admin/re-auction')),
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadFromRoute();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFromRoute(): void {
    const params = this.route.snapshot.queryParams;
    const auctionId = params['auctionId'] ? Number(params['auctionId']) : null;
    const chitGroupId = params['chitGroupId'] ? Number(params['chitGroupId']) : null;
    this.loadDetails(auctionId, chitGroupId);
  }

  loadDetails(auctionId: number | null, chitGroupId: number | null): void {
    this.isLoading = true;
    this.loadError = '';
    this.saveError = '';
    this.cdr.detectChanges();

    const request$ = auctionId
      ? this.reAuctionService.getReAuctionDetails(auctionId)
      : chitGroupId
        ? this.reAuctionService.getReAuctionDetailsByChitGroup(chitGroupId)
        : this.reAuctionService.getLatestEligibleReAuction();

    request$.pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (!res?.success || !res.data) {
            this.loadError = res?.message || 'No eligible auction found for re-auction.';
          } else {
            this.applyDetails(res.data);
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.loadError =
            err?.error?.message ||
            'Unable to load re-auction details. Please ensure the backend is running on port 8080.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  private applyDetails(data: ReAuctionDetailsResponse): void {
    this.auctionId = data.auctionId;
    this.chitGroupId = data.chitGroupId;
    this.chitGroupName = data.chitGroupName;
    this.status = data.status;
    this.failureReason = data.failureReason;
    this.previous = data.previousWinner;
    this.eligibleMembers = data.eligibleMembers || [];
    this.pastAuctions = data.pastAuctions || [];
    this.newWinnerEnrollmentId = null;
    this.newBid = 0;
    this.preview = null;
    this.saveError = '';
    this.loadError = '';
  }

  get selectedMemberName(): string {
    const member = this.eligibleMembers.find(
      (m) => m.enrollmentId === this.newWinnerEnrollmentId
    );
    return member?.memberName || '';
  }

  formatCurrency(amount: number): string {
    const value = Number(amount ?? 0);
    return (
      '₹' +
      value.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  }

  formatSignedCurrency(amount: number): string {
    const value = Number(amount ?? 0);
    const prefix = value > 0 ? '+' : '';
    return prefix + this.formatCurrency(value);
  }

  get computedNetPayable(): number {
    if (this.preview?.netPayable != null) {
      return this.preview.netPayable;
    }
    return this.previous.netPayable - (this.newBid - this.previous.bidAmount);
  }

  get bidDifference(): number {
    if (this.preview?.bidDifference != null) {
      return this.preview.bidDifference;
    }
    return this.newBid - this.previous.bidAmount;
  }

  get payableDifference(): number {
    if (this.preview?.payableDifference != null) {
      return this.preview.payableDifference;
    }
    return this.computedNetPayable - this.previous.netPayable;
  }

  onMemberOrBidChange(): void {
    this.preview = null;
    this.saveError = '';

    if (!this.auctionId || !this.newWinnerEnrollmentId || !this.newBid) {
      this.cdr.detectChanges();
      return;
    }

    this.isPreviewLoading = true;
    this.cdr.detectChanges();

    this.reAuctionService
      .previewReAuction({
        auctionId: this.auctionId,
        newWinnerEnrollmentId: this.newWinnerEnrollmentId,
        newBidAmount: this.newBid,
      })
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isPreviewLoading = false;
            this.cdr.detectChanges();
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res?.success && res.data) {
              this.preview = res.data;
            }
            this.cdr.detectChanges();
          });
        },
      });
  }

  openConfirmModal(): void {
    this.saveError = '';

    if (!this.auctionId || !this.newWinnerEnrollmentId || !this.newBid) {
      this.saveError = 'Please select a member and enter a bid amount.';
      this.cdr.detectChanges();
      return;
    }

    if (this.preview) {
      this.showConfirmModal = true;
      this.cdr.detectChanges();
      return;
    }

    this.reAuctionService
      .previewReAuction({
        auctionId: this.auctionId,
        newWinnerEnrollmentId: this.newWinnerEnrollmentId,
        newBidAmount: this.newBid,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (!res?.success || !res.data) {
              this.saveError = res?.message || 'Unable to preview re-auction.';
            } else {
              this.preview = res.data;
              this.showConfirmModal = true;
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.saveError = err?.error?.message || 'Unable to preview re-auction.';
            this.cdr.detectChanges();
          });
        },
      });
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.cdr.detectChanges();
  }

  confirmReAuction(): void {
    if (!this.auctionId || !this.newWinnerEnrollmentId || !this.newBid) {
      return;
    }

    this.isSaving = true;
    this.saveError = '';
    this.cdr.detectChanges();

    this.reAuctionService
      .confirmReAuction({
        auctionId: this.auctionId,
        newWinnerEnrollmentId: this.newWinnerEnrollmentId,
        newBidAmount: this.newBid,
        reason: this.failureReason || 'Admin Cancellation',
      })
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (!res?.success) {
              this.saveError = res?.message || 'Failed to confirm re-auction.';
              this.cdr.detectChanges();
              return;
            }

            this.showConfirmModal = false;
            this.showSuccessModal = true;
            this.loadDetails(this.auctionId, this.chitGroupId);

            setTimeout(() => {
              this.showSuccessModal = false;
              this.cdr.detectChanges();
            }, 3000);
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.saveError = err?.error?.message || 'Failed to confirm re-auction.';
            this.cdr.detectChanges();
          });
        },
      });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.loadDetails(this.auctionId, this.chitGroupId);
  }

  goBack(): void {
    this.router.navigate(['/admin/auctions']);
  }

  viewAuction(auctionId: number): void {
    this.router.navigate(['/admin/auctions/view', auctionId]);
  }

  printAuction(auctionId?: number): void {
    if (auctionId) {
      this.router.navigate(['/admin/auctions/view', auctionId]);
      return;
    }
    window.print();
  }
}
