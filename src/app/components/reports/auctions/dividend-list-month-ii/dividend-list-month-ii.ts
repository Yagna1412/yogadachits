import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';

@Component({
  selector: 'app-dividend-list-month-ii',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dividend-list-month-ii.html',
  styleUrls: ['./dividend-list-month-ii.scss']
})
export class DividendListMonthIIComponent {
  dividendForm: FormGroup;
  dividends = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;
  isLoading = false;
  loadError = '';

  months = [...AuctionReportService.MONTHS];
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  reportOrders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  constructor(
    private fb: FormBuilder,
    private reportService: AuctionReportService
  ) {
    this.dividendForm = this.fb.group({
      reportOrder: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    this.loadError = '';
    if (this.dividendForm.invalid) return;

    const { reportOrder, month, year } = this.dividendForm.value;
    this.isLoading = true;
    this.reportService.dividendListMonth({
      reportOrder,
      month: this.reportService.monthToNumber(month),
      year: Number(year)
    }).subscribe({
      next: (rows) => {
        this.dividends.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.dividends.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load dividend list.';
        this.isLoading = false;
      }
    });
  }
}
