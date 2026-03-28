import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-bids-register-for-month',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bids-register-for-month.html',
  styleUrls: ['./bids-register-for-month.scss']
})
export class BidsRegisterForMonthComponent {
  bidsForm: FormGroup;
  bids = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  reportOrders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  constructor(private fb: FormBuilder) {
    this.bidsForm = this.fb.group({
      reportOrder: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.bidsForm.invalid) return;
    // Mocked data
    this.bids.set([
      {
        order: this.bidsForm.value.reportOrder,
        month: this.bidsForm.value.month,
        year: this.bidsForm.value.year,
        chitGroup: 'Group A',
        bidAmount: 100000,
        bidder: 'John Doe'
      },
      {
        order: this.bidsForm.value.reportOrder,
        month: this.bidsForm.value.month,
        year: this.bidsForm.value.year,
        chitGroup: 'Group B',
        bidAmount: 95000,
        bidder: 'Jane Smith'
      }
    ]);
    this.showResults.set(true);
  }
}
