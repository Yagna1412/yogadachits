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
  paginatedReceipts: any[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Sorting
  sortColumn: string = 'receiptDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  isLoading: boolean = false;
  Math = Math;

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
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching receipts', err);
        this.errorMessage = 'Failed to load receipts from backend. Please ensure the server is running.';
        this.isLoading = false;
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
    const searchStr = (this.searchTerm || '').trim().toLowerCase();

    // 1. Filter
    let result = this.receipts.filter(r => {
      const matchesSearch = !searchStr ||
        (r.groupName && r.groupName.toLowerCase().includes(searchStr)) ||
        (r.ticketNo && r.ticketNo.toLowerCase().includes(searchStr)) ||
        (r.receiptNo && r.receiptNo.toLowerCase().includes(searchStr)) ||
        (r.subscriber && r.subscriber.toLowerCase().includes(searchStr));

      const matchesType = !this.searchType || r.type === this.searchType;
      const matchesDate = !this.searchDate || r.receiptDate === this.searchDate;
      const matchesGroup = !this.searchGroup || (r.groupName && r.groupName.toLowerCase().includes(this.searchGroup.toLowerCase()));
      const matchesSubscriber = !this.searchSubscriber || (r.subscriber && r.subscriber.toLowerCase().includes(this.searchSubscriber.toLowerCase()));
      const matchesAgent = !this.searchAgent || (r.agent && r.agent.toLowerCase().includes(this.searchAgent.toLowerCase()));

      return matchesSearch && matchesType && matchesDate && matchesGroup && matchesSubscriber && matchesAgent;
    });

    // 2. Sort
    result.sort((a: any, b: any) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredReceipts = result;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredReceipts.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedReceipts = this.filteredReceipts.slice(startIndex, startIndex + this.pageSize);
  }

  toggleSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.filterReceipts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 3;
    let start = Math.max(1, this.currentPage - 1);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - (maxVisible - 1));
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewReceipt(receipt: any): void {
    this.selectReceipt(receipt);
    // Logic to open a view modal could go here, for now using selectReceipt
  }

  printReceipt(receipt: any): void {
    alert(`Printing Receipt: ${receipt.receiptNo}`);
    // Real print logic would go here
  }

  deleteReceipt(id: number): void {
    if (confirm('Are you sure you want to delete this receipt?')) {
      this.receiptService.deleteReceipt(id).subscribe({
        next: () => {
          this.loadReceipts();
        },
        error: (err: any) => {
          alert('Failed to delete receipt: ' + (err.error?.message || 'Server error'));
        }
      });
    }
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
