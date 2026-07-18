import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';
import { AuctionsService, ChitGroupDto } from '../../../../service/auction.service';

@Component({
  selector: 'app-gst-summary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gst-summary.html',
  styleUrls: ['./gst-summary.scss']
})
export class GstSummaryComponent implements OnInit {
  summaryForm: FormGroup;
  results = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;
  isLoading = false;
  loadError = '';
  chitGroups: ChitGroupDto[] = [];

  charges = ['Subscription', 'Penalty', 'Other'];

  constructor(
    private fb: FormBuilder,
    private reportService: AuctionReportService,
    private auctionsService: AuctionsService
  ) {
    this.summaryForm = this.fb.group({
      chitGroupId: [''],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      gstPercent: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
      charge: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    this.auctionsService.listChitGroups().subscribe({
      next: (res) => {
        this.chitGroups = res.data || [];
      }
    });
  }

  dateRangeValidator(control: any): { [key: string]: any } | null {
    const from = control.get('fromDate')?.value;
    const to = control.get('toDate')?.value;
    if (!from || !to) return null;
    if (from > to) {
      return { invalidDateRange: true };
    }
    return null;
  }

  onGenerate() {
    this.submitted = true;
    this.loadError = '';
    if (this.summaryForm.invalid) return;

    const { chitGroupId, fromDate, toDate, gstPercent, charge } = this.summaryForm.value;
    this.isLoading = true;
    this.reportService.gstSummary({
      chitGroupId: chitGroupId ? Number(chitGroupId) : null,
      fromDate,
      toDate,
      gstPercent,
      charge
    }).subscribe({
      next: (rows) => {
        this.results.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.results.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load GST summary.';
        this.isLoading = false;
      }
    });
  }

  onPrint() {
    window.print();
  }
}
