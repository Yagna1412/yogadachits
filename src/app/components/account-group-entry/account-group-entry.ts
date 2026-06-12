import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountGroupService, AccountGroupRecord } from '../../service/account-group.service';

interface AccountGroup {
  name: string;
  type: string;
}

@Component({
  selector: 'app-account-group-entry',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-group-entry.html',
  styleUrl: './account-group-entry.scss'
})
export class AccountGroupEntryComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  groups: AccountGroup[] = [];
  filteredGroups: AccountGroup[] = [];
  searchTerm = '';
  isLoading = false;
  isSaving = false;
  loadError = '';

  showForm = false;
  errorMessage = '';
  successMessage = '';

  newGroup: AccountGroup = { name: '', type: '' };

  constructor(
    private accountGroupService: AccountGroupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadGroups();
  }

  loadGroups() {
    this.isLoading = true;
    this.loadError = '';
    this.accountGroupService.getGroups().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.groups = (data || []).map(g => this.mapRecord(g));
        this.filterGroups();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.groups = [];
        this.filteredGroups = [];
        this.loadError = err?.error?.message || 'Unable to load account groups. Please ensure the backend is running on port 8080.';
        this.cdr.detectChanges();
      }
    });
  }

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
    this.filteredGroups = this.groups.filter(g =>
      g.name.toLowerCase().includes(term) || g.type.toLowerCase().includes(term)
    );
  }

  saveGroup(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.newGroup.name.trim() || !this.newGroup.type.trim()) {
      this.errorMessage = 'Please fill both fields';
      return;
    }

    this.isSaving = true;
    this.accountGroupService.createGroup({
      groupName: this.newGroup.name.trim(),
      groupType: this.newGroup.type.trim()
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Group created';
        this.newGroup = { name: '', type: '' };
        this.loadGroups();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Failed to save group. Please check the backend is running.';
        this.cdr.detectChanges();
      }
    });
  }

  private mapRecord(record: AccountGroupRecord): AccountGroup {
    return {
      name: record.groupName,
      type: record.groupType
    };
  }
}
