import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AuctionDetails {
  id: string;
  chitName: string;
  groupCode: string;
  chitValue: number;
  monthlyAmount: number;
  maxBidLimit: number;
  minBidLimit: number;
  currentHighBid: number;
}

@Component({
  selector: 'app-user-online-bids',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-online-bids.html',
  styleUrl: './user-online-bids.scss'
})
export class UserOnlineBidsComponent implements OnInit, OnDestroy {
  activeAuction: AuctionDetails = {
    id: 'AUC-1020',
    chitName: 'Diamond Chit 1Cr',
    groupCode: '#GRP-2025-022',
    chitValue: 10000000, // 1 Crore
    monthlyAmount: 250000,
    maxBidLimit: 4000000, // 40 Lakh max max bid
    minBidLimit: 500000,
    currentHighBid: 1200000
  };

  bidAmount: number | null = null;
  bidSubmitted = false;
  submissionError = '';
  
  // Timer State
  timerMinutes = 14;
  timerSeconds = 59;
  timerInterval: any;

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
      } else {
        if (this.timerMinutes > 0) {
          this.timerMinutes--;
          this.timerSeconds = 59;
        } else {
          clearInterval(this.timerInterval);
        }
      }
    }, 1000);
  }

  formatTime(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  submitBid() {
    this.submissionError = '';

    if (!this.bidAmount) {
      this.submissionError = 'Please enter a bid amount.';
      return;
    }

    if (this.bidAmount <= this.activeAuction.currentHighBid) {
      this.submissionError = `Bid must be higher than the current high bid of ₹${this.activeAuction.currentHighBid.toLocaleString()}.`;
      return;
    }

    if (this.bidAmount > this.activeAuction.maxBidLimit) {
      this.submissionError = `Bid exceeds the maximum allowed limit of ₹${this.activeAuction.maxBidLimit.toLocaleString()}.`;
      return;
    }

    // Success
    this.bidSubmitted = true;
    this.activeAuction.currentHighBid = this.bidAmount; // Optimistically update
  }
}
