import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeEnrollmentItem, MeService } from '../../service/me.service';

@Component({
  selector: 'app-user-chits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-chits.html',
  styleUrl: './user-chits.scss'
})
export class UserChitsComponent implements OnInit {
  selectedChit: MeEnrollmentItem | null = null;
  chitGroups: MeEnrollmentItem[] = [];
  isLoading = true;
  loadError: string | null = null;

  constructor(private meService: MeService) {}

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    this.isLoading = true;
    this.loadError = null;
    this.selectedChit = null;

    this.meService.getEnrollments().subscribe({
      next: (items) => {
        this.chitGroups = items || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.chitGroups = [];
        this.loadError = err?.error?.message || 'Unable to load your chit groups. Please try again.';
        this.isLoading = false;
      }
    });
  }

  selectChit(chit: MeEnrollmentItem): void {
    this.selectedChit = chit;
  }

  getProgressPercent(chit: MeEnrollmentItem): number {
    if (chit.progressPercent != null) {
      return chit.progressPercent;
    }
    if (!chit.totalInstallments) {
      return 0;
    }
    return Math.round((chit.installmentsPaid / chit.totalInstallments) * 100);
  }

  goBack(): void {
    this.selectedChit = null;
  }

  formatCurrency(value: number | null | undefined): string {
    const amount = Number(value ?? 0);
    return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatAuctionSchedule(chit: MeEnrollmentItem): string {
    if (chit.auctionDay != null && chit.auctionDay > 0) {
      return `${this.toOrdinal(chit.auctionDay)} of every month`;
    }
    if (chit.auctionDate) {
      return this.formatDate(chit.auctionDate);
    }
    return '—';
  }

  formatStatus(status: string | null | undefined): string {
    if (!status) {
      return 'Unknown';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  statusClass(status: string | null | undefined): string {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'active') {
      return 'shipped';
    }
    if (normalized === 'completed' || normalized === 'closed') {
      return 'delivered';
    }
    return 'pending';
  }

  private toOrdinal(day: number): string {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) {
      return `${day}st`;
    }
    if (j === 2 && k !== 12) {
      return `${day}nd`;
    }
    if (j === 3 && k !== 13) {
      return `${day}rd`;
    }
    return `${day}th`;
  }
}
