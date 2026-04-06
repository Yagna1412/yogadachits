import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceiptService, ReceiptCreateRequest, ReceiptResponse } from '../../service/receipt.service';
import { EnrollmentsService, EnrollmentResponse } from '../../service/enrollments.service';
import { ChitGroupsService } from '../../service/chit-groups.service';
import { MemberService, MemberResponse } from '../../service/member.service';

@Component({
  selector: 'app-receipts',
  imports: [CommonModule, FormsModule],
  templateUrl: './receipts.html',
  styleUrls: ['./receipts.scss']
})
export class ReceiptsComponent implements OnInit, AfterViewInit {

  showForm = false;
  receiptType = 'Daily';

  // search / filter fields
  searchTerm: string = '';
  searchType: string = '';
  searchDate: string = '';
  searchGroup: string = '';
  searchSubscriber: string = '';
  searchAgent: string = '';

  receipts: any[] = []; 
  filteredReceipts: any[] = [];

  enrollments: EnrollmentResponse[] = [];
  members: MemberResponse[] = [];
  chitGroups: any[] = [];

  selectedReceipt: any = null;

  newReceipt: any = {
    enrollmentId: null,
    groupName: '',
    ticketNo: '',
    receiptDate: '',
    receiptNo: '',
    paymentMode: 'cash',
    amount: 0,
    subscriber: ''
  };
  
  errorMessage: string = '';

  constructor(
    private receiptService: ReceiptService,
    private enrollmentsService: EnrollmentsService,
    private chitGroupsService: ChitGroupsService,
    private memberService: MemberService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Deferred load using ngAfterViewInit for lighter initial render
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadReceipts();
        this.loadEnrollments();
        this.loadMembers();
        this.loadChitGroups();
      }, 0);
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      // Ensure paymentMode has a default to avoid blank dropdowns
      this.newReceipt = { paymentMode: 'cash' }; 
      this.errorMessage = ''; 
    }
  }

  loadReceipts() {
    this.receiptService.getReceipts().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.receipts = response.data.map((r: ReceiptResponse) => ({
            id: r.id,
            type: r.type || 'Daily', 
            groupName: r.groupName || `Enrollment #${r.enrollmentId}`, 
            ticketNo: r.ticketNo || '-', 
            receiptDate: r.receiptDate,
            receiptNo: r.receiptNo,
            paymentMode: r.paymentMode,
            amount: r.receiptAmount,
            subscriber: r.subscriberName || 'Unknown', 
            agent: r.agentName || (r.collectedByAgentId ? `Agent ID ${r.collectedByAgentId}` : 'N/A')
          }));
          this.filterReceipts();
        }
      },
      error: (err) => {
        console.error('Error fetching receipts', err);
        this.errorMessage = 'Failed to load receipts from backend. Please ensure the server is running.';
      }
    });
  }

  loadEnrollments() {
    this.enrollmentsService.getEnrollments().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.enrollments = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error loading enrollments', err);
        this.enrollments = [];
      }
    });
  }

  loadMembers() {
    this.memberService.getMembers().subscribe({
      next: (data) => {
        this.members = data || [];
      },
      error: (err) => {
        console.error('Error loading members', err);
        this.members = [];
      }
    });
  }

  loadChitGroups() {
    this.chitGroupsService.getChitGroups().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.chitGroups = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error loading chit groups', err);
        this.chitGroups = [];
      }
    });
  }

  saveReceipt() {
    this.errorMessage = ''; 

    if (!this.newReceipt.enrollmentId) {
      this.errorMessage = 'Please select valid enrollment/member to record receipt.';
      return;
    }

    const amountToSave = parseFloat(this.newReceipt.amount);
    if (isNaN(amountToSave) || amountToSave < 0.01) {
      this.errorMessage = 'Please enter a valid receipt amount greater than 0.';
      return;
    }

    const validModes = ['cash', 'cheque', 'online', 'upi', 'card', 'neft', 'rtgs', 'imps', 'bank_transfer'];
    const pMode = (this.newReceipt.paymentMode || 'cash').toLowerCase().trim();

    if (!validModes.includes(pMode)) {
      this.errorMessage = `Invalid Payment Mode. Must be one of: ${validModes.join(', ')}`;
      return;
    }

    if (pMode === 'cheque') {
      if (!this.newReceipt.bankName || !this.newReceipt.instrumentNo || !this.newReceipt.instrumentDate) {
        this.errorMessage = 'Bank Name, Instrument No, and Cheque Date are required for Cheque payments.';
        return;
      }
    }

    const enrollment = this.enrollments.find(e => e.id === this.newReceipt.enrollmentId);
    const subscriberName = enrollment?.memberName || this.newReceipt.subscriber || this.getMemberName(enrollment?.memberId);
    const groupName = enrollment?.chitGroupName || this.newReceipt.groupName || this.getGroupName(enrollment?.chitGroupId);

    const payload: ReceiptCreateRequest = {
      enrollmentId: this.newReceipt.enrollmentId,
      receiptType: this.receiptType,
      receiptDate: this.newReceipt.receiptDate || new Date().toISOString().split('T')[0],
      receiptNo: this.newReceipt.receiptNo || `REC-${Math.floor(Math.random() * 10000)}`,
      paymentMode: pMode,
      receiptAmount: amountToSave,
      bankName: pMode === 'cheque' ? this.newReceipt.bankName : null,
      instrumentNo: pMode === 'cheque' ? this.newReceipt.instrumentNo : null,
      instrumentDate: pMode === 'cheque' ? this.newReceipt.instrumentDate : null,
      notes: `Type: ${this.receiptType} | Subscriber: ${subscriberName || 'N/A'} | Group: ${groupName || 'N/A'}`
    };

    this.receiptService.createReceipt(payload).subscribe({
      next: () => {
        this.showForm = false;
        this.receiptType = 'Daily';
        this.newReceipt = {
          enrollmentId: null,
          groupName: '',
          ticketNo: '',
          receiptDate: '',
          receiptNo: '',
          paymentMode: 'cash',
          amount: 0,
          subscriber: ''
        };
        this.loadReceipts();
      },
      error: (err) => {
        console.error('Error saving receipt:', err);
        if (err.status === 400 && err.error?.message) {
          this.errorMessage = `Bad Request: ${err.error.message}`;
        } else if (err.status === 400 && err.error?.errors) {
          const validationErrors = Object.entries(err.error.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          this.errorMessage = `Validation Failed - ${validationErrors}`;
          this.errorMessage = `Server Error (${err.status}): Failed to save receipt.`;
        }
      }
    });
  }

  filterReceipts(): void {
    this.filteredReceipts = this.receipts.filter(r => {
      const matchesSearch = !this.searchTerm ||
        (r.groupName && r.groupName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (r.ticketNo && r.ticketNo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (r.subscriber && r.subscriber.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesType = !this.searchType || r.type === this.searchType;
      const matchesDate = !this.searchDate || r.receiptDate === this.searchDate;
      const matchesGroup = !this.searchGroup || (r.groupName && r.groupName.toLowerCase().includes(this.searchGroup.toLowerCase()));
      const matchesSubscriber = !this.searchSubscriber || (r.subscriber && r.subscriber.toLowerCase().includes(this.searchSubscriber.toLowerCase()));
      const matchesAgent = !this.searchAgent || (r.agent && r.agent.toLowerCase().includes(this.searchAgent.toLowerCase()));

      return matchesSearch && matchesType && matchesDate && matchesGroup && matchesSubscriber && matchesAgent;
    });
  }

  getMemberName(memberId?: number): string {
    if (!memberId) return 'Unknown';
    return this.members.find(m => m.id === memberId)?.name || 'Unknown';
  }

  getGroupName(groupId?: number): string {
    if (!groupId) return 'Unknown';
    return this.chitGroups.find(g => g.id === groupId)?.groupName || 'Unknown';
  }

  selectReceipt(receipt: any): void {
    this.selectedReceipt = {
      ...receipt,
      memberName: receipt.subscriber || this.getMemberName(this.enrollments.find(e => e.id === receipt.enrollmentId)?.memberId),
      groupName: receipt.groupName || this.getGroupName(this.enrollments.find(e => e.id === receipt.enrollmentId)?.chitGroupId),
      enrollment: this.enrollments.find(e => e.id === receipt.enrollmentId)
    };
  }

  getSelectedEnrollmentField(field: string): string {
    if (!this.selectedReceipt?.enrollment) {
      return 'N/A';
    }
    return this.selectedReceipt.enrollment[field] || 'N/A';
  }

  totalAmount(): number {
    return this.filteredReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  }
}