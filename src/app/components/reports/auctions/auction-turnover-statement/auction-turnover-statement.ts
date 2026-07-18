import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';

@Component({
  selector: 'app-auction-turnover-statement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auction-turnover-statement.html',
  styleUrls: ['./auction-turnover-statement.scss']
})
export class AuctionTurnoverStatementComponent {
  turnoverForm: FormGroup;
  turnovers = signal<any[]>([]);
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
    this.turnoverForm = this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    this.loadError = '';
    if (this.turnoverForm.invalid) return;

    const { month, year } = this.turnoverForm.value;
    this.isLoading = true;
    this.reportService.turnoverStatement(
      this.reportService.monthToNumber(month),
      Number(year)
    ).subscribe({
      next: (rows) => {
        this.turnovers.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.turnovers.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load turnover statement.';
        this.isLoading = false;
      }
    });
  }
}
