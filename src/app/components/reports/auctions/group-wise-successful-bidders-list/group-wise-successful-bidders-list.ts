import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';

@Component({
  selector: 'app-group-wise-successful-bidders-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './group-wise-successful-bidders-list.html',
  styleUrls: ['./group-wise-successful-bidders-list.scss']
})
export class GroupWiseSuccessfulBiddersListComponent {
  groupForm: FormGroup;
  bidders = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;
  isLoading = false;
  loadError = '';

  groupStatuses = [
    { label: 'Running', value: 'Running' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Both', value: 'Both' }
  ];

  constructor(
    private fb: FormBuilder,
    private reportService: AuctionReportService
  ) {
    this.groupForm = this.fb.group({
      groupName: [''],
      groupStatus: ['Both', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(control: any): { [key: string]: any } | null {
    const from = control.get('fromDate')?.value;
    const to = control.get('toDate')?.value;
    if (!from || !to) return null;
    if (new Date(from) > new Date(to)) {
      return { invalidDateRange: true };
    }
    return null;
  }

  onGenerate() {
    this.submitted = true;
    this.loadError = '';
    if (this.groupForm.invalid) return;

    const { groupName, groupStatus, fromDate, toDate } = this.groupForm.value;
    this.isLoading = true;
    this.reportService.groupWiseSuccessfulBidders({
      groupName,
      groupStatus,
      fromDate,
      toDate
    }).subscribe({
      next: (rows) => {
        this.bidders.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.bidders.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load successful bidders list.';
        this.isLoading = false;
      }
    });
  }
}
