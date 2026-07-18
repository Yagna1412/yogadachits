import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import {
  AuctionsService,
  AuctionResponse,
  AuctionBidResponse,
  AuctionSessionResponse,
  AuctionNotifyResultResponse,
  EnrollmentResponse,
  ChitGroupDto,
  ApiResponse,
} from '../../service/auction.service';
import { AuthService } from '../../service/auth';
import { ToastService } from '../../service/toast.service';

interface AuctionItem {
  id              : number;
  auctionNumber   : number;
  groupName       : string;
  auctionDate     : string;
  chitGroupId     : number;
  chitAmount      : number;
  maxMembers      : number;  
  commissionPct   : number;  
  winningBidId   ?: number;
  winningBidAmount?: number;
  bidLossAmount  ?: number;
  dividendPerMember?: number;
  netPayable     ?: number;
    status: string;
    approvalStatus?: string;
    approvedByName?: string;
    rejectionReason?: string;
}

interface BidRow {
  ticketNumber : string;
  enrollmentId : number;
  subscriber   : string;
  bidAmount    : number;
  bidId        : number | null;
  isWinning    : boolean;
  channel      : string;
  status       : 'No Bid' | 'Bid Paid' | 'Highest Bid';
}

interface Header {
  auctionNumber  : number;
  groupName      : string;
  currentAuction : number;
  totalAuctions  : number;
  auctionDate    : string;
  totalMembers   : number;
  maxMembers     : number; 
}

interface Calc {
  chitAmount          : number;
  winningBid          : number;
  bidLoss             : number;
  commissionPct       : number;
  commissionAmount    : number;
  dividendPerMember   : number;
  netPayable          : number;
}

@Component({
  selector    : 'app-auctions',
  standalone  : true,
  imports     : [CommonModule, FormsModule],
  templateUrl : './auctions.html',
  styleUrl    : './auctions.scss',
})
export class AuctionsComponent implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  isLoading          = false;
  isSubmittingBid    = false;
  isConfirmingWinner = false;
  isSendingIntimation = false;
  lastIntimationResult: AuctionNotifyResultResponse | null = null;
  showConfirmModal   = false;
  showSuccessModal   = false;
  errorMessage       = '';
  isGenerating       = false;
  kpiSummary: {
    totalAuctions: number;
    upcomingAuctions: number;
    todaysAuctions: number;
    completedAuctions: number;
    liveSessions: number;
    pendingWinnerConfirmation: number;
    distinctChitGroups: number;
  } | null = null;

  // Data arrays
  chitGroups      : ChitGroupDto[] = [];
  allAuctions     : AuctionItem[] = [];
  groupAuctions   : AuctionItem[] = []; 
  bids            : BidRow[]      = [];
  
  // Timer state
  timerValue: number = 0;
  timerInterval: any;
  isTimerRunning = false;
  auctionLocked = true;

  get canConductAuction(): boolean { return this.auth.canManageAuctions(); }
  get canConfirmWinner(): boolean { return this.auth.canConfirmAuctionWinner(); }
  get canSubmitBids(): boolean { return this.canConductAuction && this.isTimerRunning && !this.auctionLocked; }
  get canGenerateSchedule(): boolean { return this.auth.canConfirmAuctionWinner(); }
  get isWinnerPendingApproval(): boolean {
    return this.selected?.approvalStatus?.toUpperCase() === 'PENDING'
      || this.selected?.status === 'pending_approval';
  }
  get isWinnerApproved(): boolean {
    return !!this.selected?.winningBidId
      && (this.selected?.approvalStatus?.toUpperCase() === 'APPROVED'
        || this.selected?.status === 'processing_payout');
  }

  // Selections
  selectedGroupId : number | null = null;
  selected        : AuctionItem | null = null;

  // List filters (server-side)
  statusFilter    = '';
  searchTerm      = '';
  dateFrom        = '';
  dateTo          = '';
  hasWinnerFilter = '';
  totalAuctionElements = 0;

  readonly statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'processing_payout', label: 'Processing Payout' },
  ];

  readonly winnerFilterOptions = [
    { value: '', label: 'All Auctions' },
    { value: 'false', label: 'No Winner Yet' },
    { value: 'true', label: 'Has Winner' },
  ];

  header: Header = {
    auctionNumber: 0, groupName: '', currentAuction: 0,
    totalAuctions: 0, auctionDate: '', totalMembers: 0, maxMembers: 0
  };

  calc: Calc = {
    chitAmount: 0, winningBid: 0, bidLoss: 0,
    commissionPct: 5, commissionAmount: 0,
    dividendPerMember: 0, netPayable: 0,
  };

  get highestBid(): BidRow | undefined { return this.bids.find(b => b.status === 'Highest Bid'); }

  constructor(
    private svc: AuctionsService,
    private auth: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      this.loadKpis();
      this.loadPage();
    }, 0);
  }

  private loadKpis(): void {
    this.svc.getKpiSummary(this.selectedGroupId).subscribe({
      next: (res) => {
        this.kpiSummary = res.data ?? null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.kpiSummary = null;
      },
    });
  }

  generateAuctionSchedule(): void {
    if (!this.canGenerateSchedule) {
      this.errorMessage = 'Only administrators can generate the auction schedule.';
      return;
    }
    if (!this.selectedGroupId) {
      this.errorMessage = 'Select a chit group first.';
      return;
    }
    this.isGenerating = true;
    this.errorMessage = '';
    this.svc.generateAuctionsForGroup(this.selectedGroupId).subscribe({
      next: (res) => {
        this.isGenerating = false;
        if (res.data && res.data.length > 0) {
          this.svc.clearAuctionsCache();
          this.loadKpis();
          this.loadGroupAuctions(true);
        } else {
          this.errorMessage = res.message ?? 'Could not generate auction schedule.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isGenerating = false;
        this.errorMessage = 'Failed to generate auction schedule.';
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy(): void {
    this.stopLocalTimer();
    this.svc.disconnectFromAuction();
  }

  startAuction(): void {
    if (!this.canConductAuction) {
      this.errorMessage = 'Only administrators and agents can start an auction.';
      return;
    }
    if (this.isTimerRunning || !this.selected) return;
    this.svc.startAuction(this.selected.id).subscribe({
      next: (res) => {
        if (res.data) {
          this.handleSessionUpdate(res.data);
        }
      }
    });
  }

  stopAuction(): void {
    this.stopLocalTimer();
    this.isTimerRunning = false;
    this.auctionLocked = true;
    this.cdr.detectChanges();
  }

  handleSessionUpdate(session: AuctionSessionResponse): void {
      if (session.sessionStatus === 'live' && session.remainingSeconds > 0) {
          this.timerValue = session.remainingSeconds;
          this.isTimerRunning = true;
          this.auctionLocked = false;
          this.startLocalTimer();
      } else {
          this.timerValue = session.remainingSeconds ?? 0;
          this.isTimerRunning = false;
          this.auctionLocked = true;
          this.stopLocalTimer();
      }
      this.cdr.detectChanges();
  }

  handleBidUpdate(bid: AuctionBidResponse): void {
      const row = this.bids.find(b => b.enrollmentId === bid.enrollmentId);
      if (row) {
          row.bidAmount = bid.bidAmount;
          row.bidId = bid.id;
          row.channel = bid.channel;
          this.recalculate();
      }
  }

  private startLocalTimer(): void {
      this.stopLocalTimer();
      this.timerInterval = setInterval(() => {
          if (this.timerValue > 0) {
              this.timerValue--;
              this.cdr.detectChanges();
          } else {
              this.stopLocalTimer();
              this.isTimerRunning = false;
              this.auctionLocked = true;
              this.cdr.detectChanges();
          }
      }, 1000);
  }

  private stopLocalTimer(): void {
      if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
      }
  }

  get formattedTimer(): string {
    const min = Math.floor(this.timerValue / 60);
    const sec = this.timerValue % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  ngAfterViewInit(): void {
    // loading started in ngOnInit — nothing needed here
  }

  private loadPage(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.svc.listChitGroups().subscribe({
      next: (groups) => {
        this.chitGroups = groups.data ?? [];
        if (this.chitGroups.length > 0 && this.selectedGroupId == null) {
          this.selectedGroupId = this.chitGroups[0].id;
        }
        this.loadGroupAuctions(true);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load chit groups. Please check the backend.';
        this.cdr.detectChanges();
      },
    });
  }

  private mapToAuctionItem(a: AuctionResponse): AuctionItem {
    return {
      id              : a.id,
      auctionNumber   : a.auctionNumber,
      groupName       : a.groupName ?? `Group #${a.chitGroupId}`,
      auctionDate     : a.auctionDate,
      chitGroupId     : a.chitGroupId,
      chitAmount      : a.chitAmount ?? 0,
      maxMembers      : a.maxMembers ?? 0,
      commissionPct   : a.companyCommissionPct ?? 5,
      winningBidId    : a.winningBidId,
      winningBidAmount: a.winningBidAmount,
      bidLossAmount   : a.bidLossAmount,
      dividendPerMember: a.dividendPerMember,
      netPayable      : a.netPayable,
      status          : a.status,
      approvalStatus  : a.approvalStatus,
      approvedByName  : a.approvedByName,
      rejectionReason : a.rejectionReason,
    };
  }

  loadGroupAuctions(selectFirst = false): void {
    if (!this.selectedGroupId) {
      this.groupAuctions = [];
      this.allAuctions = [];
      this.selected = null;
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const hasWinner = this.hasWinnerFilter === ''
      ? null
      : this.hasWinnerFilter === 'true';

    this.svc.listAuctionsPaged({
      page: 0,
      size: 200,
      chitGroupId: this.selectedGroupId,
      search: this.searchTerm,
      status: this.statusFilter,
      hasWinner,
      dateFrom: this.dateFrom || undefined,
      dateTo: this.dateTo || undefined,
      sortBy: 'auctionNumber',
      sortDir: 'asc',
    }).pipe(
      finalize(() => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: (page) => {
        const items = (page.content ?? []).map(a => this.mapToAuctionItem(a));
        this.groupAuctions = items;
        this.allAuctions = items;
        this.totalAuctionElements = page.totalElements ?? items.length;

        if (selectFirst && items.length > 0) {
          this.selectFirstAuction(items[0]);
        } else if (items.length === 0) {
          this.selected = null;
          this.bids = [];
          this.loadKpis();
        } else if (this.selected) {
          const stillExists = items.find(a => a.id === this.selected!.id);
          if (stillExists) {
            this.selected = stillExists;
          } else if (selectFirst) {
            this.selectFirstAuction(items[0]);
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load auctions for this group.';
        this.cdr.detectChanges();
      },
    });
  }

  private selectFirstAuction(first: AuctionItem): void {
    this.selected = first;
    this.lastIntimationResult = null;
    this.setHeader(first, this.groupAuctions.length);
    this.setCalcBase(first);

    forkJoin({
      bids       : this.svc.listBids(first.id),
      enrollments: this.svc.getEnrollments(first.chitGroupId),
    }).subscribe({
      next: ({ bids, enrollments }) => {
        this.bids = this.buildRows(enrollments.data ?? [], bids.data ?? []);
        this.header.totalMembers = this.bids.length;
        if ((bids.data ?? []).length) { this.recalculate(); }

        this.svc.connectToAuction(
          first.id,
          (session) => this.handleSessionUpdate(session),
          (bid) => this.handleBidUpdate(bid)
        );

        this.svc.getAuctionSession(first.id).subscribe(res => {
          if (res.data) this.handleSessionUpdate(res.data);
        });

        this.loadKpis();
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }

  onFiltersChange(): void {
    this.loadGroupAuctions(true);
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.searchTerm = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.hasWinnerFilter = '';
    this.loadGroupAuctions(true);
  }

  // ── Selections & Filtering ──────────────────────────────────────────────────

  onGroupSelect(event: Event): void {
    const groupId = Number((event.target as HTMLSelectElement).value);
    this.selectedGroupId = groupId;
    this.loadKpis();
    this.loadGroupAuctions(true);
  }

  onAuctionSelect(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    const item = this.groupAuctions.find(a => a.id === id);
    if (item && item.id !== this.selected?.id) { this.switchTo(item); }
  }

  private switchTo(item: AuctionItem): void {
    this.isLoading = true;
    this.bids      = [];
    this.selected  = item;
    this.lastIntimationResult = null;
    this.stopLocalTimer();
    this.isTimerRunning = false;
    this.auctionLocked = true;
    this.timerValue = 0;
    
    this.setHeader(item, this.groupAuctions.length);
    this.setCalcBase(item);
    this.cdr.detectChanges();

    forkJoin({
      bids       : this.svc.listBids(item.id),
      enrollments: this.svc.getEnrollments(item.chitGroupId),
    }).subscribe({
      next: ({ bids, enrollments }) => {
        this.bids = this.buildRows(enrollments.data ?? [], bids.data ?? []);
        this.header.totalMembers = this.bids.length;
        if ((bids.data ?? []).length) { this.recalculate(); }

        this.svc.connectToAuction(
            item.id,
            (session) => this.handleSessionUpdate(session),
            (bid) => this.handleBidUpdate(bid)
        );

        this.svc.getAuctionSession(item.id).subscribe(res => {
            if (res.data) this.handleSessionUpdate(res.data);
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Bid actions ───────────────────────────────────────────────────────────────

  submitBid(bid: BidRow): void {
    if (!this.canConductAuction) {
      this.errorMessage = 'Only administrators and agents can submit bids.';
      return;
    }
    if (!this.canSubmitBids) {
      this.errorMessage = 'Bidding is closed. Start the auction to accept bids.';
      return;
    }
    if (!this.selected || bid.bidAmount <= 0) {
      this.errorMessage = 'Enter a valid bid amount greater than zero.';
      return;
    }
    this.isSubmittingBid = true;
    this.errorMessage    = '';

    this.svc.createBid({
      auctionId   : this.selected.id,
      enrollmentId: bid.enrollmentId,
      bidAmount   : bid.bidAmount,
      channel     : 'offline',
    }).subscribe({
      next: (res: ApiResponse<AuctionBidResponse>) => {
        this.isSubmittingBid = false;
        if (res.data) {
          // No need to manually update and recalculate row since WebSocket push will handle it globally
        } else {
          this.errorMessage = res.message ?? 'Bid rejected. Enter an amount higher than the current highest bid.';
        }
      },
      error: () => {
        this.isSubmittingBid = false;
        this.errorMessage    = 'Failed to submit bid.';
      },
    });
  }

  recalculate(): void {
    const placed = this.bids.filter(b => b.bidAmount > 0);
    if (!placed.length) { return; }

    // Highest amount wins
    const highest = Math.max(...placed.map(b => b.bidAmount));
    this.bids.forEach(b => {
      if (b.bidAmount > 0) {
        b.isWinning = b.bidAmount === highest;
        b.status    = b.isWinning ? 'Highest Bid' : 'Bid Paid';
      } else {
        b.status = 'No Bid';
      }
    });

    // Create NEW array reference so Angular *ngFor re-renders rows in sorted order
    this.bids = [...this.bids].sort((a, b) => b.bidAmount - a.bidAmount);
    this.cdr.detectChanges(); // Force immediate repaint so highest row jumps to top instantly

    const chit       = this.calc.chitAmount;
    const pct        = this.calc.commissionPct;
    const members    = this.header.maxMembers || this.header.totalMembers || placed.length || 1;
    const bidLoss    = chit - highest;
    const commission = (chit * pct) / 100;
    const dividend   = members > 0 ? (bidLoss - commission) / members : 0;

    this.calc = {
      ...this.calc,
      winningBid       : highest,
      bidLoss,
      commissionAmount : commission,
      dividendPerMember: dividend,
      netPayable       : highest - commission + dividend,
    };
  }

  openConfirmModal(): void {
    if (!this.canConductAuction) {
      this.errorMessage = 'Only administrators and agents can submit the auction winner.';
      return;
    }
    if (this.isWinnerPendingApproval) {
      this.errorMessage = 'Winner is already pending administrator approval.';
      return;
    }
    if (this.isWinnerApproved) {
      this.errorMessage = 'Winner already approved for this auction.';
      return;
    }
    if (!this.highestBid) {
      this.errorMessage = 'No bids placed yet. Enter a bid amount and click Submit.';
      return;
    }
    if (this.selected?.winningBidId) {
      this.errorMessage = 'Winner already confirmed for this auction.';
      return;
    }

    // If winning bid was typed but not yet submitted to backend, auto-submit it first
    if (this.highestBid.bidId === null) {
      this.errorMessage = '';
      this.isSubmittingBid = true;
      this.svc.createBid({
        auctionId   : this.selected!.id,
        enrollmentId: this.highestBid.enrollmentId,
        bidAmount   : this.highestBid.bidAmount,
        channel     : 'offline',
      }).subscribe({
        next: (res: ApiResponse<AuctionBidResponse>) => {
          this.isSubmittingBid = false;
          if (res.data) {
            this.highestBid!.bidId = res.data.id;
            this.errorMessage     = '';
            this.showConfirmModal = true;
            this.cdr.detectChanges();
          } else {
            this.errorMessage = res.message ?? 'Failed to submit winning bid.';
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.isSubmittingBid = false;
          this.errorMessage    = 'Failed to submit bid. Please try manually.';
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.errorMessage     = '';
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void { this.showConfirmModal = false; }

  confirmWinner(): void {
    if (!this.canConductAuction) {
      this.errorMessage = 'Only administrators and agents can submit the auction winner.';
      return;
    }
    if (!this.selected) {
      this.errorMessage = 'No auction selected.';
      return;
    }

    const winnerBid = this.highestBid ?? this.bids.find(b => b.isWinning);
    const bidId = winnerBid?.bidId;

    if (!winnerBid || !bidId) {
      this.errorMessage = 'Cannot confirm: no winning bid found. Please submit a bid first.';
      return;
    }
    this.isConfirmingWinner = true;
    this.errorMessage       = '';

    this.svc.selectWinner(this.selected.id, bidId).subscribe({
      next: (res: ApiResponse<AuctionResponse>) => {
        this.isConfirmingWinner = false;
        if (res.data) {
          const idx = this.allAuctions.findIndex(a => a.id === this.selected!.id);
        if (idx >= 0) {
          const updated = {
            ...this.allAuctions[idx],
            winningBidId    : res.data.winningBidId,
            winningBidAmount: res.data.winningBidAmount,
            netPayable      : res.data.netPayable,
            status          : res.data.status,
            approvalStatus  : res.data.approvalStatus,
            approvedByName  : res.data.approvedByName,
            rejectionReason : res.data.rejectionReason,
          };
          this.allAuctions[idx] = updated;
          const groupIndex = this.groupAuctions.findIndex(a => a.id === updated.id);
          if (groupIndex >= 0) { this.groupAuctions[groupIndex] = updated; }
          this.selected = updated;
          this.setHeader(updated, this.groupAuctions.length);
          this.setCalcBase(updated);
          this.refreshSelectedAuction();
        }
        this.showConfirmModal = false;
        this.showSuccessModal = true;
        if (res.data.approvalStatus?.toUpperCase() === 'PENDING') {
          this.toastService.success('Winner submitted for administrator approval.');
        } else {
          this.toastService.success('Auction winner confirmed successfully.');
        }
        this.loadKpis();
        this.cdr.detectChanges();
          setTimeout(() => { this.showSuccessModal = false; this.cdr.detectChanges(); }, 3000);
        } else {
          this.errorMessage     = res.message ?? 'Could not confirm winner.';
          this.showConfirmModal = false;
        }
      },
      error: () => {
        this.isConfirmingWinner = false;
        this.showConfirmModal   = false;
        this.errorMessage       = 'Failed to confirm winner.';
      },
    });
  }

  approveWinner(): void {
    if (!this.canConfirmWinner || !this.selected) {
      this.toastService.warning('Only administrators can approve auction winners.');
      return;
    }
    this.isConfirmingWinner = true;
    this.svc.approveWinner(this.selected.id).subscribe({
      next: (res) => {
        this.isConfirmingWinner = false;
        if (res.data) {
          this.applySelectedUpdate(res.data);
          this.toastService.success('Auction winner approved.');
          this.loadKpis();
        } else {
          this.errorMessage = res.message ?? 'Failed to approve winner.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isConfirmingWinner = false;
        this.errorMessage = 'Failed to approve winner.';
        this.cdr.detectChanges();
      },
    });
  }

  rejectWinner(): void {
    if (!this.canConfirmWinner || !this.selected) {
      this.toastService.warning('Only administrators can reject auction winners.');
      return;
    }
    const reason = window.prompt('Enter rejection reason (optional):') ?? '';
    this.isConfirmingWinner = true;
    this.svc.rejectWinner(this.selected.id, reason || undefined).subscribe({
      next: (res) => {
        this.isConfirmingWinner = false;
        if (res.data) {
          this.applySelectedUpdate(res.data);
          this.bids.forEach(b => {
            b.isWinning = false;
            if (b.status === 'Highest Bid') {
              b.status = b.bidAmount > 0 ? 'Bid Paid' : 'No Bid';
            }
          });
          this.toastService.success('Auction winner rejected.');
          this.loadKpis();
          this.refreshSelectedAuction();
        } else {
          this.errorMessage = res.message ?? 'Failed to reject winner.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isConfirmingWinner = false;
        this.errorMessage = 'Failed to reject winner.';
        this.cdr.detectChanges();
      },
    });
  }

  sendIntimation(): void {
    if (!this.canConductAuction || !this.selected) {
      this.toastService.warning('Only administrators and agents can send auction intimations.');
      return;
    }
    this.isSendingIntimation = true;
    this.svc.sendAuctionIntimation(this.selected.id).subscribe({
      next: (res) => {
        this.isSendingIntimation = false;
        if (res.data) {
          this.lastIntimationResult = res.data;
          if (res.data.sentCount > 0) {
            this.toastService.success(`Intimation sent to ${res.data.sentCount} member(s).`);
          } else {
            this.toastService.info('No new members to notify (already sent or no mobile number).');
          }
        } else {
          this.toastService.error(res.message ?? 'Failed to send auction intimation.');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSendingIntimation = false;
        this.toastService.error('Failed to send auction intimation.');
        this.cdr.detectChanges();
      },
    });
  }

  private applySelectedUpdate(data: AuctionResponse): void {
    if (!this.selected) {
      return;
    }
    const updated: AuctionItem = {
      ...this.selected,
      winningBidId: data.winningBidId,
      winningBidAmount: data.winningBidAmount,
      netPayable: data.netPayable,
      status: data.status,
      approvalStatus: data.approvalStatus,
      approvedByName: data.approvedByName,
      rejectionReason: data.rejectionReason,
    };
    this.selected = updated;
    const allIdx = this.allAuctions.findIndex(a => a.id === updated.id);
    if (allIdx >= 0) {
      this.allAuctions[allIdx] = updated;
    }
    const groupIdx = this.groupAuctions.findIndex(a => a.id === updated.id);
    if (groupIdx >= 0) {
      this.groupAuctions[groupIdx] = updated;
    }
    this.setHeader(updated, this.groupAuctions.length);
    this.setCalcBase(updated);
  }

  closeSuccessModal(): void { this.showSuccessModal = false; }

  /** Download/Print auction details as a formatted report */
  downloadDetails(): void {
    if (!this.selected) { return; }

    const winner = this.highestBid;
    const rows = this.bids.map((b, i) => `
      <tr style="background:${b.status === 'Highest Bid' ? '#f0fdf4' : 'white'}">
        <td>${i + 1}</td>
        <td>${b.ticketNumber}</td>
        <td>${b.subscriber}</td>
        <td style="text-align:right">${b.bidAmount > 0 ? this.formatCurrency(b.bidAmount) : '—'}</td>
        <td><span style="padding:3px 10px;border-radius:4px;font-size:12px;font-weight:600;
          background:${b.status === 'Highest Bid' ? '#dcfce7' : b.status === 'Bid Paid' ? '#dbeafe' : '#f3f4f6'};
          color:${b.status === 'Highest Bid' ? '#166534' : b.status === 'Bid Paid' ? '#1e40af' : '#374151'}">
          ${b.status}</span></td>
      </tr>`).join('');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Auction Report — ${this.header.groupName} #${this.header.auctionNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; color: #111827; padding: 32px; }
    h1  { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .sub { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .card-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .5px; }
    .card-value { font-size: 16px; font-weight: 700; color: #111827; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
    .summary { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; }
    .sum-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
    .sum-row.total { font-weight: 700; font-size: 15px; border-top: 1px solid #bbf7d0; padding-top: 10px; margin-top: 4px; }
    .winner-box { background: #003366; color: white; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
    .winner-box h2 { font-size: 14px; opacity:.8; margin-bottom: 8px; }
    .winner-name { font-size: 20px; font-weight: 700; }
    .winner-amt  { font-size: 14px; opacity:.9; margin-top: 4px; }
    @media print { body { padding: 16px; } button { display: none; } }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
    <div>
      <h1>Auction Report</h1>
      <p class="sub">Generated on ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
    </div>
    <button onclick="window.print()" style="padding:8px 20px;background:#003366;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px">🖨 Print / Save PDF</button>
  </div>

  <div class="grid">
    <div class="card"><div class="card-label">Group Name</div><div class="card-value">${this.header.groupName}</div></div>
    <div class="card"><div class="card-label">Auction Number</div><div class="card-value">#${this.header.auctionNumber} of ${this.header.totalAuctions}</div></div>
    <div class="card"><div class="card-label">Auction Date</div><div class="card-value">${this.header.auctionDate}</div></div>
    <div class="card"><div class="card-label">Total Members</div><div class="card-value">${this.header.totalMembers}</div></div>
  </div>

  ${winner ? `
  <div class="winner-box">
    <h2>🏆 Auction Winner</h2>
    <div class="winner-name">${winner.subscriber}</div>
    <div class="winner-amt">Ticket: ${winner.ticketNumber} &nbsp;|&nbsp; Winning Bid: ${this.formatCurrency(winner.bidAmount)}</div>
  </div>` : ''}

  <table>
    <thead>
      <tr><th>#</th><th>Ticket</th><th>Subscriber</th><th style="text-align:right">Bid Amount</th><th>Status</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="summary">
    <div class="sum-row"><span>Chit Amount</span><span>${this.formatCurrency(this.calc.chitAmount)}</span></div>
    <div class="sum-row"><span>Winning Bid</span><span>${this.formatCurrency(this.calc.winningBid)}</span></div>
    <div class="sum-row"><span>Bid Loss</span><span>${this.formatCurrency(this.calc.bidLoss)}</span></div>
    <div class="sum-row"><span>Commission (${this.calc.commissionPct}%)</span><span>${this.formatCurrency(this.calc.commissionAmount)}</span></div>
    <div class="sum-row"><span>Dividend per Member</span><span>${this.formatCurrency(this.calc.dividendPerMember)}</span></div>
    <div class="sum-row total"><span>Net Payable to Winner</span><span>${this.formatCurrency(this.calc.netPayable)}</span></div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
    }
  }

  formatCurrency(n: number): string {
    return '₹' + (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  private setHeader(item: AuctionItem, total: number): void {
    this.header = {
      auctionNumber : item.auctionNumber,
      groupName     : item.groupName,
      currentAuction: item.auctionNumber,
      totalAuctions : total,
      auctionDate   : this.fmtDate(item.auctionDate),
      totalMembers  : 0,
      maxMembers    : item.maxMembers, 
    };
  }

  private setCalcBase(item: AuctionItem): void {
    this.calc = {
      chitAmount       : item.chitAmount,
      winningBid       : item.winningBidAmount    ?? 0,
      bidLoss          : item.bidLossAmount        ?? 0,
      commissionPct    : item.commissionPct, 
      commissionAmount : 0,
      dividendPerMember: item.dividendPerMember    ?? 0,
      netPayable       : item.netPayable           ?? 0,
    };
  }

  private buildRows(enrollments: EnrollmentResponse[], existingBids: AuctionBidResponse[]): BidRow[] {
    const highest = existingBids.length
      ? Math.max(...existingBids.map(b => b.bidAmount)) : 0;

    if (enrollments.length > 0) {
      return enrollments.map((e): BidRow => {
        const bid = existingBids.find(b => b.enrollmentId === e.id);
        return {
          ticketNumber: `T${String(e.ticketNo).padStart(3, '0')}`,
          enrollmentId: e.id,
          subscriber  : e.subscriberName || `Member #${e.id}`,
          bidAmount   : bid?.bidAmount ?? 0,
          bidId       : bid?.id        ?? null,
          isWinning   : bid ? bid.bidAmount === highest : false,
          channel     : bid?.channel ?? 'offline',
          status      : bid ? (bid.bidAmount === highest ? 'Highest Bid' : 'Bid Paid') : 'No Bid',
        };
      });
    }

    return existingBids.map((b, i): BidRow => ({
      ticketNumber: `T${String(i + 1).padStart(3, '0')}`,
      enrollmentId: b.enrollmentId,
      subscriber  : `Member #${b.enrollmentId}`,
      bidAmount   : b.bidAmount,
      bidId       : b.id,
      isWinning   : b.bidAmount === highest,
      channel     : b.channel,
        status      : b.bidAmount === highest ? 'Highest Bid' : 'Bid Paid',
    }));
  }

  private refreshSelectedAuction(): void {
    if (!this.selected) { return; }

    forkJoin({
      bids       : this.svc.listBids(this.selected.id),
      enrollments: this.svc.getEnrollments(this.selected.chitGroupId),
    }).subscribe({
      next: ({ bids, enrollments }) => {
        this.bids = this.buildRows(enrollments.data ?? [], bids.data ?? []);
        this.header.totalMembers = this.bids.length;
        if ((bids.data ?? []).length) { this.recalculate(); }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }

  private fmtDate(d: string): string {
    if (!d) { return ''; }
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }
}
