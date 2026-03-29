import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  AuctionsService,
  AuctionResponse,
  AuctionBidResponse,
  EnrollmentResponse,
  ChitGroupDto,
  ApiResponse,
} from '../../service/auction.service';

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
  status          : string;
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

  isLoading          = false;
  isSubmittingBid    = false;
  isConfirmingWinner = false;
  showConfirmModal   = false;
  showSuccessModal   = false;
  errorMessage       = '';

  // Data arrays
  chitGroups      : ChitGroupDto[] = [];
  allAuctions     : AuctionItem[] = [];
  groupAuctions   : AuctionItem[] = []; 
  bids            : BidRow[]      = [];
  
  // Timer state
  timerValue: number = 180; // 3 minutes in seconds
  timerInterval: any;
  isTimerRunning = false;
  auctionLocked = false;

  // Selections
  selectedGroupId : number | null = null;
  selected        : AuctionItem | null = null;

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

  constructor(private svc: AuctionsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // initial loads happen here
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startAuction(): void {
    if (this.isTimerRunning) return;
    this.isTimerRunning = true;
    this.auctionLocked = false;
    this.timerValue = 180; // 3 mins default
    this.cdr.detectChanges();
    
    this.timerInterval = setInterval(() => {
      if (this.timerValue > 0) {
        this.timerValue--;
        this.cdr.detectChanges();
      } else {
        this.stopAuction();
      }
    }, 1000);
  }

  stopAuction(): void {
    this.stopTimer();
    this.isTimerRunning = false;
    this.auctionLocked = true;
    this.cdr.detectChanges();
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  get formattedTimer(): string {
    const min = Math.floor(this.timerValue / 60);
    const sec = this.timerValue % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadPage();
    }, 0);
  }

  private loadPage(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    // Fetch BOTH Chit Groups and Auctions
    forkJoin({
      groups  : this.svc.listChitGroups(),
      auctions: this.svc.listAuctions()
    }).pipe(
      switchMap(({ groups, auctions }) => {
        this.chitGroups = groups.data ?? [];
        const aList = auctions.data ?? [];

        if (!aList.length) {
          return of({ items: [] as AuctionItem[], bids: [] as AuctionBidResponse[], enrollments: [] as EnrollmentResponse[], first: null });
        }

        const items: AuctionItem[] = aList.map((a: AuctionResponse): AuctionItem => ({
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
        }));

        this.allAuctions = items;

        if (this.chitGroups.length > 0) {
          this.selectedGroupId = this.chitGroups[0].id;
          this.filterAuctionsByGroup();
        }

        const first = this.groupAuctions.length > 0 ? this.groupAuctions[0] : items[0];

        if (!first) {
           return of({ items, bids: [], enrollments: [], first: null });
        }

        return forkJoin({
          bids       : this.svc.listBids(first.id),
          enrollments: this.svc.getEnrollments(first.chitGroupId),
        }).pipe(
          switchMap(({ bids, enrollments }) => of({
            items,
            bids       : bids.data ?? [] as AuctionBidResponse[],
            enrollments: enrollments.data ?? [] as EnrollmentResponse[],
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

  onGroupSelect(event: Event): void {
    const groupId = Number((event.target as HTMLSelectElement).value);
    this.selectedGroupId = groupId;
    this.filterAuctionsByGroup();
    
    if (this.groupAuctions.length > 0) {
      this.switchTo(this.groupAuctions[0]);
    } else {
      this.selected = null;
      this.bids = [];
    }
  }

  onAuctionSelect(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    const item = this.allAuctions.find(a => a.id === id);
    if (item && item.id !== this.selected?.id) { this.switchTo(item); }
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
    this.bids      = [];
    this.selected  = item;
    
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
          bid.bidId  = res.data.id;
          bid.status = 'Bid Paid';
          this.recalculate();
          this.cdr.detectChanges();
        } else {
          this.errorMessage = res.message ?? 'Bid rejected — must be lower than current lowest bid.';
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
    if (!this.highestBid)             { this.errorMessage = 'No bids placed yet.';         return; }
    if (this.selected?.winningBidId)  { this.errorMessage = 'Winner already confirmed.';   return; }
    this.errorMessage     = '';
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void { this.showConfirmModal = false; }

  confirmWinner(): void {
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
            this.allAuctions[idx] = {
              ...this.allAuctions[idx],
              winningBidId    : res.data.winningBidId,
              winningBidAmount: res.data.winningBidAmount,
              netPayable      : res.data.netPayable,
            };
            this.selected = this.allAuctions[idx];
          }
          this.showConfirmModal = false;
          this.showSuccessModal = true;
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

  closeSuccessModal(): void { this.showSuccessModal = false; }

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
    const lowest = existingBids.length
      ? Math.min(...existingBids.map(b => b.bidAmount)) : 0;

    if (enrollments.length > 0) {
      return enrollments.map((e): BidRow => {
        const bid = existingBids.find(b => b.enrollmentId === e.id);
        return {
          ticketNumber: `T${String(e.ticketNo).padStart(3, '0')}`,
          enrollmentId: e.id,
          subscriber  : e.subscriberName || `Member #${e.id}`,
          bidAmount   : bid?.bidAmount ?? 0,
          bidId       : bid?.id        ?? null,
          isWinning   : bid ? bid.bidAmount === lowest : false,
          channel     : bid?.channel ?? 'offline',
          status      : bid ? (bid.bidAmount === lowest ? 'Highest Bid' : 'Bid Paid') : 'No Bid',
        };
      });
    }

    return existingBids.map((b, i): BidRow => ({
      ticketNumber: `T${String(i + 1).padStart(3, '0')}`,
      enrollmentId: b.enrollmentId,
      subscriber  : `Member #${b.enrollmentId}`,
      bidAmount   : b.bidAmount,
      bidId       : b.id,
      isWinning   : b.bidAmount === lowest,
      channel     : b.channel,
      status      : b.bidAmount === lowest ? 'Highest Bid' : 'Bid Paid',
    }));
  }

  private fmtDate(d: string): string {
    if (!d) { return ''; }
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }
}