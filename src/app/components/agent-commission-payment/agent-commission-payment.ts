import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentCommissionPaymentService } from '../../service/agent-commission-payment.service';

@Component({
  selector: 'app-agent-commission-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-commission-payment.html',
  styleUrls: ['./agent-commission-payment.scss']
})
export class AgentCommissionPaymentComponent implements OnInit {
  showForm = false;
  searchTerm = '';
  isLoading = false;
  isSaving = false;
  loadError = '';

  bills: any[] = [];
  filteredBills: any[] = [];
  newBill: any = {};

  constructor(private agentCommissionPaymentService: AgentCommissionPaymentService) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.isLoading = true;
    this.loadError = '';
    this.agentCommissionPaymentService.getAllBills().subscribe({
      next: (rows) => {
        this.bills = rows || [];
        this.filterBills();
        this.isLoading = false;
      },
      error: (err) => {
        this.bills = [];
        this.filteredBills = [];
        this.loadError = err?.error?.message || 'Unable to load commission bills.';
        this.isLoading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  filterBills() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredBills = this.bills.filter((b) => {
      return (
        !q ||
        (b.agentName && b.agentName.toLowerCase().includes(q)) ||
        (b.voucherNo && String(b.voucherNo).toLowerCase().includes(q))
      );
    });
  }

  saveBill() {
    const amt = parseFloat(this.newBill.totalBill) || 0;
    if (!amt || isNaN(amt)) {
      alert('Amount numeric');
      return;
    }
    ['tdsPct', 'tdsAmount', 'gstPct', 'gstAmount', 'totalBill', 'finalBill'].forEach((f) => {
      if (this.newBill[f] !== undefined) {
        this.newBill[f] = parseFloat(this.newBill[f]) || 0;
      }
    });

    this.isSaving = true;
    this.agentCommissionPaymentService.createBill({ ...this.newBill }).subscribe({
      next: () => {
        this.isSaving = false;
        this.newBill = {};
        this.showForm = false;
        this.loadBills();
        alert('Bill prepared');
      },
      error: (err) => {
        this.isSaving = false;
        alert(err?.error?.message || 'Unable to save commission bill.');
      }
    });
  }
}
