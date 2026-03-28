import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  orders = ['Order 1', 'Order 2', 'Order 3'];
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years = [2024, 2025, 2026];

  constructor(private fb: FormBuilder) {
    this.dividendForm = this.fb.group({
      order: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.dividendForm.invalid) return;
    // Mocked data for preview
    this.results.set([
      { order: this.dividendForm.value.order, month: this.dividendForm.value.month, year: this.dividendForm.value.year, subscriber: 'John Doe', amount: 1200 },
      { order: this.dividendForm.value.order, month: this.dividendForm.value.month, year: this.dividendForm.value.year, subscriber: 'Jane Smith', amount: 950 }
    ]);
    this.showResults.set(true);
  }

  onPrint() {
    window.print();
  }
}
