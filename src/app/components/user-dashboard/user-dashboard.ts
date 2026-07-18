import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  MeDashboard,
  MeDueItem,
  MeEnrollmentItem,
  MeNotificationItem,
  MeProfile,
  MeReceiptItem,
  MeService
} from '../../service/me.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss'
})
export class UserDashboardComponent implements OnInit {
  profile: MeProfile | null = null;
  dashboard: MeDashboard | null = null;
  enrollments: MeEnrollmentItem[] = [];
  receipts: MeReceiptItem[] = [];
  notifications: MeNotificationItem[] = [];
  pendingDues: MeDueItem[] = [];
  isLoading = true;
  loadError = '';
  downloadingReceiptId: number | null = null;
  showPayModal = false;
  selectedDue: MeDueItem | null = null;
  payMessage = '';

  constructor(
    private router: Router,
    private meService: MeService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      profile: this.meService.getProfile(),
      dashboard: this.meService.getDashboard(),
      enrollments: this.meService.getEnrollments(),
      receipts: this.meService.getRecentReceipts(10),
      notifications: this.meService.getNotifications(15),
      dues: this.meService.getPendingDues()
    }).subscribe({
      next: ({ profile, dashboard, enrollments, receipts, notifications, dues }) => {
        this.profile = profile;
        this.dashboard = dashboard;
        this.enrollments = enrollments || [];
        this.receipts = receipts || [];
        this.notifications = notifications || [];
        this.pendingDues = dues || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load user dashboard', err);
        this.loadError = err?.error?.message || 'Failed to load dashboard data.';
        this.isLoading = false;
      }
    });
  }

  get displayName(): string {
    return this.profile?.fullName || 'Member';
  }

  get memberDisplayId(): string {
    return this.profile?.memberDisplayId || '—';
  }

  get avatarInitials(): string {
    const name = this.displayName.trim();
    if (!name) {
      return 'M';
    }
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  get unreadNotificationCount(): number {
    return this.notifications.filter(n => n.unread).length;
  }

  get installmentProgressLabel(): string {
    if (!this.dashboard || this.dashboard.totalInstallments <= 0) {
      return '0% Complete';
    }
    const pct = (this.dashboard.installmentsPaid / this.dashboard.totalInstallments) * 100;
    return `${pct.toFixed(1)}% Complete`;
  }

  get enrolledGroupsTrend(): string {
    if (!this.dashboard) {
      return '—';
    }
    if (this.dashboard.enrolledChitGroups === 0) {
      return 'No enrollments yet';
    }
    if (this.dashboard.activeChitGroups === this.dashboard.enrolledChitGroups) {
      return 'All Active';
    }
    return `${this.dashboard.activeChitGroups} Active`;
  }

  get totalPaidTrend(): string {
    if (!this.dashboard || this.dashboard.totalPaidAmount <= 0) {
      return 'No payments yet';
    }
    return 'On Track';
  }

  get bidsWonTrend(): string {
    if (!this.dashboard || this.dashboard.bidsWon <= 0) {
      return 'No bids won yet';
    }
    return `Prize: ₹${this.formatCurrency(this.dashboard.totalPrizeAmount)}`;
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

  formatRelativeTime(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    const then = new Date(value).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - then);
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) {
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    }
    return this.formatDate(value);
  }

  formatStatus(status: string | null | undefined): string {
    if (!status) {
      return 'Unknown';
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  statusClass(status: string | null | undefined): string {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'active' || normalized === 'paid') {
      return 'shipped';
    }
    if (normalized === 'pending' || normalized === 'due') {
      return 'pending';
    }
    return 'shipped';
  }

  groupInitial(name: string | null | undefined): string {
    return (name || 'G').trim().charAt(0).toUpperCase();
  }

  notificationIconClass(type: string | null | undefined): string {
    const normalized = (type || '').toLowerCase();
    if (normalized === 'payment') {
      return 'payment';
    }
    if (normalized === 'bid') {
      return 'bid';
    }
    return 'alert';
  }

  viewAllChits(): void {
    this.router.navigate(['/user/chits']);
  }

  onSearchIconClick() {
    const searchInput = document.querySelector('.user-layout .search-box input') as HTMLElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  onNotificationClick() {
    const section = document.querySelector('.notifications-section');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  markAllNotificationsRead(): void {
    this.meService.markAllNotificationsRead(this.notifications.map(n => n.id));
    this.notifications = this.notifications.map(n => ({ ...n, unread: false }));
  }

  markNotificationRead(notification: MeNotificationItem): void {
    if (!notification.unread) {
      return;
    }
    this.meService.markNotificationRead(notification.id);
    notification.unread = false;
  }

  onSettingsClick() {
    this.router.navigate(['/user/preferences']);
  }

  onAvatarClick() {
    this.router.navigate(['/user/profile']);
  }

  downloadReceipt(receipt: MeReceiptItem) {
    this.downloadingReceiptId = receipt.id;
    this.meService.downloadReceiptPdf(receipt.id).subscribe({
      next: (blob) => {
        const fileName = `Yogada_Receipt_${(receipt.receiptNo || String(receipt.id)).replace('#', '')}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloadingReceiptId = null;
      },
      error: (err) => {
        console.error('Failed to download receipt PDF', err);
        this.downloadingReceiptId = null;
        alert(err?.error?.message || 'Failed to download receipt PDF.');
      }
    });
  }

  openPayModal(due?: MeDueItem | null): void {
    this.payMessage = '';
    if (due) {
      this.selectedDue = due;
      this.showPayModal = true;
      return;
    }

    if (this.pendingDues.length > 0) {
      this.selectedDue = this.pendingDues[0];
      this.showPayModal = true;
      return;
    }

    if (this.dashboard?.upcomingPayment) {
      const upcoming = this.dashboard.upcomingPayment;
      this.selectedDue = {
        installmentId: 0,
        enrollmentId: upcoming.enrollmentId,
        groupName: upcoming.groupName,
        groupCode: upcoming.groupCode,
        amount: upcoming.amount,
        dueDate: upcoming.dueDate,
        status: 'due'
      };
      this.showPayModal = true;
      return;
    }

    alert('No pending dues found for payment.');
  }

  closePayModal(): void {
    this.showPayModal = false;
    this.selectedDue = null;
    this.payMessage = '';
  }

  confirmPayNow(): void {
    if (!this.selectedDue) {
      return;
    }
    // Payment gateway integration point — show clear next-step message for now.
    this.payMessage =
      `Payment request prepared for ${this.selectedDue.groupName} ` +
      `(₹${this.formatCurrency(this.selectedDue.amount)}). ` +
      'Online payment gateway will be connected in the next release. Please pay at the branch or contact your collection agent.';
  }
}
