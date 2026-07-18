import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';

@Component({
  selector: 'app-dividend-list-for-month',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dividend-list-for-month.html',
  styleUrls: ['./dividend-list-for-month.scss']
})
export class DividendListForMonthComponent {
  dividendForm: FormGroup;
  results = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;
  isLoading = false;
  loadError = '';

  orders = ['Order 1', 'Order 2', 'Order 3'];
  months = [...AuctionReportService.MONTHS];
  years = [2024, 2025, 2026];

  constructor(
    private fb: FormBuilder,
    private reportService: AuctionReportService
  ) {
    this.dividendForm = this.fb.group({
      order: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    this.loadError = '';
    if (this.dividendForm.invalid) return;

    const { order, month, year } = this.dividendForm.value;
    this.isLoading = true;
    this.reportService.dividendListForMonth({
      order,
      month: this.reportService.monthToNumber(month),
      year: Number(year)
    }).subscribe({
      next: (rows) => {
        this.results.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.results.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load dividend list.';
        this.isLoading = false;
      }
    });
  }

  onPrint() {
    window.print();
  }
}
