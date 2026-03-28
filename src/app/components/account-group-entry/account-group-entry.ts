import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AccountGroup { name: string; type: string; }

@Component({
  selector: 'app-account-group-entry',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-group-entry.html',
  styleUrl: './account-group-entry.scss'
})
export class AccountGroupEntryComponent {
  groups: AccountGroup[] = [
    { name: 'Cash', type: 'Assets' },
    { name: 'Bank Loan', type: 'Liabilities' }
  ];
  filteredGroups: AccountGroup[] = [...this.groups];
  searchTerm: string = '';

  showForm: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  newGroup: AccountGroup = { name: '', type: '' };

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.showForm) {
      this.newGroup = { name: '', type: '' };
    }
  }

  filterGroups(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredGroups = this.groups.filter(g => g.name.toLowerCase().includes(term) || g.type.toLowerCase().includes(term));
  }

  saveGroup(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.newGroup.name.trim() || !this.newGroup.type.trim()) {
      this.errorMessage = 'Please fill both fields';
      return;
    }
    const exists = this.groups.some(g => g.name.toLowerCase() === this.newGroup.name.toLowerCase());
    if (exists) {
      this.errorMessage = 'Group name must be unique';
      return;
    }
    this.groups.unshift({ ...this.newGroup });
    this.filterGroups();
    this.successMessage = 'Group created';
    this.newGroup = { name: '', type: '' };
  }
}