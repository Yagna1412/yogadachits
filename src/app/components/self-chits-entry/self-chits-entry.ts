import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  // Dropdown data (loaded from backend)
  subscribers: SelfChitDropdownOption[] = [];
  chitGroups: SelfChitDropdownOption[] = [];
  persons: SelfChitDropdownOption[] = [];

  // Table data (loaded from backend)
  entries: SelfChitEntry[] = [];

  showForm = false;
  searchTerm = '';

  // Form fields
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
    this.loadEntries();
    this.loadFormData();
  }

  loadEntries() {
    this.selfChitsService.getAllEntries(this.searchTerm).subscribe({
      next: (data) => {
        this.entries = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching self chits:', err),
    });
  }

  /** Load Subscribers, Chit Groups, and Persons in one parallel call */
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
          // Surface backend message (e.g. duplicate ticket for the same group)
          this.errorMessage =
            err?.error?.message || 'Failed to save entry. Please check the backend is running.';
          this.cdr.detectChanges();
        },
      });
  }
}
