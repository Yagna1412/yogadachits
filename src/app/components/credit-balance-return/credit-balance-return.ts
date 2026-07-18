import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditBalanceReturnService } from '../../service/credit-balance-return.service';

@Component({
  selector: 'app-credit-balance-return',
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-balance-return.html',
  styleUrls: ['./credit-balance-return.scss']
})
export class CreditBalanceReturnComponent implements OnInit {
  showForm = false;
  searchTerm = '';
  isLoading = false;
  isSaving = false;
  loadError = '';

  returns: any[] = [];
  filteredReturns: any[] = [];
  newReturn: any = {};

  constructor(private creditBalanceReturnService: CreditBalanceReturnService) {}

  ngOnInit(): void {
    this.loadReturns();
  }

  private tenantId(): number {
    return Number(localStorage.getItem('tenantId') || '1');
  }

  loadReturns(): void {
    this.isLoading = true;
    this.loadError = '';
    this.creditBalanceReturnService.getAllReturns(this.tenantId()).subscribe({
      next: (rows) => {
        this.returns = rows || [];
        this.filterReturns();
        this.isLoading = false;
      },
      error: (err) => {
        this.returns = [];
        this.filteredReturns = [];
        this.loadError = err?.error?.message || 'Unable to load credit balance returns.';
        this.isLoading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  filterReturns() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredReturns = this.returns.filter((r) => {
      return (
        !q ||
        (r.groupName && r.groupName.toLowerCase().includes(q)) ||
        (r.ticketNo && String(r.ticketNo).toLowerCase().includes(q)) ||
        (r.paidTo && r.paidTo.toLowerCase().includes(q))
      );
    });
  }

  saveReturn() {
    const amt = parseFloat(this.newReturn.amount) || 0;
    if (!amt || isNaN(amt)) {
      alert('Amount numeric');
      return;
    }
    ['payable', 'paidAmount', 'netPayable'].forEach((f) => {
      if (this.newReturn[f] !== undefined) {
        this.newReturn[f] = parseFloat(this.newReturn[f]) || 0;
      }
    });

    const payload = {
      ...this.newReturn,
      tenantId: this.tenantId(),
      amount: amt,
      payable: this.newReturn.payable ?? amt,
      paidAmount: this.newReturn.paidAmount ?? amt,
      netPayable: this.newReturn.netPayable ?? amt
    };

    this.isSaving = true;
    this.creditBalanceReturnService.createReturn(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.newReturn = {};
        this.showForm = false;
        this.loadReturns();
        alert('Credit returned');
      },
      error: (err) => {
        this.isSaving = false;
        alert(err?.error?.message || 'Unable to save credit balance return.');
      }
    });
  }
}
