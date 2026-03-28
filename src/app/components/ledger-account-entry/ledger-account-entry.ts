import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Ledger {
  name: string;
  group: string;
  person?: string;
  address?: string;
  pincode?: string;
  email?: string;
  mobile?: string;
  hsn?: string;
  tin?: string;
  mfl?: string;
  gst?: string;
  pan?: string;
  igst?: number;
  cgst?: number;
  sgst?: number;
}

@Component({
  selector: 'app-ledger-account-entry',
  imports: [CommonModule, FormsModule],
  templateUrl: './ledger-account-entry.html',
  styleUrl: './ledger-account-entry.scss'
})
export class LedgerAccountEntryComponent {
  groups: string[] = ['Cash','Bank Loan','Commission Income'];
  ledgers: Ledger[] = [
    { name: 'Main Cash', group: 'Cash' }
  ];
  filteredLedgers: Ledger[] = [...this.ledgers];
  searchTerm: string = '';

  showForm: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  newLedger: Ledger = { name:'', group:'' };

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.showForm) {
      this.newLedger = { name:'', group:'' };
    }
  }

  filterLedgers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredLedgers = this.ledgers.filter(l =>
      l.name.toLowerCase().includes(term) || l.group.toLowerCase().includes(term)
    );
  }

  saveLedger(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.newLedger.name.trim() || !this.newLedger.group.trim()) {
      this.errorMessage = 'Please fill required fields';
      return;
    }
    const exists = this.ledgers.some(l => l.name.toLowerCase() === this.newLedger.name.toLowerCase());
    if (exists) {
      this.errorMessage = 'Ledger name must be unique';
      return;
    }
    this.ledgers.unshift({ ...this.newLedger });
    this.filterLedgers();
    this.successMessage = 'Ledger created';
    this.newLedger = { name:'', group:'' };
  }
}