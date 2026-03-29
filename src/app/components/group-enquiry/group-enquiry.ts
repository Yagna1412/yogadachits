import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group-enquiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-enquiry.html',
  styleUrls: ['./group-enquiry.scss']
})
export class GroupEnquiryComponent {
  nameQuery = 'FT01VSR';
  activeTab = 'subscribers';

  selectedGroup: any = {
    groupName: 'FT01VSR',
    groupSeries: 'Mid Term',
    installmentAmount: 96000,
    chitAmount: 4000000,
    noOfInstallments: 40,
    companyChit: 1,
    auctionType: 'Monthly',
    auctionsPerMonth: 1,
    noAuctInst: 3,
    commencementDate: '30/08/2023',
    terminationDate: '30/11/2026',
    auctionDay: 'Every Month 4',
    psoNumber: 'MP020823P063',
    psoDate: '02/08/2023',
    auctionTime: '2:20 PM',
    caNumber: 'MP300823C058',
    caDate: '30/08/2023',
    dividend: 'Next Month'
  };

  detailTabs = [
    { key: 'subscribers', label: 'Subscribers Information' },
    { key: 'general', label: 'General Information' },
    { key: 'bidders', label: 'Bidders List' },
    { key: 'dividend', label: 'Divident List' },
    { key: 'due', label: 'Due List' },
    { key: 'auction', label: 'Auction Details' },
    { key: 'other', label: 'Other Info' }
  ];

  // Sample data for tables
  subscribers = [
    { chitNo: '1', subName: 'Rajesh Kumar', enrolDate: '01/09/2023', position: '1', paidUpTo: '5', payable: 480000, paid: 480000, balance: 0 },
    { chitNo: '2', subName: 'Priya Sharma', enrolDate: '02/09/2023', position: '2', paidUpTo: '4', payable: 480000, paid: 384000, balance: 96000 },
    { chitNo: '3', subName: 'Vikram Singh', enrolDate: '05/09/2023', position: '3', paidUpTo: '5', payable: 480000, paid: 480000, balance: 0 }
  ];

  generalInfo = [
    { description: 'Active Members', noOfMembers: 38, default: '-' },
    { description: 'Cancelled Members', noOfMembers: 2, default: '-' },
    { description: 'Total Members', noOfMembers: 40, default: '-' }
  ];

  biddersList = [
    { aNo: '1', auctionDate: '04/10/2023', tktNo: '12', bidderName: 'Amit Patel', bidAmount: 400000, payable: 80000, paid: 80000, balance: 0 },
    { aNo: '2', auctionDate: '04/11/2023', tktNo: '05', bidderName: 'Suresh Raina', bidAmount: 450000, payable: 90000, paid: 90000, balance: 0 }
  ];

  dividendList = [
    { instNo: '1', monthYear: 'Oct 2023', dividend: 2000, subscription: 94000, cumDividend: 2000, cumSubscription: 94000 },
    { instNo: '2', monthYear: 'Nov 2023', dividend: 2500, subscription: 93500, cumDividend: 4500, cumSubscription: 187500 }
  ];

  dueList = [
    { tktNo: '15', subName: 'Anil Gupta', paidUpTo: '4', position: '4', due: 96000, penality: 500, totalDue: 96500 },
    { tktNo: '22', subName: 'Meera Devi', paidUpTo: '3', position: '22', due: 192000, penality: 1200, totalDue: 193200 }
  ];

  auctionDetails = {
    previousBidder: { name: 'Kushal Pal', tktNo: '08', bidAmount: 350000, date: '04/09/2023' },
    presentBidder: { name: 'Amit Patel', tktNo: '12', bidAmount: 400000, date: '04/10/2023' }
  };

  otherInfo = {
    investment: {
      subscriptionAmount: 2657975,
      dividendEarned: 542025,
      netSubscription: 3200000
    },
    bidPayment: {
      bidPayableAmount: 92319000,
      bidPaidAmount: 88679000,
      balanceAmount: 3640000
    }
  };

  constructor() {}

  search() {
    if (this.nameQuery === 'FT01VSR') {
      this.selectedGroup = { ...this.selectedGroup };
    }
  }

  setTab(tabKey: string) {
    this.activeTab = tabKey;
  }
}
