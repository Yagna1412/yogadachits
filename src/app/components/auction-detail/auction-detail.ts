import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

import {
  AuctionBidResponse,
  AuctionResponse,
  AuctionSessionResponse,
  AuctionsService,
  ChitGroupDto,
  EnrollmentResponse,
} from '../../service/auction.service';

interface AuctionSummary {
  id: number;
  chitGroupId: number;
  groupName: string;
  auctionNumber: number;
  auctionDate: string;
  chitAmount: number;
  maxMembers: number;
  commissionPct: number;
  winningBidId?: number;
  winningBidAmount?: number;
  bidLossAmount?: number;
  dividendSnapshot?: number;
  dividendPerMember?: number;
  installmentDueDate?: string;
  installmentNo?: number;
  winnerEnrollmentId?: number;
  winnerSubscriberId?: number;
  bidderType?: string;
  netPayable?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BidRow {
  ticketNumber: string;
  enrollmentId: number;
  subscriber: string;
  subscriberId: number;
  memberStatus: string;
  bidAmount: number;
  bidId: number | null;
  bidTime: string;
  createdAt: string;
  channel: string;
  status: 'No Bid' | 'Bid Paid' | 'Highest Bid';
  isWinning: boolean;
}

interface DetailField {
  label: string;
  value: string;
  tone?: 'primary' | 'success' | 'warning' | 'muted';
}

interface HeaderState {
  auctionNumber: number;
  groupName: string;
  currentAuction: number;
  totalAuctions: number;
  auctionDate: string;
  totalMembers: number;
  maxMembers: number;
}

interface CalcState {
  chitAmount: number;
  winningBid: number;
  bidLoss: number;
  commissionPct: number;
  commissionAmount: number;
  dividendPerMember: number;
  netPayable: number;
}

interface AuctionDetailState {
  selected?: AuctionSummary;
  header?: HeaderState;
  calc?: CalcState;
  bids?: BidRow[];
  session?: AuctionSessionResponse | null;
}

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './auction-detail.html',
  styleUrl: './auction-detail.scss',
})
export class AuctionDetailComponent implements OnInit, OnDestroy {
  private readonly AUCTION_TIMER_SECONDS = 300;

  isLoading = false;
  errorMessage = '';
  auctionId: number | null = null;
  isLoadingSelectors = false;
  public timerValue: number = this.AUCTION_TIMER_SECONDS;
  isTimerRunning = false;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  chitGroups: ChitGroupDto[] = [];
  allAuctions: AuctionSummary[] = [];
  groupAuctions: AuctionSummary[] = [];
  selectedGroupId: number | null = null;
  selectedAuctionId: number | null = null;
  private routeSubscription: Subscription | null = null;
  private pendingRouteAuctionId: number | null = null;

  selected: AuctionSummary | null = null;
  session: AuctionSessionResponse | null = null;
  bids: BidRow[] = [];

  header: HeaderState = {
    auctionNumber: 0,
    groupName: '',
    currentAuction: 0,
    totalAuctions: 0,
    auctionDate: '',
    totalMembers: 0,
    maxMembers: 0,
  };

  calc: CalcState = {
    chitAmount: 0,
    winningBid: 0,
    bidLoss: 0,
    commissionPct: 5,
    commissionAmount: 0,
    dividendPerMember: 0,
    netPayable: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: AuctionsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSelectorData();
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const rawId = params.get('auctionId');
      const parsed = rawId ? Number(rawId) : 10100;
      const auctionId = Number.isFinite(parsed) ? parsed : 10100;

      this.pendingRouteAuctionId = auctionId;
      this.auctionId = auctionId;
      this.applyRouteSelection();
      this.loadAuctionDetail(auctionId);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.stopLocalTimer();
    this.svc.disconnectFromAuction();
  }

  reload(): void {
    if (this.auctionId === null) {
      return;
    }
    this.loadAuctionDetail(this.auctionId);
  }

  onGroupSelect(groupId: number | null): void {
    this.selectedGroupId = groupId === null ? null : Number(groupId);
    this.filterAuctionsByGroup();
    if (this.groupAuctions.length > 0) {
      this.selectedAuctionId = this.groupAuctions[0].id;
    } else {
      this.selectedAuctionId = null;
    }
  }

  onAuctionSelect(auctionId: number | null): void {
    this.selectedAuctionId = auctionId === null ? null : Number(auctionId);
  }

  viewSelectedAuctionDetail(): void {
    if (!this.selectedAuctionId) {
      this.errorMessage = 'Select a chit group and auction month first.';
      return;
    }

    this.errorMessage = '';
    this.router.navigate(['/admin/auctions/view', this.selectedAuctionId]);
  }

  get globalLiveAuction(): AuctionSummary | undefined {
    return this.allAuctions.find((item) => this.isLiveAuctionStatus(item.status));
  }

  get headerActionLabel(): string {
    return this.globalLiveAuction ? 'View' : 'Start Auction';
  }

  get formattedTimer(): string {
    const minutes = Math.floor(this.timerValue / 60);
    const seconds = this.timerValue % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  onHeaderAction(): void {
    const liveAuction = this.globalLiveAuction;
    if (liveAuction) {
      if (this.auctionId !== liveAuction.id) {
        this.router.navigate(['/admin/auctions/view', liveAuction.id]);
      } else {
        this.loadAuctionDetail(liveAuction.id);
      }
      return;
    }

    const targetAuctionId = this.selectedAuctionId
      ?? this.groupAuctions[0]?.id
      ?? this.allAuctions[0]?.id
      ?? null;

    if (!targetAuctionId) {
      this.errorMessage = 'No auction available to start.';
      return;
    }

    const targetAuction = this.allAuctions.find((item) => item.id === targetAuctionId) ?? null;
    if (!targetAuction) {
      this.errorMessage = 'Selected auction could not be found.';
      return;
    }

    this.errorMessage = '';
    this.allAuctions = this.allAuctions.map((item) => {
      if (item.id === targetAuctionId) {
        return { ...item, status: 'LIVE' };
      }
      return item;
    });

    this.selectedGroupId = targetAuction.chitGroupId;
    this.filterAuctionsByGroup();
    this.selectedAuctionId = targetAuctionId;
    this.pendingRouteAuctionId = targetAuctionId;
    this.auctionId = targetAuctionId;

    this.resetTimer();
    this.startLocalTimer();

    if (this.route.snapshot.paramMap.get('auctionId') !== String(targetAuctionId)) {
      this.router.navigate(['/admin/auctions/view', targetAuctionId]);
    } else {
      this.loadAuctionDetail(targetAuctionId);
    }
  }

  private readonly MOCK_AUCTION: AuctionSummary = {
    id: 10100,
    chitGroupId: 101,
    groupName: 'T1-GOLD-100K',
    auctionNumber: 10,
    auctionDate: '2024-10-10',
    chitAmount: 100000,
    maxMembers: 50,
    commissionPct: 5,
    winningBidId: 501,
    winningBidAmount: 85000,
    bidLossAmount: 15000,
    dividendSnapshot: 10000,
    dividendPerMember: 200,
    installmentDueDate: '2024-10-25',
    installmentNo: 10,
    winnerEnrollmentId: 1001,
    winnerSubscriberId: 1,
    bidderType: 'Member',
    netPayable: 80200,
    status: 'CLOSED',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-10-10T11:00:00Z'
  };

  private readonly MOCK_GROUPS: ChitGroupDto[] = [
    { id: 101, groupName: 'T1-GOLD-100K', chitAmount: 100000 },
    { id: 102, groupName: 'T2-PREMIUM-500K', chitAmount: 500000 },
    { id: 103, groupName: 'T3-SAVINGS-200K', chitAmount: 200000 },
  ];

  private readonly MOCK_AUCTIONS: AuctionSummary[] = [
    {
      ...this.MOCK_AUCTION,
      id: 10100,
      auctionNumber: 10,
      status: 'CLOSED',
    },
    {
      ...this.MOCK_AUCTION,
      id: 10101,
      auctionNumber: 11,
      auctionDate: '2024-11-10',
      status: 'CLOSED',
    },
    {
      ...this.MOCK_AUCTION,
      id: 10200,
      chitGroupId: 102,
      groupName: 'T2-PREMIUM-500K',
      chitAmount: 500000,
      auctionNumber: 4,
      auctionDate: '2024-10-15',
      status: 'CLOSED',
    },
  ];

  private readonly MOCK_BIDS: BidRow[] = Array.from({ length: 30 }, (_, i) => ({
    ticketNumber: `T${String(i + 1).padStart(3, '0')}`,
    enrollmentId: 1000 + i,
    subscriber: [
      'Ramesh Kumar', 'Sneha Reddy', 'Mohan Lal', 'Anita Devi', 'Prakash Raj',
      'Kavitha S.', 'Sanjay Dutt', 'Lakshmi N.', 'Prashanth V.', 'Deepak Chopra',
      'Meera Jasmine', 'Arjun Das', 'Bhavana P.', 'Chiranjeevi K.', 'Dhanush R.',
      'Eshwar Rao', 'Farhan Akhtar', 'Ganesh H.', 'Harini M.', 'Ishaan K.',
      'Jyothi S.', 'Kishore J.', 'Latha G.', 'Manoj B.', 'Nandini R.',
      'Omprakash L.', 'Pallavi D.', 'Qamar S.', 'Ravi Teja', 'Suresh Raina'
    ][i] || `Member #${i + 1}`,
    subscriberId: i + 1,
    memberStatus: 'Active',
    bidAmount: i === 0 ? 85000 : (i < 5 ? 70000 - i * 2000 : 0),
    bidId: i < 5 ? 501 + i : null,
    bidTime: i < 5 ? `2024-10-10T10:0${i + 1}:00Z` : '',
    createdAt: i < 5 ? `2024-10-10T10:0${i + 1}:00Z` : '',
    channel: i % 2 === 0 ? 'online' : 'offline',
    status: i === 0 ? 'Highest Bid' : (i < 5 ? 'Bid Paid' : 'No Bid'),
    isWinning: i === 0
  }));

  private loadSelectorData(): void {
    this.isLoadingSelectors = true;

    forkJoin({
      groups: this.svc.listChitGroups().pipe(catchError(() => of(null))),
      auctions: this.svc.listAuctions().pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ groups, auctions }) => {
        const groupData = this.extractData<ChitGroupDto[]>(groups) ?? [];
        const auctionData = this.normalizeAuctionList(this.extractData<AuctionResponse[]>(auctions));

        this.allAuctions = auctionData.length > 0 ? auctionData : [...this.MOCK_AUCTIONS];
        this.chitGroups = groupData.length > 0 ? groupData : this.deriveGroupsFromAuctions(this.allAuctions);

        if (!this.chitGroups.length) {
          this.chitGroups = [...this.MOCK_GROUPS];
        }

        this.applyRouteSelection();
        if (this.auctionId !== null) {
          this.loadAuctionDetail(this.auctionId);
        }
        this.isLoadingSelectors = false;
      },
      error: () => {
        this.allAuctions = [...this.MOCK_AUCTIONS];
        this.chitGroups = [...this.MOCK_GROUPS];
        this.applyRouteSelection();
        if (this.auctionId !== null) {
          this.loadAuctionDetail(this.auctionId);
        }
        this.isLoadingSelectors = false;
      },
    });
  }

  private applyRouteSelection(): void {
    if (this.pendingRouteAuctionId === null) {
      return;
    }

    const routeAuction = this.allAuctions.find((item) => item.id === this.pendingRouteAuctionId);
    if (routeAuction) {
      this.selectedGroupId = routeAuction.chitGroupId;
      this.filterAuctionsByGroup();
      this.selectedAuctionId = routeAuction.id;
      return;
    }

    if (this.selectedGroupId === null && this.chitGroups.length > 0) {
      this.selectedGroupId = this.chitGroups[0].id;
    }

    this.filterAuctionsByGroup();
    if (this.selectedAuctionId === null && this.groupAuctions.length > 0) {
      this.selectedAuctionId = this.groupAuctions[0].id;
    }
  }

  private filterAuctionsByGroup(): void {
    if (!this.selectedGroupId) {
      this.groupAuctions = [];
      return;
    }

    this.groupAuctions = this.allAuctions.filter((item) => item.chitGroupId === this.selectedGroupId);
  }

  private deriveGroupsFromAuctions(items: AuctionSummary[]): ChitGroupDto[] {
    const grouped = new Map<number, ChitGroupDto>();

    for (const item of items) {
      if (!grouped.has(item.chitGroupId)) {
        grouped.set(item.chitGroupId, {
          id: item.chitGroupId,
          groupName: item.groupName || `Group #${item.chitGroupId}`,
          chitAmount: item.chitAmount || 0,
        });
      }
    }

    return [...grouped.values()];
  }

  private loadAuctionDetail(auctionId: number): void {
    this.errorMessage = '';
    this.isLoading = false;

    const selectedFromList = this.allAuctions.find((item) => item.id === auctionId) ?? null;
    this.selected = selectedFromList ? { ...selectedFromList } : { ...this.MOCK_AUCTION, id: auctionId };

    const selectedGroupId = this.selected?.chitGroupId ?? 0;
    const totalAuctions = this.selected
      ? this.allAuctions.filter((item) => item.chitGroupId === selectedGroupId).length || 24
      : 24;

    this.setHeader(this.selected, totalAuctions);
    this.setCalcBase(this.selected);
    this.bids = [...this.MOCK_BIDS];
    this.header.totalMembers = this.bids.length;

    this.session = {
      id: 999,
      auctionId: auctionId,
      sessionStatus: this.isLiveAuctionStatus(this.selected?.status) ? 'LIVE' : 'COMPLETED',
      startedAt: '2024-10-10T10:00:00Z',
      endedAt: '2024-10-10T10:30:00Z',
      durationSeconds: 1800,
      remainingSeconds: 0
    };
  }

  private isLiveAuctionStatus(status?: string | null): boolean {
    const normalized = (status ?? '').trim().toLowerCase();
    return normalized === 'live' || normalized === 'active' || normalized === 'running';
  }

  private resetTimer(): void {
    this.stopLocalTimer();
    this.timerValue = this.AUCTION_TIMER_SECONDS;
    this.isTimerRunning = false;
  }

  private startLocalTimer(): void {
    this.stopLocalTimer();
    this.isTimerRunning = true;
    this.timerInterval = setInterval(() => {
      if (this.timerValue > 0) {
        this.timerValue--;
      } else {
        this.stopLocalTimer();
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private stopLocalTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
  }

  private loadSupplementaryData(auction: AuctionSummary): void {
    // No-op - mock data already populated in loadAuctionDetail
  }

  get highestBid(): BidRow | undefined {
    return this.bids.find((bid) => bid.isWinning);
  }

  get quickStats(): DetailField[] {
    if (!this.selected) {
      return [];
    }

    return [
      {
        label: 'Current Highest Bid',
        value: this.formatCurrency(this.highestBid?.bidAmount ?? this.calc.winningBid),
        tone: 'primary',
      },
      {
        label: 'Highest Bidder',
        value: this.highestBid?.subscriber || (this.selected.winnerEnrollmentId ? `Enrollment #${this.selected.winnerEnrollmentId}` : '-'),
        tone: 'success',
      },
      {
        label: 'Net Payable',
        value: this.formatCurrency(this.calc.netPayable),
        tone: 'warning',
      },
      {
        label: 'Session Status',
        value: this.session?.sessionStatus || 'Not loaded',
        tone: 'muted',
      },
    ];
  }

  get overviewFields(): DetailField[] {
    const auction = this.selected;
    if (!auction) {
      return [];
    }

    return [
      { label: 'Auction ID', value: `#${auction.id}` },
      { label: 'Chit Group ID', value: `#${auction.chitGroupId}` },
      { label: 'Group Name', value: auction.groupName || '-' },
      { label: 'Auction Number', value: `${this.header.currentAuction} of ${this.header.totalAuctions}` },
      { label: 'Auction Date', value: this.header.auctionDate || '-' },
      { label: 'Status', value: auction.status || '-' },
      { label: 'Chit Amount', value: this.formatCurrency(auction.chitAmount) },
      { label: 'Max Members', value: auction.maxMembers ? String(auction.maxMembers) : '-' },
      { label: 'Commission %', value: `${auction.commissionPct}%` },
      { label: 'Total Members', value: this.header.totalMembers ? String(this.header.totalMembers) : '-' },
    ];
  }

  get settlementFields(): DetailField[] {
    const auction = this.selected;
    if (!auction) {
      return [];
    }

    return [
      { label: 'Winner Enrollment ID', value: auction.winnerEnrollmentId ? `#${auction.winnerEnrollmentId}` : '-' },
      { label: 'Winner Subscriber ID', value: auction.winnerSubscriberId ? `#${auction.winnerSubscriberId}` : '-' },
      { label: 'Bidder Type', value: auction.bidderType || '-' },
      { label: 'Winning Bid ID', value: auction.winningBidId ? `#${auction.winningBidId}` : '-' },
      { label: 'Winning Bid Amount', value: this.formatCurrency(auction.winningBidAmount ?? this.calc.winningBid) },
      { label: 'Bid Loss Amount', value: this.formatCurrency(auction.bidLossAmount ?? this.calc.bidLoss) },
      { label: 'Dividend Snapshot', value: this.formatCurrency(auction.dividendSnapshot ?? 0) },
      { label: 'Dividend Per Member', value: this.formatCurrency(auction.dividendPerMember ?? this.calc.dividendPerMember) },
      { label: 'Installment Due Date', value: this.fmtDate(auction.installmentDueDate) },
      { label: 'Installment No.', value: auction.installmentNo ? String(auction.installmentNo) : '-' },
      { label: 'Net Payable', value: this.formatCurrency(auction.netPayable ?? this.calc.netPayable) },
    ];
  }

  get sessionFields(): DetailField[] {
    if (!this.session) {
      return [
        { label: 'Session ID', value: '-' },
        { label: 'Session Status', value: 'Not loaded' },
        { label: 'Started At', value: '-' },
        { label: 'Ended At', value: '-' },
        { label: 'Duration', value: '-' },
        { label: 'Remaining', value: '-' },
      ];
    }

    return [
      { label: 'Session ID', value: `#${this.session.id}` },
      { label: 'Session Status', value: this.session.sessionStatus || '-' },
      { label: 'Started At', value: this.fmtDateTime(this.session.startedAt) },
      { label: 'Ended At', value: this.fmtDateTime(this.session.endedAt) },
      { label: 'Duration', value: this.formatDuration(this.session.durationSeconds) },
      { label: 'Remaining', value: this.formatDuration(this.session.remainingSeconds) },
    ];
  }

  get auditFields(): DetailField[] {
    const auction = this.selected;
    if (!auction) {
      return [];
    }

    return [
      { label: 'Created At', value: this.fmtDateTime(auction.createdAt) },
      { label: 'Updated At', value: this.fmtDateTime(auction.updatedAt) },
    ];
  }

  goBack(): void {
    this.router.navigate(['/admin/auctions']);
  }

  formatCurrency(value: number | null | undefined): string {
    return `Rs. ${(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  formatDuration(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined) {
      return '-';
    }

    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const remainingSeconds = total % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  fmtDate(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    try {
      return new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return value;
    }
  }

  fmtDateTime(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    try {
      return new Date(value).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return value;
    }
  }

  private normalizeAuctionList(items: AuctionResponse[] | null | undefined): AuctionSummary[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((auction): AuctionSummary => ({
      id: auction.id,
      chitGroupId: auction.chitGroupId,
      groupName: auction.groupName || `Group #${auction.chitGroupId}`,
      auctionNumber: auction.auctionNumber,
      auctionDate: auction.auctionDate,
      chitAmount: auction.chitAmount ?? 0,
      maxMembers: auction.maxMembers ?? 0,
      commissionPct: auction.companyCommissionPct ?? 5,
      winningBidId: auction.winningBidId,
      winningBidAmount: auction.winningBidAmount,
      bidLossAmount: auction.bidLossAmount,
      dividendSnapshot: auction.dividendSnapshot,
      dividendPerMember: auction.dividendPerMember,
      installmentDueDate: auction.installmentDueDate,
      installmentNo: auction.installmentNo,
      winnerEnrollmentId: auction.winnerEnrollmentId,
      winnerSubscriberId: auction.winnerSubscriberId,
      bidderType: auction.bidderType,
      netPayable: auction.netPayable,
      status: auction.status || 'Unknown',
      createdAt: auction.createdAt || '',
      updatedAt: auction.updatedAt || '',
    }));
  }

  private extractData<T>(response: unknown): T | null {
    if (response && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
      return ((response as { data?: T | null }).data ?? null) as T | null;
    }

    return (response ?? null) as T | null;
  }

  private mergeAuction(base: AuctionSummary | null, detail: Partial<AuctionResponse> | null): AuctionSummary | null {
    if (!base && !detail) {
      return null;
    }

    const chitGroupId = detail?.chitGroupId ?? base?.chitGroupId ?? 0;

    return {
      id: detail?.id ?? base?.id ?? 0,
      chitGroupId,
      groupName: detail?.groupName ?? base?.groupName ?? (chitGroupId ? `Group #${chitGroupId}` : 'Unknown Group'),
      auctionNumber: detail?.auctionNumber ?? base?.auctionNumber ?? 0,
      auctionDate: detail?.auctionDate ?? base?.auctionDate ?? '',
      chitAmount: detail?.chitAmount ?? base?.chitAmount ?? 0,
      maxMembers: detail?.maxMembers ?? base?.maxMembers ?? 0,
      commissionPct: detail?.companyCommissionPct ?? base?.commissionPct ?? 5,
      winningBidId: detail?.winningBidId ?? base?.winningBidId,
      winningBidAmount: detail?.winningBidAmount ?? base?.winningBidAmount,
      bidLossAmount: detail?.bidLossAmount ?? base?.bidLossAmount,
      dividendSnapshot: detail?.dividendSnapshot ?? base?.dividendSnapshot,
      dividendPerMember: detail?.dividendPerMember ?? base?.dividendPerMember,
      installmentDueDate: detail?.installmentDueDate ?? base?.installmentDueDate,
      installmentNo: detail?.installmentNo ?? base?.installmentNo,
      winnerEnrollmentId: detail?.winnerEnrollmentId ?? base?.winnerEnrollmentId,
      winnerSubscriberId: detail?.winnerSubscriberId ?? base?.winnerSubscriberId,
      bidderType: detail?.bidderType ?? base?.bidderType,
      netPayable: detail?.netPayable ?? base?.netPayable,
      status: detail?.status ?? base?.status ?? 'Unknown',
      createdAt: detail?.createdAt ?? base?.createdAt ?? '',
      updatedAt: detail?.updatedAt ?? base?.updatedAt ?? '',
    };
  }

  private setHeader(item: AuctionSummary, totalAuctions: number): void {
    this.header = {
      auctionNumber: item.auctionNumber,
      groupName: item.groupName,
      currentAuction: item.auctionNumber,
      totalAuctions,
      auctionDate: this.fmtDate(item.auctionDate),
      totalMembers: 0,
      maxMembers: item.maxMembers,
    };
  }

  private setCalcBase(item: AuctionSummary): void {
    this.calc = {
      chitAmount: item.chitAmount,
      winningBid: item.winningBidAmount ?? 0,
      bidLoss: item.bidLossAmount ?? 0,
      commissionPct: item.commissionPct,
      commissionAmount: (item.chitAmount * item.commissionPct) / 100,
      dividendPerMember: item.dividendPerMember ?? 0,
      netPayable: item.netPayable ?? 0,
    };
  }

  private buildRows(enrollments: EnrollmentResponse[], existingBids: AuctionBidResponse[]): BidRow[] {
    const highest = existingBids.length ? Math.max(...existingBids.map((bid) => bid.bidAmount)) : 0;

    if (enrollments.length > 0) {
      const rows = enrollments.map((enrollment): BidRow => {
        const bid = existingBids.find((entry) => entry.enrollmentId === enrollment.id);
        const bidAmount = bid?.bidAmount ?? 0;

        return {
          ticketNumber: `T${String(enrollment.ticketNo).padStart(3, '0')}`,
          enrollmentId: enrollment.id,
          subscriber: enrollment.subscriberName || `Member #${enrollment.id}`,
          subscriberId: enrollment.subscriberId,
          memberStatus: enrollment.status || '-',
          bidAmount,
          bidId: bid?.id ?? null,
          bidTime: bid?.bidTime ?? '',
          createdAt: bid?.createdAt ?? '',
          channel: bid?.channel ?? 'offline',
          status: bid ? (bidAmount === highest ? 'Highest Bid' : 'Bid Paid') : 'No Bid',
          isWinning: !!bid && bidAmount === highest,
        };
      });

      return [...rows].sort((a, b) => b.bidAmount - a.bidAmount);
    }

    return [...existingBids].sort((a, b) => b.bidAmount - a.bidAmount).map((bid, index): BidRow => ({
      ticketNumber: `T${String(index + 1).padStart(3, '0')}`,
      enrollmentId: bid.enrollmentId,
      subscriber: `Member #${bid.enrollmentId}`,
      subscriberId: bid.enrollmentId,
      memberStatus: '-',
      bidAmount: bid.bidAmount,
      bidId: bid.id,
      bidTime: bid.bidTime ?? '',
      createdAt: bid.createdAt ?? '',
      channel: bid.channel,
      status: bid.bidAmount === highest ? 'Highest Bid' : 'Bid Paid',
      isWinning: bid.bidAmount === highest,
    }));
  }

  private recalculate(): void {
    const placed = this.bids.filter((bid) => bid.bidAmount > 0);
    if (!placed.length) {
      return;
    }

    const highest = Math.max(...placed.map((bid) => bid.bidAmount));
    this.bids = [...this.bids]
      .map((bid): BidRow => {
        const status: BidRow['status'] = bid.bidAmount > 0
          ? (bid.bidAmount === highest ? 'Highest Bid' : 'Bid Paid')
          : 'No Bid';

        return {
          ...bid,
          isWinning: bid.bidAmount > 0 && bid.bidAmount === highest,
          status,
        };
      })
      .sort((a, b) => b.bidAmount - a.bidAmount);

    const chitAmount = this.calc.chitAmount;
    const commissionPct = this.calc.commissionPct;
    const members = this.header.maxMembers || this.header.totalMembers || placed.length || 1;
    const bidLoss = chitAmount - highest;
    const commission = (chitAmount * commissionPct) / 100;
    const dividendPerMember = members > 0 ? (bidLoss - commission) / members : 0;

    this.calc = {
      ...this.calc,
      winningBid: highest,
      bidLoss,
      commissionAmount: commission,
      dividendPerMember,
      netPayable: highest - commission + dividendPerMember,
    };
  }
}
