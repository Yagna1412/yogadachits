import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
// Re-saved to resolve module recognition issue
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import {
  AuctionsService,
  AuctionResponse,
  AuctionBidResponse,
  AuctionSessionResponse,
  EnrollmentResponse,
  ChitGroupDto,
  ApiResponse,
} from '../../service/auction.service';
import { AuctionControlsComponent } from './auction-controls.component';
import { AuctionTimerComponent } from './auction-timer.component';

interface AuctionItem {
  id: number;
  auctionNumber: number;
  groupName: string;
  auctionDate: string;
  chitGroupId: number;
  chitAmount: number;
  maxMembers: number;
  commissionPct: number;
  winningBidId?: number;
  winningBidAmount?: number;
  bidLossAmount?: number;
  dividendPerMember?: number;
  netPayable?: number;
  status: string;
  totalBidsParticipant?: number;
  auctionTimeFrom?: string; // "HH:MM" from chit group
  auctionTimeTo?: string;   // "HH:MM" from chit group — duration = timeTo - timeFrom
}

interface BidRow {
  ticketNumber: string;
  enrollmentId: number;
  subscriber: string;
  bidAmount: number;
  bidId: number | null;
  isWinning: boolean;
  channel: string;
  status: 'No Bid' | 'Outbid' | 'Highest Bid' | 'Tied Bid';
}

interface Header {
  auctionNumber: number;
  groupName: string;
  currentAuction: number;
  totalAuctions: number;
  auctionDate: string;
  totalMembers: number;
  maxMembers: number;
  status: string;
}

interface Calc {
  chitAmount: number;
  winningBid: number;
  bidLoss: number;
  commissionPct: number;
  commissionAmount: number;
  dividendPerMember: number;
  netPayable: number;
}

interface LiveBanner {
  label: string;
  summary: string;
  variant: 'selected' | 'group' | 'global';
}

@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuctionControlsComponent, AuctionTimerComponent],
  templateUrl: './auctions.html',
  styleUrl: './auctions.scss',
})
export class AuctionsComponent implements OnInit, AfterViewInit, OnDestroy {

  isLoading = false;
  isDetailLoading = false;
  isSubmittingBid = false;
  isConfirmingWinner = false;
  showConfirmModal = false;
  showSuccessModal = false;
  winningBidFlash = false;
  sendSmsToAll = false;
  errorMessage = '';
  activePanel: 'none' | 'details' = 'none';
  isDiceRolling = false;
  diceWinnerId: number | null = null;
  winningBidConfirmed = false;
  lockedWinnerBid: BidRow | null = null;
  promotedBidEnrollmentId: number | null = null;
  private _prevHighestEnrollmentId: number | null = null;

  // Data arrays
  chitGroups: ChitGroupDto[] = [];
  allAuctions: AuctionItem[] = [];
  groupAuctions: AuctionItem[] = [];
  bids: BidRow[] = [];

  // Timer state — driven entirely by AuctionsService observables
  isTimerRunning = false;
  auctionLocked = false;
  currentSession: AuctionSessionResponse | null = null;

  // Selections
  selectedGroupId: number | null = null;
  selectedAuctionId: number | null = null;
  selected: AuctionItem | null = null;

  header: Header = {
    auctionNumber: 0, groupName: '', currentAuction: 0,
    totalAuctions: 0, auctionDate: '', totalMembers: 0, maxMembers: 0, status: ''
  };

  calc: Calc = {
    chitAmount: 0, winningBid: 0, bidLoss: 0,
    commissionPct: 5, commissionAmount: 0,
    dividendPerMember: 0, netPayable: 0,
  };

  get highestBid(): BidRow | undefined { return this.bids.find(b => b.status === 'Highest Bid'); }

  get tiedBids(): BidRow[] {
    const placed = this.bids.filter(b => b.bidAmount > 0);
    if (!placed.length) return [];
    const highest = Math.max(...placed.map(b => b.bidAmount));
    return placed.filter(b => b.bidAmount === highest);
  }

  get hasTie(): boolean {
    return this.diceWinnerId === null && this.tiedBids.length > 1;
  }

  get globalLiveAuction(): AuctionItem | undefined {
    return this.allAuctions.find(a => this.isLiveAuctionStatus(a.status));
  }

  get headerActionLabel(): string {
    return this.globalLiveAuction ? 'View' : 'Start Auction';
  }

  get auctionListRouteId(): number {
    return this.globalLiveAuction?.id ?? this.allAuctions[0]?.id ?? 10100;
  }




  get liveAuctionBanner(): LiveBanner | null {
    const selectedAuction = this.getSelectedAuction();
    if (selectedAuction && this.isLiveAuctionStatus(selectedAuction.status)) {
      return {
        label: 'Selected Auction is Live',
        summary: `Auction #${selectedAuction.auctionNumber} - ${selectedAuction.groupName}`,
        variant: 'selected',
      };
    }

    const groupLiveAuction = this.groupAuctions.find(item => this.isLiveAuctionStatus(item.status)) ?? null;
    if (groupLiveAuction) {
      return {
        label: this.selectedGroupId ? 'Live Auction in Selected Group' : 'Live Auction in Current Group',
        summary: `Auction #${groupLiveAuction.auctionNumber} - ${groupLiveAuction.groupName}`,
        variant: 'group',
      };
    }

    const liveAuction = this.allAuctions.find(item => this.isLiveAuctionStatus(item.status)) ?? null;
    if (liveAuction) {
      return {
        label: 'Live Auction Running',
        summary: `Auction #${liveAuction.auctionNumber} - ${liveAuction.groupName}`,
        variant: 'global',
      };
    }

    return null;
  }

  constructor(private svc: AuctionsService, private cdr: ChangeDetectorRef, private router: Router) { }

  isTimerComplete = false;

  ngOnInit(): void {
    this.svc.isTimerRunning$.subscribe(running => {
      this.isTimerRunning = running;
      this.cdr.markForCheck();
    });
    this.svc.isTimerComplete$.subscribe(done => {
      this.isTimerComplete = done;
      if (done && this.lockedWinnerBid) {
        this.openConfirmModal();
      }
      this.cdr.markForCheck();
    });
    this.loadPage();
  }

  ngOnDestroy(): void {
    this.svc.resetTimerState();
    this.svc.disconnectFromAuction();
  }

  onGroupSelect(groupId: number | string | null): void {
    this.selectedGroupId = groupId === null || groupId === undefined ? null : Number(groupId);
    this.filterAuctionsByGroup();
    this.selectedAuctionId = this.groupAuctions[0]?.id ?? null;
    this.errorMessage = '';
    this.activePanel = 'none';
    this.resetAuctionViewState(false);
  }

  onAuctionSelect(auctionId?: number | string | null): void {
    this.selectedAuctionId = auctionId === undefined || auctionId === null ? null : Number(auctionId);
    this.errorMessage = '';
    this.activePanel = 'none';
    this.resetAuctionViewState(false);
  }

  get canViewAuction(): boolean {
    return !this.isDetailLoading && !!this.getSelectedAuction();
  }

  private resetAuctionViewState(isDetailLoading: boolean): void {
    this.svc.resetTimerState();
    this.svc.disconnectFromAuction();
    this.selected = null;
    this.bids = [];
    this.currentSession = null;
    this.showConfirmModal = false;
    this.showSuccessModal = false;
    this.isTimerRunning = false;
    this.auctionLocked = false;
    this.isDiceRolling = false;
    this.diceWinnerId = null;
    this.winningBidConfirmed = false;
    this.lockedWinnerBid = null;
    this.promotedBidEnrollmentId = null;
    this._prevHighestEnrollmentId = null;
    this.isDetailLoading = isDetailLoading;
    this.header = {
      auctionNumber: 0,
      groupName: '',
      currentAuction: 0,
      totalAuctions: 0,
      auctionDate: '',
      totalMembers: 0,
      maxMembers: 0,
      status: '',
    };
    this.calc = {
      chitAmount: 0,
      winningBid: 0,
      bidLoss: 0,
      commissionPct: 5,
      commissionAmount: 0,
      dividendPerMember: 0,
      netPayable: 0,
    };
  }

  private getSelectedAuction(): AuctionItem | null {
    if (this.selectedAuctionId === null || this.selectedAuctionId === undefined) {
      return null;
    }
    const idToFind = Number(this.selectedAuctionId);
    return this.groupAuctions.find(a => a.id === idToFind)
      ?? this.allAuctions.find(a => a.id === idToFind)
      ?? null;
  }

  private mergeAuctionItem(base: AuctionItem, detail: Partial<AuctionResponse> | null): AuctionItem {
    if (!detail) {
      return base;
    }

    return {
      ...base,
      groupName: detail.groupName ?? base.groupName,
      auctionDate: detail.auctionDate ?? base.auctionDate,
      chitAmount: detail.chitAmount ?? base.chitAmount,
      maxMembers: detail.maxMembers ?? base.maxMembers,
      commissionPct: detail.companyCommissionPct ?? base.commissionPct,
      winningBidId: detail.winningBidId ?? base.winningBidId,
      winningBidAmount: detail.winningBidAmount ?? base.winningBidAmount,
      bidLossAmount: detail.bidLossAmount ?? base.bidLossAmount,
      dividendPerMember: detail.dividendPerMember ?? base.dividendPerMember,
      netPayable: detail.netPayable ?? base.netPayable,
      status: detail.status ?? base.status,
    };
  }

  private loadAuctionDetails(item: AuctionItem): void {
    this.resetAuctionViewState(true);
    this.switchTo(item);
  }

  startAuction(id?: number): void {
    const targetId = id ?? this.selected?.id;
    if (this.isTimerRunning || !targetId) return;
    this.header.status = 'LIVE';
    this.svc.startAuction(targetId).subscribe(res => {
      if (res.data) {
        this.handleSessionUpdate(res.data);
      } else {
        // Fallback: derive duration from chit group schedule
        const duration = this.selected ? this.computeAuctionDuration(this.selected) : 300;
        this.svc.startLocalTimer(duration);
      }
      this.cdr.detectChanges();
    });
  }

  private computeAuctionDuration(item: AuctionItem): number {
    const from = item.auctionTimeFrom;
    const to = item.auctionTimeTo;
    if (from && to) {
      const [fh, fm] = from.split(':').map(Number);
      const [th, tm] = to.split(':').map(Number);
      const diff = (th * 60 + tm) - (fh * 60 + fm);
      if (diff > 0) return diff * 60;
    }
    return 300; // 5-minute fallback when time fields not set
  }

  goBack(): void {
    this.activePanel = 'none';
    this.resetAuctionViewState(false);
  }

  viewAuction(): void {
    const item = this.getSelectedAuction();
    if (!item) {
      this.errorMessage = 'Select a chit group and auction month first.';
      return;
    }

    this.errorMessage = '';
    // Navigate to the separate Auction Detail page
    this.router.navigate(['/admin/auctions/view', item.id]);
  }

  viewSelectedAuctionFromForm(): void {
    this.viewAuction();
  }

  viewLiveAuctionFromHeader(): void {
    const live = this.globalLiveAuction;
    if (live) {
      // User says: "View when there is auction" and "no need of showing live auction details"
      // So we navigate to the separate Auction List page
      this.router.navigate(['/admin/auctions/view', live.id]);
    } else {
      // Logic for "Start Auction" when nothing is live
      if (!this.selectedAuctionId) {
        this.errorMessage = 'Please select a chit group and auction month first.';
        return;
      }

      const targetId = Number(this.selectedAuctionId);
      this.startAuction(targetId);

      // Show the management panel (bidding interface) for the newly started auction
      const item = this.getSelectedAuction();
      if (item) {
        this.activePanel = 'details';
        this.loadAuctionDetails(item);
      }
    }
  }

  stopAuction(): void {
    this.svc.stopLocalTimer();
    this.auctionLocked = true;
    this.cdr.detectChanges();
  }

  handleSessionUpdate(session: AuctionSessionResponse): void {
    this.currentSession = session;
    const sessionIsLive = this.isLiveAuctionStatus(session.sessionStatus);
    this.header = {
      ...this.header,
      status: sessionIsLive ? 'LIVE' : (session.sessionStatus || this.header.status || 'CLOSED'),
    };
    if (sessionIsLive) {
      this.auctionLocked = false;
      this.svc.startLocalTimer(session.remainingSeconds);
    } else {
      this.auctionLocked = true;
      this.svc.stopLocalTimer();
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

  ngAfterViewInit(): void {
    // loading started in ngOnInit — nothing needed here
  }

  private loadPage(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    // Fetch BOTH Chit Groups and Auctions
    forkJoin({
      groups: this.svc.listChitGroups(),
      auctions: this.svc.listAuctions()
    }).pipe(
      switchMap(({ groups, auctions }) => {
        const groupsData: any[] = (groups as any)?.data ?? (groups as any) ?? [];
        const auctionsData: any[] = (auctions as any)?.data ?? (auctions as any) ?? [];
        this.chitGroups = Array.isArray(groupsData) ? groupsData : [];
        const aList = Array.isArray(auctionsData) ? auctionsData : [];

        if (!aList.length) {
          return of({ items: [] as AuctionItem[], bids: [] as AuctionBidResponse[], enrollments: [] as EnrollmentResponse[], first: null });
        }

        const items: AuctionItem[] = aList.map((a: AuctionResponse): AuctionItem => ({
          id: a.id,
          auctionNumber: a.auctionNumber,
          groupName: a.groupName ?? `Group #${a.chitGroupId}`,
          auctionDate: a.auctionDate,
          chitGroupId: a.chitGroupId,
          chitAmount: a.chitAmount ?? 0,
          maxMembers: a.maxMembers ?? 0,
          commissionPct: a.companyCommissionPct ?? 5,
          winningBidId: a.winningBidId,
          winningBidAmount: a.winningBidAmount,
          bidLossAmount: a.bidLossAmount,
          dividendPerMember: a.dividendPerMember,
          netPayable: a.netPayable,
          status: a.status,
        }));

        this.allAuctions = items;

        if (!this.chitGroups.length && items.length) {
          const groupMap = new Map<number, ChitGroupDto>();
          items.forEach((item) => {
            if (!groupMap.has(item.chitGroupId)) {
              groupMap.set(item.chitGroupId, {
                id: item.chitGroupId,
                groupName: item.groupName || `Group #${item.chitGroupId}`,
                chitAmount: item.chitAmount || 0,
              });
            }
          });
          this.chitGroups = [...groupMap.values()];
        }

        if (this.chitGroups.length > 0) {
          this.selectedGroupId = this.chitGroups[0].id;
          this.filterAuctionsByGroup();
        }

        // Prefer any auction that is currently live/active; fallback to first
        const liveInGroup = this.groupAuctions.find(a => this.isLiveAuctionStatus(a.status));
        const liveInAll = items.find(a => this.isLiveAuctionStatus(a.status));
        const first = liveInGroup ?? (this.groupAuctions.length > 0 ? this.groupAuctions[0] : liveInAll ?? items[0]);

        if (!first) {
          return of({ items, bids: [], enrollments: [], first: null });
        }

        return forkJoin({
          bids: this.svc.listBids(first.id),
          enrollments: this.svc.getEnrollments(first.chitGroupId),
        }).pipe(
          switchMap(({ bids, enrollments }) => of({
            items,
            bids: ((bids as any)?.data ?? (bids as any) ?? []) as AuctionBidResponse[],
            enrollments: ((enrollments as any)?.data ?? (enrollments as any) ?? []) as EnrollmentResponse[],
            first,
          }))
        );
      })
    ).subscribe({
      next: ({ items, bids, enrollments, first }: any) => {
        if (!first) {
          // If no auctions exist for this group, empty state will show via HTML
          this.selected = null;
        } else {
          this.selected = first;
          this.setHeader(first, this.groupAuctions.length);
          this.setCalcBase(first);

          this.bids = this.buildRows(enrollments, bids);
          this.header.totalMembers = this.bids.length;

          if (bids.length) { this.recalculate(); }

          this.svc.connectToAuction(
            first.id,
            (session) => this.handleSessionUpdate(session),
            (bid) => this.handleBidUpdate(bid)
          );

          this.svc.getAuctionSession(first.id).subscribe(res => {
            if (res.data) this.handleSessionUpdate(res.data);
          });
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load data. Please check the backend.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Selections & Filtering ──────────────────────────────────────────────────

  private legacyOnGroupSelect(event: Event): void {
    const groupId = Number((event.target as HTMLSelectElement).value);
    this.onGroupSelect(groupId);
  }

  private legacyOnAuctionSelect(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.onAuctionSelect(id);
  }

  private filterAuctionsByGroup(): void {
    if (!this.selectedGroupId) {
      this.groupAuctions = [];
      return;
    }
    this.groupAuctions = this.allAuctions.filter(a => a.chitGroupId === this.selectedGroupId);
  }

  private switchTo(item: AuctionItem): void {
    this.isLoading = true;
    this.bids = [];
    this.selected = item;

    this.setHeader(item, this.groupAuctions.length);
    this.setCalcBase(item);
    this.cdr.detectChanges();

    forkJoin({
      bids: this.svc.listBids(item.id),
      enrollments: this.svc.getEnrollments(item.chitGroupId),
    }).subscribe({
      next: ({ bids, enrollments }) => {
        const bidData = (bids as any)?.data ?? (bids as any) ?? [];
        const enrollData = (enrollments as any)?.data ?? (enrollments as any) ?? [];
        this.bids = this.buildRows(enrollData, bidData);
        this.header.totalMembers = this.bids.length;
        if ((Array.isArray(bidData) ? bidData : []).length) { this.recalculate(); }

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
    if (this.lockedWinnerBid) return; // a winner is already locked
    if (!this.isTimerRunning) {
      this.errorMessage = 'Timer must be running to submit a bid.';
      return;
    }
    if (this.hasTie) {
      this.errorMessage = 'Multiple bids are tied. Roll the dice to pick a winner first.';
      return;
    }
    if (bid.status !== 'Highest Bid') {
      this.errorMessage = 'Only the highest bid can be submitted. Lower bids cannot be confirmed as the winner.';
      return;
    }
    if (!this.selected || bid.bidAmount <= 0) {
      this.errorMessage = 'Enter a valid bid amount greater than zero.';
      return;
    }

    // Immediately lock this bid — snapshot at click time so no incoming bid can override it
    this.lockedWinnerBid = { ...bid };
    this.winningBidConfirmed = true;
    this.errorMessage = '';
    this.recalculate();

    // Persist to backend
    this.isSubmittingBid = true;
    this.svc.createBid({
      auctionId: this.selected!.id,
      enrollmentId: bid.enrollmentId,
      bidAmount: bid.bidAmount,
      channel: bid.channel || 'offline',
    }).subscribe({
      next: (res: ApiResponse<AuctionBidResponse>) => {
        this.isSubmittingBid = false;
        const index = this.bids.findIndex(b => b.enrollmentId === bid.enrollmentId);
        if (index >= 0) {
          this.bids[index].bidId = res.data?.id ?? this.bids[index].bidId;
          this.bids[index].bidAmount = res.data?.bidAmount ?? bid.bidAmount;
          this.bids[index].channel = res.data?.channel ?? bid.channel;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmittingBid = false;
        this.cdr.detectChanges();
      },
    });
  }

  rollDice(): void {
    const tied = this.tiedBids;
    if (!this.isTimerRunning || this.isDiceRolling || tied.length < 2) return;
    this.isDiceRolling = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      const winner = tied[Math.floor(Math.random() * tied.length)];
      this.diceWinnerId = winner.enrollmentId;
      this.isDiceRolling = false;
      this.recalculate();
    }, 1500);
  }

  recalculate(): void {
    const placed = this.bids.filter(b => b.bidAmount > 0);
    if (!placed.length) { return; }

    // Highest amount wins
    const highest = Math.max(...placed.map(b => b.bidAmount));

    // Validate dice winner is still at the highest amount; reset if stale
    if (this.diceWinnerId !== null) {
      const diceWinner = this.bids.find(b => b.enrollmentId === this.diceWinnerId);
      if (!diceWinner || diceWinner.bidAmount !== highest) {
        this.diceWinnerId = null;
      }
    }

    const tiedCount = placed.filter(b => b.bidAmount === highest).length;
    const isTie = this.diceWinnerId === null && tiedCount > 1;

    this.bids.forEach(b => {
      if (b.bidAmount > 0) {
        if (this.lockedWinnerBid !== null) {
          // Locked: submitted bid is always the winner — incoming bids cannot override it
          b.isWinning = b.enrollmentId === this.lockedWinnerBid.enrollmentId;
          b.status = b.isWinning ? 'Highest Bid' : 'Outbid';
        } else if (this.diceWinnerId !== null) {
          b.isWinning = b.enrollmentId === this.diceWinnerId;
          b.status = b.isWinning ? 'Highest Bid' : 'Outbid';
        } else if (isTie && b.bidAmount === highest) {
          b.isWinning = false;
          b.status = 'Tied Bid';
        } else {
          b.isWinning = b.bidAmount === highest;
          b.status = b.isWinning ? 'Highest Bid' : 'Outbid';
        }
      } else {
        b.status = 'No Bid';
      }
    });

    // Keep locked winner at top; otherwise sort by bid amount descending
    this.bids = [...this.bids].sort((a, b) => {
      if (this.lockedWinnerBid) {
        if (a.enrollmentId === this.lockedWinnerBid.enrollmentId) return -1;
        if (b.enrollmentId === this.lockedWinnerBid.enrollmentId) return 1;
      }
      return b.bidAmount - a.bidAmount;
    });

    // Auto-promote: during a live auction, animate the new highest-bid row when it changes
    if (this.isTimerRunning && !this.lockedWinnerBid) {
      const newHighest = this.bids.find(b => b.status === 'Highest Bid');
      const newId = newHighest?.enrollmentId ?? null;
      if (newId !== null && newId !== this._prevHighestEnrollmentId) {
        this._prevHighestEnrollmentId = newId;
        this.promotedBidEnrollmentId = newId;
        setTimeout(() => {
          this.promotedBidEnrollmentId = null;
          this.cdr.detectChanges();
        }, 1400);
      }
    }

    this.cdr.detectChanges();

    // Use the locked bid amount for calculations, not the live highest
    const winningAmount = this.lockedWinnerBid ? this.lockedWinnerBid.bidAmount : highest;
    const chit = this.calc.chitAmount;
    const commissionPct = 5;
    const members = this.header.maxMembers || this.header.totalMembers || placed.length || 1;
    const commission = (chit * commissionPct) / 100;
    const bidLoss = chit - winningAmount;
    const dividend = members > 0 ? bidLoss / members : 0;
    // Net payable to winner = winning bid amount minus organiser's commission
    const netPayable = winningAmount - commission;

    this.calc = {
      ...this.calc,
      winningBid: (this.lockedWinnerBid || this.winningBidConfirmed) ? winningAmount : 0,
      commissionPct,
      commissionAmount: commission,
      bidLoss: (this.lockedWinnerBid || this.winningBidConfirmed) ? bidLoss : 0,
      dividendPerMember: (this.lockedWinnerBid || this.winningBidConfirmed) ? dividend : 0,
      netPayable: (this.lockedWinnerBid || this.winningBidConfirmed) ? netPayable : 0,
    };

    this.winningBidFlash = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.winningBidFlash = false; this.cdr.detectChanges(); }, 600);
  }

  openConfirmModal(): void {
    if (!this.isTimerComplete && !this.lockedWinnerBid) {
      this.errorMessage = 'Auction is still running. Wait for the timer to end to confirm a winner.';
      return;
    }
    if (this.hasTie) {
      this.errorMessage = 'Multiple bids are tied. Roll the dice to pick a winner first.';
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
        auctionId: this.selected!.id,
        enrollmentId: this.highestBid.enrollmentId,
        bidAmount: this.highestBid.bidAmount,
        channel: 'offline',
      }).subscribe({
        next: (res: ApiResponse<AuctionBidResponse>) => {
          this.isSubmittingBid = false;
          if (res.data) {
            this.highestBid!.bidId = res.data.id;
            this.errorMessage = '';
            this.svc.stopLocalTimer();
            this.showConfirmModal = true;
            this.cdr.detectChanges();
          } else {
            this.errorMessage = res.message ?? 'Failed to submit winning bid.';
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.isSubmittingBid = false;
          this.errorMessage = 'Failed to submit bid. Please try manually.';
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.errorMessage = '';
    this.svc.stopLocalTimer();
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void { this.showConfirmModal = false; }

  confirmWinner(): void {
    if (!this.selected) {
      this.errorMessage = 'No auction selected.';
      return;
    }

    // Use the locked snapshot's bidId when available so a late WebSocket update
    // cannot swap in a different bid ID after admin has already locked a winner.
    const winnerBid = this.lockedWinnerBid ?? this.highestBid ?? this.bids.find(b => b.isWinning);
    // Prefer the live row's bidId (updated by createBid response) over the snapshot
    const liveRow = this.bids.find(b => b.enrollmentId === winnerBid?.enrollmentId);
    const bidId = liveRow?.bidId ?? winnerBid?.bidId;

    if (!winnerBid) {
      this.errorMessage = 'Cannot confirm: no winning bid found.';
      return;
    }

    if (!bidId) {
      this.errorMessage = 'Winning bid not yet submitted. Click Submit on the highest bid row first.';
      return;
    }

    this.isConfirmingWinner = true;
    this.errorMessage = '';

    this.svc.selectWinner(this.selected.id, bidId).subscribe({
      next: (res) => {
        this.isConfirmingWinner = false;
        if (!res.success) {
          this.errorMessage = res.message ?? 'Failed to confirm winner.';
          this.cdr.detectChanges();
          return;
        }
        const confirmedId = this.selected!.id;
        const idx = this.allAuctions.findIndex(a => a.id === confirmedId);
        if (idx >= 0) {
          const updated = {
            ...this.allAuctions[idx],
            winningBidId: bidId,
            winningBidAmount: winnerBid.bidAmount,
            netPayable: this.calc.netPayable,
            status: 'CLOSED'
          };
          this.allAuctions[idx] = updated;
          const groupIndex = this.groupAuctions.findIndex(a => a.id === updated.id);
          if (groupIndex >= 0) { this.groupAuctions[groupIndex] = updated; }
        }
        this.showConfirmModal = false;
        this.showSuccessModal = true;
        this.svc.clearAuctionsCache();
        this.cdr.detectChanges();
        // After brief success flash, wipe all data while keeping the UI shell visible
        setTimeout(() => {
          this.showSuccessModal = false;
          this.svc.resetTimerState();
          this.svc.disconnectFromAuction();
          this.bids = [];
          this.lockedWinnerBid = null;
          this.promotedBidEnrollmentId = null;
          this._prevHighestEnrollmentId = null;
          this.isDiceRolling = false;
          this.diceWinnerId = null;
          this.winningBidConfirmed = false;
          this.auctionLocked = false;
          this.errorMessage = '';
          this.calc = { chitAmount: 0, winningBid: 0, bidLoss: 0, commissionPct: 5, commissionAmount: 0, dividendPerMember: 0, netPayable: 0 };
          this.header = { auctionNumber: 0, groupName: '—', currentAuction: 0, totalAuctions: 0, auctionDate: '—', totalMembers: 0, maxMembers: 0, status: 'CLOSED' };
          if (this.selected) { this.selected = { ...this.selected, status: 'CLOSED' }; }
          this.cdr.detectChanges();
        }, 2000);
      },
      error: () => {
        this.isConfirmingWinner = false;
        this.errorMessage = 'Failed to confirm winner. Please try again.';
        this.cdr.detectChanges();
      }
    });
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
          background:${b.status === 'Highest Bid' ? '#dcfce7' : b.status === 'Outbid' ? '#dbeafe' : '#f3f4f6'};
          color:${b.status === 'Highest Bid' ? '#166534' : b.status === 'Outbid' ? '#1e40af' : '#374151'}">
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
      <p class="sub">Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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

  formatHistoryStatus(status?: string | null): string {
    const value = (status ?? 'CLOSED').toString().trim();
    return value ? value.replace(/_/g, ' ').toUpperCase() : 'CLOSED';
  }

  formatDisplayDate(date: string): string {
    return this.fmtDate(date);
  }

  private setHeader(item: AuctionItem, _total: number): void {
    this.header = {
      auctionNumber: item.auctionNumber,
      groupName: item.groupName,
      currentAuction: item.auctionNumber,
      totalAuctions: item.maxMembers || _total,
      auctionDate: this.fmtDate(item.auctionDate),
      totalMembers: 0,
      maxMembers: item.maxMembers,
      status: item.status || 'CLOSED',
    };
  }

  isLiveAuctionStatus(status?: string | null): boolean {
    const normalized = (status ?? '').trim().toLowerCase();
    return normalized === 'live' || normalized === 'active' || normalized === 'running';
  }

  private setCalcBase(item: AuctionItem): void {
    const commissionPct = item.commissionPct ?? 5;
    const commissionAmount = (item.chitAmount * commissionPct) / 100;
    this.calc = {
      chitAmount: item.chitAmount,
      winningBid: item.winningBidAmount ?? 0,
      bidLoss: item.bidLossAmount ?? 0,
      commissionPct,
      commissionAmount,
      dividendPerMember: item.dividendPerMember ?? 0,
      netPayable: item.netPayable ?? 0,
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
          subscriber: e.subscriberName || `Member #${e.id}`,
          bidAmount: bid?.bidAmount ?? 0,
          bidId: bid?.id ?? null,
          isWinning: bid ? bid.bidAmount === highest : false,
          channel: bid?.channel ?? 'offline',
          status: bid ? (bid.bidAmount === highest ? 'Highest Bid' : 'Outbid') : 'No Bid',
        };
      });
    }

    return existingBids.map((b, i): BidRow => ({
      ticketNumber: `T${String(i + 1).padStart(3, '0')}`,
      enrollmentId: b.enrollmentId,
      subscriber: `Member #${b.enrollmentId}`,
      bidAmount: b.bidAmount,
      bidId: b.id,
      isWinning: b.bidAmount === highest,
      channel: b.channel,
      status: b.bidAmount === highest ? 'Highest Bid' : 'Outbid',
    }));
  }

  private refreshSelectedAuction(): void {
    // Local refresh logic
    this.cdr.detectChanges();
  }

  private fmtDate(d: string): string {
    if (!d) { return ''; }
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }
}
