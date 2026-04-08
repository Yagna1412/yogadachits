import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  AuctionBidResponse,
  AuctionResponse,
  AuctionSessionResponse,
  AuctionsService,
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
  imports: [CommonModule, RouterModule],
  templateUrl: './auction-detail.html',
  styleUrl: './auction-detail.scss',
})
export class AuctionDetailComponent implements OnInit, OnDestroy {
  isLoading = false;
  errorMessage = '';
  auctionId: number | null = null;

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
    private svc: AuctionsService
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('auctionId');
    const auctionId = rawId ? Number(rawId) : NaN;

    if (!rawId || Number.isNaN(auctionId)) {
      this.errorMessage = 'Invalid auction id.';
      return;
    }

    this.auctionId = auctionId;
    this.loadAuctionDetail(auctionId);
  }

  ngOnDestroy(): void {
    this.svc.disconnectFromAuction();
  }

  reload(): void {
    if (this.auctionId === null) {
      return;
    }
    this.loadAuctionDetail(this.auctionId);
  }

  private loadAuctionDetail(auctionId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.selected = null;
    this.session = null;
    this.bids = [];
    this.svc.disconnectFromAuction();

    forkJoin({
      auctions: this.svc.listAuctions(),
      detail: this.svc.getAuctionById(auctionId),
    }).subscribe({
      next: ({ auctions, detail }) => {
        const allAuctions = this.normalizeAuctionList(this.extractData<AuctionResponse[]>(auctions));
        const base = allAuctions.find((item) => item.id === auctionId) ?? null;
        const merged = this.mergeAuction(base, this.extractData<Partial<AuctionResponse>>(detail));

        if (!merged) {
          this.errorMessage = 'Auction details are not available for the selected auction.';
          this.isLoading = false;
          return;
        }

        this.selected = merged;
        this.setHeader(merged, allAuctions.filter((item) => item.chitGroupId === merged.chitGroupId).length || 1);
        this.setCalcBase(merged);

        this.loadSupplementaryData(merged);
      },
      error: () => {
        this.errorMessage = 'Failed to load auction details.';
        this.isLoading = false;
      },
    });
  }

  private loadSupplementaryData(auction: AuctionSummary): void {
    forkJoin({
      bids: this.svc.listBids(auction.id),
      enrollments: this.svc.getEnrollments(auction.chitGroupId),
      session: this.svc.getAuctionSession(auction.id),
    }).subscribe({
      next: ({ bids, enrollments, session }) => {
        const bidData = this.extractData<AuctionBidResponse[]>(bids) ?? [];
        const enrollmentData = this.extractData<EnrollmentResponse[]>(enrollments) ?? [];

        this.bids = this.buildRows(enrollmentData, bidData);
        this.header.totalMembers = this.bids.length;

        if (bidData.length > 0) {
          this.recalculate();
        }

        this.session = this.extractData<AuctionSessionResponse>(session);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Auction snapshot loaded, but bids or session data could not be fetched.';
        this.isLoading = false;
      },
    });
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
