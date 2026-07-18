import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalVoucherService } from '../../service/journal-vocher.service';

@Component({
  selector: 'app-account-journal-voucher',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-journal-voucher.html',
  styleUrls: ['./account-journal-voucher.scss']
})
export class AccountJournalVoucherComponent implements OnInit {
  showForm = false;
  searchTerm = '';
  isLoading = false;
  isSaving = false;
  loadError = '';

  vouchers: any[] = [];
  filteredVouchers: any[] = [];
  newVoucher: any = {};

  constructor(private journalVoucherService: JournalVoucherService) {}

  ngOnInit(): void {
    this.loadVouchers();
  }

  private tenantId(): number {
    return Number(localStorage.getItem('tenantId') || '1');
  }

  loadVouchers(): void {
    this.isLoading = true;
    this.loadError = '';
    this.journalVoucherService.getJournals(this.tenantId()).subscribe({
      next: (rows) => {
        this.vouchers = rows || [];
        this.filterVouchers();
        this.isLoading = false;
      },
      error: (err) => {
        this.vouchers = [];
        this.filteredVouchers = [];
        this.loadError = err?.error?.message || 'Unable to load journal vouchers.';
        this.isLoading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  filterVouchers() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredVouchers = this.vouchers.filter((v) => {
      return (
        !q ||
        (v.transactionType && v.transactionType.toLowerCase().includes(q)) ||
        (v.voucherNo && String(v.voucherNo).toLowerCase().includes(q)) ||
        (v.account && v.account.toLowerCase().includes(q))
      );
    });
  }

  saveVoucher() {
    const debit = parseFloat(this.newVoucher.debitAmount) || 0;
    const credit = parseFloat(this.newVoucher.creditAmount) || 0;

    if (isNaN(debit) || isNaN(credit)) {
      alert('Debit and Credit amounts must be numeric');
      return;
    }
    if (debit === 0 && credit === 0) {
      alert('Either Debit or Credit amount must be provided');
      return;
    }

    const totalDebit = this.newVoucher.totalDebit ? parseFloat(this.newVoucher.totalDebit) : debit;
    const totalCredit = this.newVoucher.totalCredit ? parseFloat(this.newVoucher.totalCredit) : credit;
    if (totalDebit !== totalCredit) {
      alert('Total Debit must equal Total Credit. Current Debit: ' + totalDebit + ', Current Credit: ' + totalCredit);
      return;
    }

    ['debitAmount', 'creditAmount', 'totalDebit', 'totalCredit'].forEach((f) => {
      if (this.newVoucher[f] !== undefined) {
        this.newVoucher[f] = parseFloat(this.newVoucher[f]) || 0;
      }
    });

    const payload = {
      ...this.newVoucher,
      tenantId: this.tenantId(),
      debitAmount: debit,
      creditAmount: credit,
      totalDebit,
      totalCredit
    };

    this.isSaving = true;
    this.journalVoucherService.saveJournal(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.newVoucher = {};
        this.showForm = false;
        this.loadVouchers();
        alert('Journal voucher recorded');
      },
      error: (err) => {
        this.isSaving = false;
        alert(err?.error?.message || 'Unable to save journal voucher.');
      }
    });
  }
}
