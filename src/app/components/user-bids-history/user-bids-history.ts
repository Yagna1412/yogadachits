import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeBidItem, MeService } from '../../service/me.service';

@Component({
  selector: 'app-user-bids-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-bids-history.html',
  styleUrl: './user-bids-history.scss'
})
export class UserBidsHistoryComponent implements OnInit {
  selectedBid: MeBidItem | null = null;
  bidHistoryRecords: MeBidItem[] = [];
  isLoading = true;
  loadError: string | null = null;

  constructor(private meService: MeService) {}

  ngOnInit(): void {
    this.loadBids();
  }

  loadBids(): void {
    this.isLoading = true;
    this.loadError = null;
    this.selectedBid = null;

    this.meService.getBids().subscribe({
      next: (items) => {
        this.bidHistoryRecords = items || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.bidHistoryRecords = [];
        this.loadError = err?.error?.message || 'Unable to load your bid history. Please try again.';
        this.isLoading = false;
      }
    });
  }

  openBidDetails(bid: MeBidItem): void {
    this.selectedBid = bid;
  }

  goBack(): void {
    this.selectedBid = null;
  }

  formatCurrency(value: number | null | undefined): string {
    if (value == null) {
      return '—';
    }
    return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  formatPercent(value: number | null | undefined): string {
    if (value == null) {
      return '—';
    }
    const amount = Number(value);
    return `${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}%`;
  }

  formatDateTime(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  statusClass(status: string | null | undefined): string {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'won') {
      return 'shipped';
    }
    if (normalized === 'lost') {
      return 'cancelled';
    }
    return 'pending';
  }
}
