import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';

@Component({
  selector: 'app-company-investment-own-chits',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-investment-own-chits.html',
  styleUrls: ['./company-investment-own-chits.scss']
})
export class CompanyInvestmentOwnChitsComponent {
  investmentForm: FormGroup;
  investments = signal<any[]>([]);
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
    this.investmentForm = this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    this.loadError = '';
    if (this.investmentForm.invalid) return;

    const { month, year } = this.investmentForm.value;
    this.isLoading = true;
    this.reportService.companyInvestment(
      this.reportService.monthToNumber(month),
      Number(year)
    ).subscribe({
      next: (rows) => {
        this.investments.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.investments.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load company investment report.';
        this.isLoading = false;
      }
    });
  }
}
