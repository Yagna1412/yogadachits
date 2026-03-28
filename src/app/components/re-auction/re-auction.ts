import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PastAuction {
  auctionNumber: number;
  winner: string;
  amount: number;
  date: string;
}

interface PreviousWinnerInfo {
  ticket: string;
  name: string;
  bidAmount: number;
  auctionDate: string;
  netPayable: number;
}

@Component({
  selector: 'app-re-auction',
  imports: [CommonModule, FormsModule],
  templateUrl: './re-auction.html',
  styleUrl: './re-auction.scss',
})
export class ReAuctionComponent {
  showConfirmModal = false;
  showSuccessModal = false;

  // dummy data similar to attachments
  previous: PreviousWinnerInfo = {
    ticket: 'T007',
    name: 'Vijay Reddy',
    bidAmount: 30000,
    auctionDate: 'Mar 19, 2025',
    netPayable: 500000,
  };

  members = [
    'Amit Babu',
    'Rajesh Kumar',
    'Priya Sharma',
    'Amit Patel',
    'Sunita Devi',
  ];

  newWinner = '';
  newBid = 0;

  pastAuctions: PastAuction[] = [
    { auctionNumber: 7, winner: 'Rajesh Kumar', amount: 25000, date: 'Mar 19,2023 9:00AM' },
    { auctionNumber: 8, winner: 'Priya Sharma', amount: 25000, date: 'Mar 19,2023 9:00AM' },
    { auctionNumber: 6, winner: 'Amit Patel', amount: 25000, date: 'Mar 19,2023 9:00AM' },
    { auctionNumber: 5, winner: 'Sunita Devi', amount: 25000, date: 'Mar 19,2023 9:00AM' },
  ];

  formatCurrency(amount: number): string {
    return (
      '₹' +
      amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  }

  get computedNetPayable(): number {
    // simple formula: previous.netPayable - (this.newBid - this.previous.bidAmount)
    return this.previous.netPayable - (this.newBid - this.previous.bidAmount);
  }

  get bidDifference(): number {
    return this.newBid - this.previous.bidAmount;
  }

  get payableDifference(): number {
    return this.computedNetPayable - this.previous.netPayable;
  }

  openConfirmModal(): void {
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
  }

  confirmReAuction(): void {
    this.showConfirmModal = false;
    this.showSuccessModal = true;
    setTimeout(() => {
      this.showSuccessModal = false;
    }, 3000);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }
}
