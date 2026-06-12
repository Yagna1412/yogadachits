import { Component, OnInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  SelfChitsService,
  SelfChitDropdownOption,
  SelfChitEntry,
} from '../../service/self-chits.service';

@Component({
  selector: 'app-self-chits-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './self-chits-entry.html',
  styleUrls: ['./self-chits-entry.scss'],
})
export class SelfChitsEntryComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  subscribers: SelfChitDropdownOption[] = [];
  chitGroups: SelfChitDropdownOption[] = [];
  persons: SelfChitDropdownOption[] = [];

  entries: SelfChitEntry[] = [];
  isLoading = false;
  loadError = '';

  showForm = false;
  searchTerm = '';

  selectedSubscriberId: number | null = null;
  selectedGroupId: number | null = null;
  ticketNo = '';
  selectedPersonId: number | null = null;

  errorMessage = '';
  successMessage = '';

  constructor(
    private selfChitsService: SelfChitsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadEntries();
    this.loadFormData();
  }

  loadEntries() {
    this.isLoading = true;
    this.loadError = '';
    this.selfChitsService.getAllEntries(this.searchTerm).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.entries = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.entries = [];
        this.loadError = err?.error?.message || 'Unable to load self chit entries. Please ensure the backend is running on port 8080.';
        this.cdr.detectChanges();
      },
    });
  }

  loadFormData() {
    forkJoin({
      subscribers: this.selfChitsService.getSubscribers(),
      groups: this.selfChitsService.getChitGroups(),
      persons: this.selfChitsService.getPersons(),
    }).subscribe({
      next: ({ subscribers, groups, persons }) => {
        this.subscribers = subscribers;
        this.chitGroups = groups;
        this.persons = persons;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading form data:', err);
        this.cdr.detectChanges();
      },
    });
  }

  filterEntries() {
    this.loadEntries();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.selectedSubscriberId = null;
    this.selectedGroupId = null;
    this.ticketNo = '';
    this.selectedPersonId = null;
    this.errorMessage = '';
  }

  validate(): boolean {
    this.errorMessage = '';
    if (!this.selectedSubscriberId) {
      this.errorMessage = 'Please select a subscriber';
      return false;
    }
    if (!this.selectedGroupId) {
      this.errorMessage = 'Please select a chit group';
      return false;
    }
    if (!this.ticketNo || !this.ticketNo.trim()) {
      this.errorMessage = 'Ticket number is required';
      return false;
    }
    if (!this.selectedPersonId) {
      this.errorMessage = 'Please select a person';
      return false;
    }
    return true;
  }

  saveEntry() {
    if (!this.validate()) {
      return;
    }

    this.selfChitsService
      .createEntry({
        subscriberId: this.selectedSubscriberId!,
        chitGroupId: this.selectedGroupId!,
        ticketNo: this.ticketNo.trim(),
        personId: this.selectedPersonId!,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Entry saved successfully';
          this.resetForm();
          this.loadEntries();
          this.cdr.detectChanges();
          setTimeout(() => {
            this.successMessage = '';
            this.showForm = false;
            this.cdr.detectChanges();
          }, 2000);
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message || 'Failed to save entry. Please check the backend is running.';
          this.cdr.detectChanges();
        },
      });
  }
}
