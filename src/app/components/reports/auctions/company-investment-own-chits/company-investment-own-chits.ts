import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  constructor(private fb: FormBuilder) {
    this.investmentForm = this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.investmentForm.invalid) return;
    // Mocked data
    this.investments.set([
      {
        order: 1,
        month: this.investmentForm.value.month,
        year: this.investmentForm.value.year,
        chitGroup: 'Group X',
        investment: 50000
      },
      {
        order: 2,
        month: this.investmentForm.value.month,
        year: this.investmentForm.value.year,
        chitGroup: 'Group Y',
        investment: 75000
      }
    ]);
    this.showResults.set(true);
  }
}
