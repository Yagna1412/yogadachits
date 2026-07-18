import { Component, ChangeDetectorRef, OnDestroy, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Subject } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  SelfChitsService,
  SelfChitDropdownOption,
  SelfChitEntry,
} from '../../service/self-chits.service';
import { SubscriberService } from '../../service/subscriber.service';

@Component({
  selector: 'app-self-chits-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './self-chits-entry.html',
  styleUrls: ['./self-chits-entry.scss'],
})
export class SelfChitsEntryComponent implements OnDestroy {
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

  private destroy$ = new Subject<void>();
  private searchTerm$ = new Subject<string>();

  constructor(
    private selfChitsService: SelfChitsService,
    private subscriberService: SubscriberService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      this.loadEntries();
      this.loadFormData();
    });

    this.searchTerm$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadEntries());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private authErrorMessage(err: unknown): string {
    const status = (err as { status?: number })?.status;
    if (status === 401 || status === 403) {
      return 'Session expired or not logged in. Please log in again.';
    }
    const message = (err as { error?: { message?: string } })?.error?.message;
    return message || 'Unable to load self chit entries. Please ensure the backend is running on port 8080.';
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
        this.loadError = this.authErrorMessage(err);
        this.cdr.detectChanges();
      },
    });
  }

  loadFormData() {
    forkJoin({
      subscribers: this.subscriberService.getSubscribers().pipe(
        map((subs) =>
          subs
            .filter((s) => s.subscriberType?.toLowerCase() === 'internal')
            .map((s) => ({ id: s.id, name: s.displayName }))
        ),
        catchError(() => of([] as SelfChitDropdownOption[]))
      ),
      groups: this.selfChitsService.getChitGroups().pipe(
        catchError(() => of([] as SelfChitDropdownOption[]))
      ),
      persons: this.selfChitsService.getPersons().pipe(
        catchError(() => of([] as SelfChitDropdownOption[]))
      ),
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
    this.searchTerm$.next(this.searchTerm);
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
