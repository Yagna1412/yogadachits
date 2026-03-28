import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Bid {
  ticketNumber: string;
  subscriber: string;
  bidAmount: number;
  status: string;
}

interface AuctionHeader {
  auctionNumber: number;
  groupName: string;
  currentAuction: number;
  totalAuctions: number;
  auctionDate: string;
  totalMembers: number;
}

interface CalculationSummary {
  chitAmount: number;
  winningBid: number;
  bidLoss: number;
  commissionPercentage: number;
  commissionAmount: number;
  dividendPerMember: number;
  netPayable: number;
}

@Component({
  selector: 'app-auctions',
  imports: [CommonModule, FormsModule],
  templateUrl: './auctions.html',
  styleUrl: './auctions.scss',
})
export class AuctionsComponent {
  showConfirmModal = false;
  showSuccessModal = false;

  auctionHeader: AuctionHeader = {
    auctionNumber: 8,
    groupName: 'Golden Circle 2024',
    currentAuction: 8,
    totalAuctions: 20,
    auctionDate: '5 Aug 2024',
    totalMembers: 8,
  };

  calculationSummary: CalculationSummary = {
    chitAmount: 500000,
    winningBid: 45000,
    bidLoss: 45000,
    commissionPercentage: 5,
    commissionAmount: 25000,
    dividendPerMember: 1000,
    netPayable: 455000,
  };

  winnerName = 'Suresh Babu';
  winningBid = '₹ 45,000';
  netPayable = '₹4,55,000';

  bids: Bid[] = [
    { ticketNumber: 'T001', subscriber: 'Rajesh Kumar', bidAmount: 0, status: 'No Bid' },
    { ticketNumber: 'T002', subscriber: 'Priya Sharma', bidAmount: 0, status: 'No Bid' },
    { ticketNumber: 'T003', subscriber: 'Amit Patel', bidAmount: 100000, status: 'Bid Paid' },
    { ticketNumber: 'T004', subscriber: 'Sunita Devi', bidAmount: 23000, status: 'Bid Paid' },
    { ticketNumber: 'T005', subscriber: 'Vijay Reddy', bidAmount: 34000, status: 'Bid Paid' },
    { ticketNumber: 'T006', subscriber: 'Kavitha Nair', bidAmount: 35000, status: 'Bid Paid' },
    { ticketNumber: 'T007', subscriber: 'Suresh Babu', bidAmount: 45000, status: 'Highest Bid' },
    { ticketNumber: 'T008', subscriber: 'Lakshmi Iyer', bidAmount: 35000, status: 'Bid Paid' },
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

  openConfirmModal(): void {
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
  }

  confirmWinner(): void {
    this.showConfirmModal = false;
    this.showSuccessModal = true;
    // Auto-close success modal after 3 seconds
    setTimeout(() => {
      this.showSuccessModal = false;
    }, 3000);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }
}
