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
}

interface BidRow {
  ticketNumber: string;
  enrollmentId: number;
  subscriber: string;
  bidAmount: number;
  bidId: number | null;
  isWinning: boolean;
  channel: string;
  status: 'No Bid' | 'Bid Paid' | 'Highest Bid';
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
  imports: [CommonModule, FormsModule, RouterModule],
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
  errorMessage = '';
  activePanel: 'none' | 'details' = 'none';

  // Data arrays
  chitGroups: ChitGroupDto[] = [];
  allAuctions: AuctionItem[] = [];
  groupAuctions: AuctionItem[] = [];
  bids: BidRow[] = [];

  // Timer state
  timerValue: number = 180; // 3 minutes in seconds
  timerInterval: any;
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

  get globalLiveAuction(): AuctionItem | undefined {
    return this.allAuctions.find(a => this.isLiveAuctionStatus(a.status));
  }

  get headerActionLabel(): string {
    return this.globalLiveAuction ? 'View' : 'Start Auction';
  }

  get auctionListRouteId(): number {
    return this.globalLiveAuction?.id ?? this.allAuctions[0]?.id ?? 10100;
  }


  // --- MOCK DATA FOR UI TESTING ---
  private readonly MOCK_GROUPS: ChitGroupDto[] = [
    { id: 101, groupName: 'T1-GOLD-100K', chitAmount: 100000 },
    { id: 102, groupName: 'T2-PREMIUM-500K', chitAmount: 500000 },
    { id: 103, groupName: 'T3-SAVINGS-200K', chitAmount: 200000 },
    { id: 104, groupName: 'A1-EXPRESS-50K', chitAmount: 50000 },
    { id: 105, groupName: 'B1-PLATINUM-1M', chitAmount: 1000000 },
    { id: 106, groupName: 'C1-SILVER-150K', chitAmount: 150000 },
    { id: 107, groupName: 'D1-BRONZE-75K', chitAmount: 75000 },
    { id: 108, groupName: 'E1-MERCURY-300K', chitAmount: 300000 },
    { id: 109, groupName: 'F1-VENUS-400K', chitAmount: 400000 },
    { id: 110, groupName: 'G1-MARS-250K', chitAmount: 250000 },
    { id: 111, groupName: 'H1-JUPITER-600K', chitAmount: 600000 },
    { id: 112, groupName: 'I1-SATURN-800K', chitAmount: 800000 },
    { id: 113, groupName: 'J1-URANUS-120K', chitAmount: 120000 },
    { id: 114, groupName: 'K1-NEPTUNE-90K', chitAmount: 90000 },
    { id: 115, groupName: 'L1-PLUTO-30K', chitAmount: 30000 }
  ];

  private readonly MOCK_AUCTIONS_LIST: AuctionItem[] = [
    // --- Group 101: 24 Months of History ---
    ...Array.from({ length: 24 }, (_, i) => ({
      id: 10100 + i,
      auctionNumber: i + 1,
      groupName: 'T1-GOLD-100K',
      auctionDate: `2024-${(i % 12 + 1).toString().padStart(2, '0')}-10`,
      chitGroupId: 101,
      chitAmount: 100000,
      maxMembers: 50,
      commissionPct: 5,
      status: i < 5 ? 'CLOSED' : (i === 5 ? 'LIVE' : 'ACTIVE'),
      winningBidAmount: i < 5 ? 70000 + (i * 1000) : undefined,
      netPayable: i < 5 ? 72000 + (i * 1100) : undefined
    })),
    // --- Group 102: 12 Months ---
    ...Array.from({ length: 12 }, (_, i) => ({
      id: 10200 + i,
      auctionNumber: i + 1,
      groupName: 'T2-PREMIUM-500K',
      auctionDate: `2024-${(i % 12 + 1).toString().padStart(2, '0')}-15`,
      chitGroupId: 102,
      chitAmount: 500000,
      maxMembers: 30,
      commissionPct: 5,
      status: i < 3 ? 'CLOSED' : 'ACTIVE',
      winningBidAmount: i < 3 ? 400000 + (i * 5000) : undefined
    })),
    // --- Group 105: High Value ---
    ...Array.from({ length: 12 }, (_, i) => ({
      id: 10500 + i,
      auctionNumber: i + 1,
      groupName: 'B1-PLATINUM-1M',
      auctionDate: `2024-${(i % 12 + 1).toString().padStart(2, '0')}-25`,
      chitGroupId: 105,
      chitAmount: 1000000,
      maxMembers: 20,
      commissionPct: 5,
      status: 'ACTIVE'
    })),
    // --- Mix for other groups ---
    { id: 7, auctionNumber: 1, groupName: 'A1-EXPRESS-50K', auctionDate: '2025-01-05', chitGroupId: 104, chitAmount: 50000, maxMembers: 25, commissionPct: 5, status: 'ACTIVE' },
    { id: 9, auctionNumber: 1, groupName: 'C1-SILVER-150K', auctionDate: '2025-01-12', chitGroupId: 106, chitAmount: 150000, maxMembers: 40, commissionPct: 5, status: 'ACTIVE' },
    { id: 10, auctionNumber: 1, groupName: 'D1-BRONZE-75K', auctionDate: '2025-01-18', chitGroupId: 107, chitAmount: 75000, maxMembers: 50, commissionPct: 3, status: 'ACTIVE' }
  ];

  private readonly MOCK_MEMBERS: EnrollmentResponse[] = [
    { id: 1, ticketNo: 1, subscriberName: 'Ramesh Kumar', chitGroupId: 101, subscriberId: 1001, status: 'Active' },
    { id: 2, ticketNo: 2, subscriberName: 'Sneha Reddy', chitGroupId: 101, subscriberId: 1002, status: 'Active' },
    { id: 3, ticketNo: 3, subscriberName: 'Mohan Lal', chitGroupId: 101, subscriberId: 1003, status: 'Active' },
    { id: 4, ticketNo: 4, subscriberName: 'Anita Devi', chitGroupId: 101, subscriberId: 1004, status: 'Active' },
    { id: 5, ticketNo: 5, subscriberName: 'Prakash Raj', chitGroupId: 101, subscriberId: 1005, status: 'Active' },
    { id: 6, ticketNo: 6, subscriberName: 'Kavitha S.', chitGroupId: 101, subscriberId: 1006, status: 'Active' },
    { id: 7, ticketNo: 7, subscriberName: 'Sanjay Dutt', chitGroupId: 101, subscriberId: 1007, status: 'Active' },
    { id: 8, ticketNo: 8, subscriberName: 'Lakshmi N.', chitGroupId: 101, subscriberId: 1008, status: 'Active' },
    { id: 9, ticketNo: 9, subscriberName: 'Prashanth V.', chitGroupId: 101, subscriberId: 1009, status: 'Active' },
    { id: 10, ticketNo: 10, subscriberName: 'Deepak Chopra', chitGroupId: 101, subscriberId: 1010, status: 'Active' },
    { id: 11, ticketNo: 11, subscriberName: 'Meera Jasmine', chitGroupId: 101, subscriberId: 1011, status: 'Active' },
    { id: 12, ticketNo: 12, subscriberName: 'Arjun Das', chitGroupId: 101, subscriberId: 1012, status: 'Active' },
    { id: 13, ticketNo: 13, subscriberName: 'Bhavana P.', chitGroupId: 101, subscriberId: 1013, status: 'Active' },
    { id: 14, ticketNo: 14, subscriberName: 'Chiranjeevi K.', chitGroupId: 101, subscriberId: 1014, status: 'Active' },
    { id: 15, ticketNo: 15, subscriberName: 'Dhanush R.', chitGroupId: 101, subscriberId: 1015, status: 'Active' },
    { id: 16, ticketNo: 16, subscriberName: 'Eshwar Rao', chitGroupId: 101, subscriberId: 1016, status: 'Active' },
    { id: 17, ticketNo: 17, subscriberName: 'Farhan Akhtar', chitGroupId: 101, subscriberId: 1017, status: 'Active' },
    { id: 18, ticketNo: 18, subscriberName: 'Ganesh H.', chitGroupId: 101, subscriberId: 1018, status: 'Active' },
    { id: 19, ticketNo: 19, subscriberName: 'Harini M.', chitGroupId: 101, subscriberId: 1019, status: 'Active' },
    { id: 20, ticketNo: 20, subscriberName: 'Ishaan K.', chitGroupId: 101, subscriberId: 1020, status: 'Active' },
    { id: 21, ticketNo: 21, subscriberName: 'Jyothi S.', chitGroupId: 101, subscriberId: 1021, status: 'Active' },
    { id: 22, ticketNo: 22, subscriberName: 'Kishore J.', chitGroupId: 101, subscriberId: 1022, status: 'Active' },
    { id: 23, ticketNo: 23, subscriberName: 'Latha G.', chitGroupId: 101, subscriberId: 1023, status: 'Active' },
    { id: 24, ticketNo: 24, subscriberName: 'Manoj B.', chitGroupId: 101, subscriberId: 1024, status: 'Active' },
    { id: 25, ticketNo: 25, subscriberName: 'Nandini R.', chitGroupId: 101, subscriberId: 1025, status: 'Active' },
    { id: 26, ticketNo: 26, subscriberName: 'Omprakash L.', chitGroupId: 101, subscriberId: 1026, status: 'Active' },
    { id: 27, ticketNo: 27, subscriberName: 'Pallavi D.', chitGroupId: 101, subscriberId: 1027, status: 'Active' },
    { id: 28, ticketNo: 28, subscriberName: 'Qamar S.', chitGroupId: 101, subscriberId: 1028, status: 'Active' },
    { id: 29, ticketNo: 29, subscriberName: 'Ravi Teja', chitGroupId: 101, subscriberId: 1029, status: 'Active' },
    { id: 30, ticketNo: 30, subscriberName: 'Suresh Raina', chitGroupId: 101, subscriberId: 1030, status: 'Active' }
  ];

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

  ngOnInit(): void {
    this.loadAuctionWorkspace();
  }

  ngOnDestroy(): void {
    this.stopLocalTimer();
    this.svc.disconnectFromAuction();
  }

  private loadAuctionWorkspace(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    // Immediate local data assignment
    this.chitGroups = [...this.MOCK_GROUPS];
    this.allAuctions = [...this.MOCK_AUCTIONS_LIST];

    this.selectedGroupId = this.chitGroups[0]?.id ?? null;
    this.filterAuctionsByGroup();
    const liveAuction = this.globalLiveAuction ?? null;
    if (liveAuction) {
      this.selectedAuctionId = liveAuction.id;
      this.loadAuctionDetails(liveAuction);
      this.activePanel = 'details';
    } else {
      this.selectedAuctionId = this.groupAuctions[0]?.id ?? null;
      this.resetAuctionViewState(false);
      this.activePanel = 'none';
    }
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private legacyViewAuction(): void {
    const item = this.getSelectedAuction();
    if (!item) {
      this.errorMessage = 'Select a chit group and auction month first.';
      return;
    }

    this.errorMessage = '';
    this.loadAuctionDetails(item);
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
    this.stopLocalTimer();
    this.svc.disconnectFromAuction();
    this.selected = null;
    this.bids = [];
    this.currentSession = null;
    this.showConfirmModal = false;
    this.showSuccessModal = false;
    this.isTimerRunning = false;
    this.auctionLocked = false;
    this.isDetailLoading = isDetailLoading;
    this.timerValue = 180;
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
    this.selected = item;
    this.setHeader(item, this.groupAuctions.length);
    this.setCalcBase(item);

    // Immediate local data assignment for auction details
    this.bids = this.buildRows(this.MOCK_MEMBERS, []);
    this.header.totalMembers = this.bids.length;

    this.isDetailLoading = false;
    this.cdr.detectChanges();
  }

  startAuction(id?: number): void {
    const targetId = id ?? this.selected?.id;
    if (this.isTimerRunning || !targetId) return;

    // Simulate start locally
    this.isTimerRunning = true;
    this.timerValue = 180;
    this.header.status = 'LIVE';
    this.startLocalTimer();
    this.cdr.detectChanges();
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
    this.stopLocalTimer();
    this.isTimerRunning = false;
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
      this.timerValue = session.remainingSeconds;
      this.isTimerRunning = true;
      this.auctionLocked = false;
      this.startLocalTimer();
    } else {
      this.timerValue = session.remainingSeconds; // might be 0
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

        const first = this.groupAuctions.length > 0 ? this.groupAuctions[0] : items[0];

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
    if (!this.selected || bid.bidAmount <= 0) {
      this.errorMessage = 'Enter a valid bid amount greater than zero.';
      return;
    }
    this.isSubmittingBid = true;
    this.errorMessage = '';

    // Simulate bid submission locally
    setTimeout(() => {
      this.isSubmittingBid = false;
      const index = this.bids.findIndex(b => b.enrollmentId === bid.enrollmentId);
      if (index >= 0) {
        this.bids[index].bidAmount = bid.bidAmount;
        this.bids[index].channel = 'offline';
        this.recalculate();
      }
      this.cdr.detectChanges();
    }, 400);
  }

  recalculate(): void {
    const placed = this.bids.filter(b => b.bidAmount > 0);
    if (!placed.length) { return; }

    // Highest amount wins
    const highest = Math.max(...placed.map(b => b.bidAmount));
    this.bids.forEach(b => {
      if (b.bidAmount > 0) {
        b.isWinning = b.bidAmount === highest;
        b.status = b.isWinning ? 'Highest Bid' : 'Bid Paid';
      } else {
        b.status = 'No Bid';
      }
    });

    // Create NEW array reference so Angular *ngFor re-renders rows in sorted order
    this.bids = [...this.bids].sort((a, b) => b.bidAmount - a.bidAmount);
    this.cdr.detectChanges(); // Force immediate repaint so highest row jumps to top instantly

    const chit = this.calc.chitAmount;
    const pct = this.calc.commissionPct;
    const members = this.header.maxMembers || this.header.totalMembers || placed.length || 1;
    const bidLoss = chit - highest;
    const commission = (chit * pct) / 100;
    const dividend = members > 0 ? (bidLoss - commission) / members : 0;

    this.calc = {
      ...this.calc,
      winningBid: highest,
      bidLoss,
      commissionAmount: commission,
      dividendPerMember: dividend,
      netPayable: highest - commission + dividend,
    };
  }

  openConfirmModal(): void {
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

    if (!winnerBid) {
      this.errorMessage = 'Cannot confirm: no winning bid found.';
      return;
    }

    this.isConfirmingWinner = true;
    this.errorMessage = '';

    // Simulate local success
    setTimeout(() => {
      this.isConfirmingWinner = false;
      const idx = this.allAuctions.findIndex(a => a.id === this.selected!.id);
      if (idx >= 0) {
        const updated = {
          ...this.allAuctions[idx],
          winningBidId: 999,
          winningBidAmount: winnerBid.bidAmount,
          netPayable: winnerBid.bidAmount - (this.calc.chitAmount * 0.05),
          status: 'CLOSED'
        };
        this.allAuctions[idx] = updated;
        const groupIndex = this.groupAuctions.findIndex(a => a.id === updated.id);
        if (groupIndex >= 0) { this.groupAuctions[groupIndex] = updated; }
        this.selected = updated;
        this.setHeader(updated, this.groupAuctions.length);
        this.setCalcBase(updated);
      }
      this.showConfirmModal = false;
      this.showSuccessModal = true;
      this.cdr.detectChanges();
      setTimeout(() => { this.showSuccessModal = false; this.cdr.detectChanges(); }, 2000);
    }, 600);
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

  private setHeader(item: AuctionItem, total: number): void {
    this.header = {
      auctionNumber: item.auctionNumber,
      groupName: item.groupName,
      currentAuction: item.auctionNumber,
      totalAuctions: total,
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
    this.calc = {
      chitAmount: item.chitAmount,
      winningBid: item.winningBidAmount ?? 0,
      bidLoss: item.bidLossAmount ?? 0,
      commissionPct: item.commissionPct,
      commissionAmount: 0,
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
          status: bid ? (bid.bidAmount === highest ? 'Highest Bid' : 'Bid Paid') : 'No Bid',
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
      status: b.bidAmount === highest ? 'Highest Bid' : 'Bid Paid',
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
