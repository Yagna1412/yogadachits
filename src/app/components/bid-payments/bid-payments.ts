import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { BidPaymentsService } from '../../service/bid-payment.service';
import { AuctionsService, AuctionResponse } from '../../service/auction.service'; 
import { EnrollmentsService, EnrollmentResponse } from '../../service/enrollments.service';

// Extend the AuctionResponse to hold UI-friendly strings for the dropdown
interface AuctionDropdownItem extends AuctionResponse {
  memberName?: string;
  ticketString?: string;
}

@Component({
  selector: 'app-bid-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bid-payments.html',
  styleUrls: ['./bid-payments.scss']
})
export class BidPaymentsComponent implements OnInit, AfterViewInit {
  showForm = false;
  searchTerm: string = '';
  isLoadingTable = false;
  
  payments: any[] = [];
  filteredPayments: any[] = [];
  newPayment: any = {};

  completedAuctions: AuctionDropdownItem[] = [];
  selectedAuctionId: number | null = null;
  isLoadingForm = false;

  constructor(
    private bidPaymentService: BidPaymentsService,
    private auctionsService: AuctionsService,
    private enrollmentsService: EnrollmentsService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadData();
    }, 0);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.newPayment = {}; 
      this.selectedAuctionId = null;
    }
  }

  loadData() {
    this.isLoadingTable = true;

    forkJoin({
      payoutsRes: this.bidPaymentService.getPayments(),
      auctionsRes: this.auctionsService.listAuctions(),
      chitGroupsRes: this.auctionsService.listChitGroups(),
      enrollmentsRes: this.enrollmentsService.getEnrollments()
    }).subscribe({
      next: ({ payoutsRes, auctionsRes, chitGroupsRes, enrollmentsRes }) => {
        this.isLoadingTable = false;

        const payouts = payoutsRes?.data || [];
        const auctions = auctionsRes?.data || [];
        
        // EXPLICIT ANY CAST TO BYPASS TYPESCRIPT STRICTNESS
        const chitGroups: any[] = (chitGroupsRes?.data as any[]) || []; 
        const enrollments = enrollmentsRes?.data || [];

        const auctionMap = new Map(auctions.map(a => [a.id, a]));
        // EXPLICIT MAP TYPING
        const chitGroupMap = new Map<number, any>(chitGroups.map(g => [g.id, g]));
        const enrollmentMap = new Map(enrollments.map(e => [e.id, e]));

        const auctionPayouts = payouts.filter(p => p.payoutType === 'auction_winner_payout');
        
        this.payments = auctionPayouts.map(p => {
          const matchedAuction = auctionMap.get(p.auctionId);
          const matchedEnrollment = enrollmentMap.get(p.enrollmentId);
          const matchedChitGroup = chitGroupMap.get(matchedAuction?.chitGroupId || matchedEnrollment?.chitGroupId || 0);

          const memberName = matchedEnrollment?.memberName || 'Unknown Member';
          const series = matchedChitGroup?.chitSeries || matchedAuction?.auctionNumber?.toString() || 'N/A';

          return {
            id: p.id,
            groupName: matchedAuction?.groupName || matchedChitGroup?.name || `Group (Auction #${p.auctionId})`,
            ticketNo: matchedEnrollment ? `T${String(matchedEnrollment.ticketNo).padStart(3, '0')}` : `ID: ${p.enrollmentId}`,
            paidTo: memberName,
            series,
            no: p.voucherNo || p.payoutNo || p.id || 'N/A',
            transactionDate: p.paidDate || p.scheduledDate,
            account: p.account || p.paymentMode || 'Cash',
            amount: p.amountGross || p.amount || p.paidAmount || 0,
            narration: p.narration || '',
            chequeNumber: p.chequeNumber || p.chequeNo || '',
            chequeDate: p.chequeDate || null,
            currentInstallment: p.currentInstallment || matchedAuction?.installmentNo || 0,
            paidUpTo: p.paidUpTo || p.paidInstallments || 0,
            auctionOn: matchedAuction?.auctionDate || '',
            installmentMonth: p.installmentMonth || p.installmentMonthYear || matchedAuction?.installmentDueDate || '',
            chitAmount: matchedAuction?.chitAmount || matchedChitGroup?.chitAmount || 0,
            companyCommission: p.companyCommission || matchedAuction?.companyCommissionPct || matchedChitGroup?.companyCommission || 0,
            bidAmount: p.bidAmount || matchedAuction?.winningBidAmount || 0,
            bidPayable: p.bidPayable || p.amountNet || 0,
            bpAdjustment: p.bpAdjustment || 0,
            advanceAdjustment: p.advanceAdjustment || 0,
            paidAmount: p.amountNet || p.paidAmount || p.amount || 0,
            netPayable: p.netPayable || p.amountNet || 0
          };
        });

        this.filteredPayments = [...this.payments];

        this.completedAuctions = auctions
          .filter(a => a.winningBidId != null) 
          .map(a => {
            const e = enrollmentMap.get(a.winnerEnrollmentId!);
            const memberName = e?.memberName || 'Unknown Member';
            
            return {
              ...a,
              memberName: memberName,
              ticketString: e ? `T${String(e.ticketNo).padStart(3, '0')}` : ''
            };
          });
      },
      error: (err) => {
        this.isLoadingTable = false;
        console.error('Error fetching relational data', err);
      }
    });
  }

  filterPayments() {
    if (!this.searchTerm) {
      this.filteredPayments = [...this.payments];
      return;
    }
    const lower = this.searchTerm.toLowerCase();
    this.filteredPayments = this.payments.filter(p => 
      (p.groupName && p.groupName.toLowerCase().includes(lower)) || 
      (p.paidTo && p.paidTo.toLowerCase().includes(lower)) ||
      (p.ticketNo && p.ticketNo.toLowerCase().includes(lower))
    );
  }

  onAuctionSelect() {
    if (!this.selectedAuctionId) {
      this.newPayment = {};
      return;
    }

    this.isLoadingForm = true;
    this.bidPaymentService.getBidPaymentDetails(this.selectedAuctionId).subscribe({
      next: (res) => {
        this.isLoadingForm = false;
        if (res && res.success && res.data) {
          this.newPayment = res.data;
        } else {
          alert('Failed to load details: ' + (res?.message || 'Unknown error'));
          this.selectedAuctionId = null;
        }
      },
      error: (err) => {
        this.isLoadingForm = false;
        alert('Server error loading auction details.');
      }
    });
  }

  savePayment() {
    if (!this.selectedAuctionId) {
      alert('Please select an auction to disburse first.');
      return;
    }

    const amt = parseFloat(this.newPayment.amount) || 0;
    if (!amt || isNaN(amt)) {
      alert('Paid Amount must be numeric and greater than zero.');
      return;
    }

    this.newPayment.bpAdjustment = parseFloat(this.newPayment.bpAdjustment) || 0;
    this.newPayment.advanceAdjustment = parseFloat(this.newPayment.advanceAdjustment) || 0;

    this.bidPaymentService.processPayment(this.newPayment).subscribe({
      next: (res: any) => {
        if (res && res.success === false) {
          alert('Failed to save: ' + res.message);
          return;
        }
        alert('Payment disbursed and recorded successfully!');
        this.showForm = false;
        this.loadData(); 
      },
      error: (err) => {
        console.error('Save failed', err);
        alert('Failed to connect to backend.');
      }
    });
  }
}