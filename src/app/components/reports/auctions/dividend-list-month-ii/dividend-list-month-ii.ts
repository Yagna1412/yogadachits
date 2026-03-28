import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  reportOrders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  constructor(private fb: FormBuilder) {
    this.dividendForm = this.fb.group({
      reportOrder: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.dividendForm.invalid) return;
    // Mocked data
    this.dividends.set([
      {
        order: this.dividendForm.value.reportOrder,
        month: this.dividendForm.value.month,
        year: this.dividendForm.value.year,
        chitGroup: 'Group Z',
        dividend: 12000
      },
      {
        order: this.dividendForm.value.reportOrder,
        month: this.dividendForm.value.month,
        year: this.dividendForm.value.year,
        chitGroup: 'Group Y',
        dividend: 15000
      }
    ]);
    this.showResults.set(true);
  }
}
