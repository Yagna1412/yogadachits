import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChitGroup {
  id: string;
  name: string;
  code: string;
  chitValue: string;
  monthlyAmount: string;
  startDate: string;
  endDate: string;
  auctionDate: string;
  duration: number;
  totalMembers: number;
  installmentsPaid: number;
  totalInstallments: number;
  nextDueDate: string;
  status: string;
  foreman: string;
  dividendRate: string;
  lastAuctionWinner: string;
  lastAuctionBid: string;
}

@Component({
  selector: 'app-user-chits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-chits.html',
  styleUrl: './user-chits.scss'
})
export class UserChitsComponent {
  selectedChit: ChitGroup | null = null;

  chitGroups: ChitGroup[] = [
    {
      id: '1',
      name: 'Gold Chit 50L',
      code: '#GRP-2024-001',
      chitValue: '₹5,00,000',
      monthlyAmount: '₹10,000',
      startDate: '01 Jan 2024',
      endDate: '01 Jan 2028',
      auctionDate: '5th of every month',
      duration: 50,
      totalMembers: 50,
      installmentsPaid: 12,
      totalInstallments: 50,
      nextDueDate: '05 Apr 2026',
      status: 'Active',
      foreman: 'Yogada Chit Funds Pvt Ltd',
      dividendRate: '42%',
      lastAuctionWinner: 'Member #YCF-038',
      lastAuctionBid: '₹2,10,000'
    },
    {
      id: '2',
      name: 'Silver Chit 10L',
      code: '#GRP-2025-014',
      chitValue: '₹1,00,000',
      monthlyAmount: '₹5,000',
      startDate: '01 Jun 2025',
      endDate: '01 Jun 2027',
      auctionDate: '10th of every month',
      duration: 20,
      totalMembers: 20,
      installmentsPaid: 8,
      totalInstallments: 20,
      nextDueDate: '10 Apr 2026',
      status: 'Active',
      foreman: 'Yogada Chit Funds Pvt Ltd',
      dividendRate: '36%',
      lastAuctionWinner: 'You',
      lastAuctionBid: '₹85,000'
    },
    {
      id: '3',
      name: 'Diamond Chit 1Cr',
      code: '#GRP-2025-022',
      chitValue: '₹10,00,000',
      monthlyAmount: '₹25,000',
      startDate: '01 Aug 2025',
      endDate: '01 Dec 2028',
      auctionDate: '15th of every month',
      duration: 40,
      totalMembers: 40,
      installmentsPaid: 8,
      totalInstallments: 40,
      nextDueDate: '15 Apr 2026',
      status: 'Active',
      foreman: 'Yogada Chit Funds Pvt Ltd',
      dividendRate: '33.6%',
      lastAuctionWinner: 'Member #YCF-012',
      lastAuctionBid: '₹6,64,000'
    }
  ];

  selectChit(chit: ChitGroup) {
    this.selectedChit = chit;
  }

  getProgressPercent(chit: ChitGroup): number {
    return Math.round((chit.installmentsPaid / chit.totalInstallments) * 100);
  }

  goBack() {
    this.selectedChit = null;
  }
}
