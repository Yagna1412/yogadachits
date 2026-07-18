import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  KpiCard,
  MemberKpiSummary,
  MemberResponse,
  MemberService
} from '../../service/member.service';
import { MemberReceiptService } from '../../service/member-receipt.service';
import { ApiResponse, AuctionsService, AuctionKpiSummary } from '../../service/auction.service';

interface DashboardStatCard {
  label: string;
  value: string;
  trendPercent?: number | null;
  trend?: string | null;
  trendLabel?: string | null;
  iconClass: 'purple' | 'orange' | 'green' | 'blue';
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  loadError: string | null = null;

  adminName = 'Admin';
  memberKpi: MemberKpiSummary | null = null;
  todayCollection = 0;
  activeGroups = 0;
  pendingApprovals = 0;
  recentMembers: MemberResponse[] = [];

  stats: DashboardStatCard[] = [];

  constructor(
    private router: Router,
    private memberService: MemberService,
    private memberReceiptService: MemberReceiptService,
    private auctionsService: AuctionsService
  ) {}

  ngOnInit(): void {
    const storedName = localStorage.getItem('userFullName');
    if (storedName?.trim()) {
      this.adminName = storedName.trim();
    }
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.loadError = null;

    forkJoin({
      memberKpi: this.memberService.getKpiSummary().pipe(catchError(() => of(null))),
      todayKpi: this.memberReceiptService.getTodayKpi().pipe(catchError(() => of(null))),
      auctionKpi: this.auctionsService.getKpiSummary().pipe(
        catchError(() => of({
          success: false,
          message: '',
          data: null
        } as ApiResponse<AuctionKpiSummary>))
      ),
      recentMembers: this.memberService
        .getMembersPaged({ page: 0, size: 5, sortBy: 'id', sortDir: 'desc' })
        .pipe(catchError(() => of({ content: [], page: 0, size: 5, totalElements: 0, totalPages: 0 })))
    }).subscribe({
      next: ({ memberKpi, todayKpi, auctionKpi, recentMembers }) => {
        this.memberKpi = memberKpi;
        this.todayCollection = Number(todayKpi?.totalCollection ?? 0);
        const auctionData: AuctionKpiSummary | null = auctionKpi?.data ?? null;
        this.activeGroups = Number(auctionData?.distinctChitGroups ?? 0);
        const pendingMembers = Number(memberKpi?.pendingEnrollment?.count ?? 0);
        const pendingAuctions = Number(auctionData?.pendingWinnerConfirmation ?? 0);
        this.pendingApprovals = pendingMembers + pendingAuctions;
        this.recentMembers = recentMembers?.content || [];
        this.buildStats();
        this.isLoading = false;

        if (!memberKpi && !todayKpi && !auctionData) {
          this.loadError = 'Unable to load dashboard KPIs. Please try again.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Unable to load dashboard. Please try again.';
        this.buildStats();
      }
    });
  }

  private buildStats(): void {
    const total = this.memberKpi?.totalMembers;
    this.stats = [
      {
        label: 'Total Members',
        value: this.formatCount(total?.count ?? 0),
        trendPercent: total?.changePercent,
        trend: total?.trend,
        trendLabel: total?.trendLabel,
        iconClass: 'purple'
      },
      {
        label: "Today's Collection",
        value: this.formatCurrencyCompact(this.todayCollection),
        trendPercent: null,
        trend: 'NEUTRAL',
        trendLabel: 'Collected today',
        iconClass: 'orange'
      },
      {
        label: 'Active Groups',
        value: this.formatCount(this.activeGroups),
        trendPercent: null,
        trend: 'NEUTRAL',
        trendLabel: 'Chit groups with auctions',
        iconClass: 'green'
      },
      {
        label: 'Pending Approvals',
        value: this.formatCount(this.pendingApprovals),
        trendPercent: this.memberKpi?.pendingEnrollment?.changePercent,
        trend: this.memberKpi?.pendingEnrollment?.trend || 'NEUTRAL',
        trendLabel: this.memberKpi?.pendingEnrollment?.trendLabel || 'Members + auction winners',
        iconClass: 'blue'
      }
    ];
  }

  formatCount(value: number): string {
    return Number(value || 0).toLocaleString('en-IN');
  }

  formatCurrency(value: number | null | undefined): string {
    return `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  formatCurrencyCompact(value: number): string {
    const amount = Number(value || 0);
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return this.formatCurrency(amount);
  }

  isPositiveTrend(card: DashboardStatCard | KpiCard | null | undefined): boolean {
    const trend = (card as DashboardStatCard)?.trend || (card as KpiCard)?.trend;
    return (trend || '').toUpperCase() === 'UP';
  }

  isNegativeTrend(card: DashboardStatCard | KpiCard | null | undefined): boolean {
    const trend = (card as DashboardStatCard)?.trend || (card as KpiCard)?.trend;
    return (trend || '').toUpperCase() === 'DOWN';
  }

  trendText(card: DashboardStatCard): string {
    if (card.trendLabel) {
      return card.trendLabel;
    }
    if (card.trendPercent != null) {
      return `${Math.abs(Number(card.trendPercent)).toFixed(2)}%`;
    }
    return '—';
  }

  memberDisplayId(member: MemberResponse): string {
    return `#YCF-${member.id}`;
  }

  memberInitial(member: MemberResponse): string {
    return (member.name || '?').charAt(0).toUpperCase();
  }

  memberMeta(member: MemberResponse): string {
    const gender = member.gender ? member.gender.charAt(0).toUpperCase() : '—';
    const occupation = member.occupation || member.employeeType || 'Member';
    return `${gender} | ${occupation}`;
  }

  statusClass(status: string | null | undefined): string {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'active') {
      return 'shipped';
    }
    if (normalized === 'pending' || normalized === 'inactive') {
      return 'pending';
    }
    if (normalized === 'cancelled' || normalized === 'canceled' || normalized === 'closed') {
      return 'cancelled';
    }
    return 'pending';
  }

  formatStatus(status: string | null | undefined): string {
    if (!status) {
      return 'Unknown';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  editMember(member: MemberResponse): void {
    this.router.navigate(['/admin/members'], { queryParams: { edit: member.id } });
  }

  toggleSidebar() {
    // layout-owned; kept for compatibility
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
