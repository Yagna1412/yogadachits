import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemberReceiptService, MemberReceiptTableResponse, MemberReceiptCreateRequest } from '../../service/member-receipt.service';
import { EnrollmentsService, EnrollmentResponse } from '../../service/enrollments.service';
import { ChitGroupsService } from '../../service/chit-groups.service';
import { MemberService, MemberResponse } from '../../service/member.service';

@Component({
  selector: 'app-member-receipts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-receipts.html',
  styleUrl: './member-receipts.scss',
})
export class MemberReceiptsComponent implements OnInit, AfterViewInit {
  searchTerm: string = '';
  isLoading = false;
  allReceipts: MemberReceiptTableResponse[] = [];
  filteredReceipts: MemberReceiptTableResponse[] = [];
  paginatedReceipts: MemberReceiptTableResponse[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Sorting
  sortColumn: string = 'receiptNo';
  sortDirection: 'asc' | 'desc' = 'desc';

  Math = Math; // To use Math.min in template
  
  newReceipt: MemberReceiptCreateRequest = {
    enrollmentId: 0,
    receiptType: 'Daily',
    amount: null,
    paymentMode: 'Cash'
  };

  todayKpi: any = {
    totalCollection: 0, cash: 0, upi: 0, cheque: 0, bankTransfer: 0
  };

  enrollments: EnrollmentResponse[] = [];
  members: MemberResponse[] = [];
  chitGroups: any[] = [];

  selectedEnrollment: EnrollmentResponse | null = null;
  installmentRecords: any[] = [];

  totalDue = 0;
  arrears = 0;

  isLoadingEnrollments = false;
  isLoadingMembers = false;
  isLoadingChitGroups = false;

  constructor(
    private receiptService: MemberReceiptService,
    private enrollmentsService: EnrollmentsService,
    private chitGroupsService: ChitGroupsService,
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadReceipts();
      this.loadKpis();
      this.loadEnrollments();
      this.loadMembers();
      this.loadChitGroups();
    }, 0);
  }

  loadEnrollments(): void {
    this.isLoadingEnrollments = true;
    this.enrollmentsService.getEnrollments().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.enrollments = Array.isArray(data) ? data : [];
        this.isLoadingEnrollments = false;
      },
      error: () => {
        this.enrollments = [];
        this.isLoadingEnrollments = false;
      }
    });
  }

  loadMembers(): void {
    this.isLoadingMembers = true;
    this.memberService.getMembers().subscribe({
      next: (data: MemberResponse[]) => {
        this.members = data || [];
        this.isLoadingMembers = false;
      },
      error: () => {
        this.members = [];
        this.isLoadingMembers = false;
      }
    });
  }

  loadChitGroups(): void {
    this.isLoadingChitGroups = true;
    this.chitGroupsService.getChitGroups().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.chitGroups = Array.isArray(data) ? data : [];
        this.isLoadingChitGroups = false;
      },
      error: () => {
        this.chitGroups = [];
        this.isLoadingChitGroups = false;
      }
    });
  }

  onEnrollmentSelected(enrollmentId: number | null): void {
    if (!enrollmentId || enrollmentId <= 0) {
      this.selectedEnrollment = null;
      this.totalDue = 0;
      this.arrears = 0;
      this.installmentRecords = [];
      return;
    }

    this.newReceipt.enrollmentId = enrollmentId;

    this.enrollmentsService.getEnrollmentById(enrollmentId).subscribe({
      next: (res: any) => {
        this.selectedEnrollment = res?.data || null;
      },
      error: () => {
        this.selectedEnrollment = null;
      }
    });

    this.enrollmentsService.getInstallmentsByEnrollmentId(enrollmentId).subscribe({
      next: (res: any) => {
        this.installmentRecords = res?.data || [];

        const unpaidInstallments = this.installmentRecords.filter((inst: any) =>
          inst.status?.toUpperCase() !== 'PAID'
        );

        this.totalDue = unpaidInstallments.reduce((sum: number, inst: any) => {
          const due = Number(inst.dueAmount ?? inst.amount ?? 0);
          return sum + (isNaN(due) ? 0 : due);
        }, 0);

        const today = new Date();
        this.arrears = unpaidInstallments.reduce((sum: number, inst: any) => {
          const dueDate = inst.dueDate ? new Date(inst.dueDate) : null;
          if (dueDate && dueDate < today) {
            const due = Number(inst.dueAmount ?? inst.amount ?? 0);
            return sum + (isNaN(due) ? 0 : due);
          }
          return sum;
        }, 0);
      },
      error: () => {
        this.installmentRecords = [];
        this.totalDue = 0;
        this.arrears = 0;
      }
    });
  }

  loadReceipts(): void {
    this.isLoading = true;
    this.receiptService.getReceiptTableData().subscribe({
      next: (data) => {
        this.allReceipts = data || [];
        this.filterReceipts();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching receipts:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadKpis(): void {
    this.receiptService.getTodayKpi().subscribe({
      next: (data) => {
        if (data) this.todayKpi = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching KPIs:', err)
    });
  }

  filterReceipts(): void {
    const search = (this.searchTerm || '').trim().toLowerCase();
    
    // 1. Filter
    let result = this.allReceipts.filter(receipt => {
      const receiptNo = (receipt.receiptNo || '').toString().toLowerCase();
      const memberName = (receipt.memberName || '').toLowerCase();
      const groupName = (receipt.groupName || '').toLowerCase();
      const paymentMode = (receipt.paymentMode || '').toLowerCase();
      const amount = receipt.amount != null ? receipt.amount.toString().toLowerCase() : '';

      return !search || (
        receiptNo.includes(search) ||
        memberName.includes(search) ||
        groupName.includes(search) ||
        paymentMode.includes(search) ||
        amount.includes(search)
      );
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
    alert(`Viewing Receipt: ${receipt.receiptNo}`);
  }

  printReceipt(receipt: any): void {
    alert(`Printing Receipt: ${receipt.receiptNo}`);
  }

  deleteReceipt(id: number): void {
    if (confirm('Delete this receipt?')) {
      this.receiptService.deleteReceipt(id).subscribe({
        next: () => {
          this.loadReceipts();
          this.loadKpis();
        },
        error: (err: any) => {
          alert('Failed to delete: ' + (err.error?.message || 'Server error'));
        }
      });
    }
  }

  getMemberName(memberId: number | undefined): string {
    if (!memberId) return 'Unknown';
    return this.members.find(m => m.id === memberId)?.name || 'Unknown';
  }

  getGroupName(groupId: number | undefined): string {
    if (!groupId) return 'Unknown';
    return this.chitGroups.find(g => g.id === groupId)?.groupName || 'Unknown';
  }

  saveReceipt(): void {
    if (!this.newReceipt.enrollmentId) {
      alert('Please select an enrollment / member.');
      return;
    }

    if (!this.newReceipt.amount || this.newReceipt.amount <= 0) {
      alert('Enter a valid amount greater than 0.');
      return;
    }

    if (!this.newReceipt.paymentMode) {
      alert('Select a payment mode.');
      return;
    }

    // Validation for Cheque
    if (this.newReceipt.paymentMode.toLowerCase() === 'cheque') {
      if (!this.newReceipt.bankName || !this.newReceipt.instrumentNo || !this.newReceipt.instrumentDate) {
        alert('Bank Name, Cheque No, and Cheque Date are required for Cheque payments.');
        return;
      }
    }

    const enrollment = this.enrollments.find(e => e.id === this.newReceipt.enrollmentId);
    const memberName = enrollment?.memberName || this.getMemberName(enrollment?.memberId);
    const groupName = enrollment?.chitGroupName || this.getGroupName(enrollment?.chitGroupId);

    const payload: MemberReceiptCreateRequest = {
      enrollmentId: this.newReceipt.enrollmentId,
      receiptType: this.newReceipt.receiptType || 'Daily',
      amount: Number(this.newReceipt.amount),
      paymentMode: this.newReceipt.paymentMode,
      bankName: this.newReceipt.bankName,
      instrumentNo: this.newReceipt.instrumentNo,
      instrumentDate: this.newReceipt.instrumentDate,
      notes: `Member: ${memberName || 'Unknown'}, Group: ${groupName || 'Unknown'}`
    };

    this.receiptService.createReceipt(payload).subscribe({
      next: () => {
        alert('Success: Receipt Saved');
        // Reset specific fields but keep defaults
        this.newReceipt = {
          enrollmentId: 0,
          receiptType: 'Daily',
          amount: null,
          paymentMode: 'Cash'
        };
        this.loadReceipts();
        this.loadKpis();
      },
      error: (err: any) => {
        console.error('Failed to save member receipt', err);
        alert('Failed to save receipt.');
      }
    });
  }
}
