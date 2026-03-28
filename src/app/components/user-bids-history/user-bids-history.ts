import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BidHistory {
  id: string;
  auctionMonth: string;
  chitGroup: string;
  groupCode: string;
  bidAmount: string;
  discount: string;
  dividendPerMember: string;
  netPayable: string;
  bidDate: string;
  bidStatus: 'Won' | 'Lost' | 'Pending';
  winnerName: string;
  winningBid: string;
}

@Component({
  selector: 'app-user-bids-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-bids-history.html',
  styleUrl: './user-bids-history.scss'
})
export class UserBidsHistoryComponent {
  selectedBid: BidHistory | null = null;
  
  bidHistoryRecords: BidHistory[] = [
    {
      id: 'BID-1001',
      auctionMonth: 'March 2026',
      chitGroup: 'Gold Chit 50L',
      groupCode: '#GRP-2024-001',
      bidAmount: '₹2,10,000',
      discount: '42%',
      dividendPerMember: '₹4,200',
      netPayable: '₹5,800',
      bidDate: '05 Mar 2026, 10:30 AM',
      bidStatus: 'Lost',
      winnerName: 'Member #YCF-038',
      winningBid: '₹2,50,000'
    },
    {
      id: 'BID-1002',
      auctionMonth: 'February 2026',
      chitGroup: 'Silver Chit 10L',
      groupCode: '#GRP-2025-014',
      bidAmount: '₹85,000',
      discount: '34%',
      dividendPerMember: '₹4,250',
      netPayable: '₹750',
      bidDate: '10 Feb 2026, 11:15 AM',
      bidStatus: 'Won',
      winnerName: 'You',
      winningBid: '₹85,000'
    },
    {
      id: 'BID-1003',
      auctionMonth: 'January 2026',
      chitGroup: 'Diamond Chit 1Cr',
      groupCode: '#GRP-2025-022',
      bidAmount: '₹6,00,000',
      discount: '30%',
      dividendPerMember: '₹15,000',
      netPayable: '₹10,000',
      bidDate: '15 Jan 2026, 02:45 PM',
      bidStatus: 'Lost',
      winnerName: 'Member #YCF-012',
      winningBid: '₹6,64,000'
    },
    {
      id: 'BID-1004',
      auctionMonth: 'December 2025',
      chitGroup: 'Gold Chit 50L',
      groupCode: '#GRP-2024-001',
      bidAmount: '₹1,50,000',
      discount: '30%',
      dividendPerMember: '₹3,000',
      netPayable: '₹7,000',
      bidDate: '05 Dec 2025, 10:00 AM',
      bidStatus: 'Lost',
      winnerName: 'Member #YCF-102',
      winningBid: '₹1,95,000'
    }
  ];

  openBidDetails(bid: BidHistory) {
    this.selectedBid = bid;
  }

  goBack() {
    this.selectedBid = null;
  }
}
