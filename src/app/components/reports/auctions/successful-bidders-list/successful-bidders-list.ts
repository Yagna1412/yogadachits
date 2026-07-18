import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';

@Component({
  selector: 'app-successful-bidders-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './successful-bidders-list.html',
  styleUrls: ['./successful-bidders-list.scss']
})
export class SuccessfulBiddersListComponent {
  biddersForm: FormGroup;
  bidders = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;
  isLoading = false;
  loadError = '';

  months = [...AuctionReportService.MONTHS];
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  constructor(
    private fb: FormBuilder,
    private reportService: AuctionReportService
  ) {
    this.biddersForm = this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    this.loadError = '';
    if (this.biddersForm.invalid) return;

    const { month, year } = this.biddersForm.value;
    this.isLoading = true;
    this.reportService.successfulBidders(
      this.reportService.monthToNumber(month),
      Number(year)
    ).subscribe({
      next: (rows) => {
        this.bidders.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.bidders.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load successful bidders.';
        this.isLoading = false;
      }
    });
  }
}
