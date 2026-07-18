import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeLiveAuction, MeService } from '../../service/me.service';
import {
  AuctionBidResponse,
  AuctionsService,
  AuctionSessionResponse
} from '../../service/auction.service';

@Component({
  selector: 'app-user-online-bids',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-online-bids.html',
  styleUrl: './user-online-bids.scss'
})
export class UserOnlineBidsComponent implements OnInit, OnDestroy {
  liveAuctions: MeLiveAuction[] = [];
  activeAuction: MeLiveAuction | null = null;

  bidAmount: number | null = null;
  bidSubmitted = false;
  submittedAmount: number | null = null;
  submissionError = '';
  isLoading = true;
  isSubmitting = false;
  loadError: string | null = null;

  remainingSeconds = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private sessionPollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private meService: MeService,
    private auctionsService: AuctionsService
  ) {}

  ngOnInit(): void {
    this.loadLiveAuctions();
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.auctionsService.disconnectFromAuction();
  }

  get timerMinutes(): number {
    return Math.floor(Math.max(0, this.remainingSeconds) / 60);
  }

  get timerSeconds(): number {
    return Math.max(0, this.remainingSeconds) % 60;
  }

  get isLive(): boolean {
    return !!this.activeAuction
      && (this.activeAuction.sessionStatus || '').toLowerCase() === 'live'
      && this.remainingSeconds > 0;
  }

  get canSubmit(): boolean {
    return !!this.activeAuction
      && this.activeAuction.canBid
      && this.isLive
      && !this.bidSubmitted
      && !this.isSubmitting;
  }

  loadLiveAuctions(): void {
    this.isLoading = true;
    this.loadError = null;
    this.clearTimers();
    this.auctionsService.disconnectFromAuction();

    this.meService.getLiveAuctions().subscribe({
      next: (auctions) => {
        this.liveAuctions = auctions || [];
        this.isLoading = false;
        if (this.liveAuctions.length === 0) {
          this.activeAuction = null;
          return;
        }
        this.selectAuction(this.liveAuctions[0]);
      },
      error: (err) => {
        this.liveAuctions = [];
        this.activeAuction = null;
        this.loadError = err?.error?.message || 'Unable to load live auctions. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onAuctionChange(auctionId: string | number): void {
    const id = Number(auctionId);
    const selected = this.liveAuctions.find((item) => item.auctionId === id);
    if (selected) {
      this.selectAuction(selected);
    }
  }

  selectAuction(auction: MeLiveAuction): void {
    this.clearTimers();
    this.auctionsService.disconnectFromAuction();

    this.activeAuction = { ...auction };
    this.bidAmount = null;
    this.submissionError = '';
    this.bidSubmitted = !!auction.hasMyBid;
    this.submittedAmount = auction.myBidAmount ?? null;
    this.remainingSeconds = auction.remainingSeconds ?? 0;

    this.startLocalTimer();
    this.startSessionPolling();
    this.auctionsService.connectToAuction(
      auction.auctionId,
      (session) => this.onSessionUpdate(session),
      (bid) => this.onBidUpdate(bid)
    );
  }

  submitBid(): void {
    if (!this.activeAuction || !this.canSubmit) {
      return;
    }

    this.submissionError = '';
    const amount = Number(this.bidAmount);

    if (!this.bidAmount || Number.isNaN(amount) || amount <= 0) {
      this.submissionError = 'Please enter a bid amount.';
      return;
    }

    const currentHigh = Number(this.activeAuction.currentHighBid || 0);
    if (amount <= currentHigh) {
      this.submissionError =
        `Bid must be higher than the current high bid of ₹${currentHigh.toLocaleString('en-IN')}.`;
      return;
    }

    const maxBid = Number(this.activeAuction.maxBidLimit || 0);
    if (maxBid > 0 && amount > maxBid) {
      this.submissionError =
        `Bid exceeds the maximum allowed limit of ₹${maxBid.toLocaleString('en-IN')}.`;
      return;
    }

    this.isSubmitting = true;
    this.meService.placeBid(this.activeAuction.auctionId, { bidAmount: amount }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.bidSubmitted = true;
        this.submittedAmount = amount;
        this.activeAuction = {
          ...this.activeAuction!,
          currentHighBid: Math.max(currentHigh, amount),
          minBidLimit: Math.max(currentHigh, amount),
          hasMyBid: true,
          myBidAmount: amount,
          canBid: false
        };
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submissionError = err?.error?.message || 'Unable to submit bid. Please try again.';
      }
    });
  }

  formatTime(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private onSessionUpdate(session: AuctionSessionResponse): void {
    if (!this.activeAuction || session.auctionId !== this.activeAuction.auctionId) {
      return;
    }
    this.remainingSeconds = session.remainingSeconds ?? 0;
    const isLive = (session.sessionStatus || '').toLowerCase() === 'live' && this.remainingSeconds > 0;
    this.activeAuction = {
      ...this.activeAuction,
      sessionStatus: session.sessionStatus,
      remainingSeconds: this.remainingSeconds,
      durationSeconds: session.durationSeconds,
      canBid: isLive && !this.bidSubmitted && !this.activeAuction.hasMyBid
    };
  }

  private onBidUpdate(bid: AuctionBidResponse): void {
    if (!this.activeAuction || bid.auctionId !== this.activeAuction.auctionId) {
      return;
    }
    const amount = Number(bid.bidAmount || 0);
    const currentHigh = Number(this.activeAuction.currentHighBid || 0);
    if (amount > currentHigh) {
      this.activeAuction = {
        ...this.activeAuction,
        currentHighBid: amount,
        minBidLimit: amount
      };
    }
  }

  private startLocalTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds -= 1;
        if (this.activeAuction) {
          const isLive = (this.activeAuction.sessionStatus || '').toLowerCase() === 'live'
            && this.remainingSeconds > 0;
          this.activeAuction = {
            ...this.activeAuction,
            remainingSeconds: this.remainingSeconds,
            canBid: isLive && !this.bidSubmitted && !this.activeAuction.hasMyBid
          };
        }
      }
    }, 1000);
  }

  private startSessionPolling(): void {
    if (!this.activeAuction) {
      return;
    }
    this.sessionPollInterval = setInterval(() => {
      if (!this.activeAuction) {
        return;
      }
      this.auctionsService.getAuctionSession(this.activeAuction.auctionId).subscribe({
        next: (res) => {
          if (res?.success && res.data) {
            this.onSessionUpdate(res.data);
          }
        }
      });
    }, 15000);
  }

  private clearTimers(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.sessionPollInterval) {
      clearInterval(this.sessionPollInterval);
      this.sessionPollInterval = null;
    }
  }
}
