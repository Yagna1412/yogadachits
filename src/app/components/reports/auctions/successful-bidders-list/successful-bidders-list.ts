import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  constructor(private fb: FormBuilder) {
    this.biddersForm = this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.biddersForm.invalid) return;
    // Mocked data
    this.bidders.set([
      {
        order: 1,
        month: this.biddersForm.value.month,
        year: this.biddersForm.value.year,
        chitGroup: 'Group Alpha',
        bidder: 'John Doe',
        amount: 100000
      },
      {
        order: 2,
        month: this.biddersForm.value.month,
        year: this.biddersForm.value.year,
        chitGroup: 'Group Beta',
        bidder: 'Jane Smith',
        amount: 95000
      }
    ]);
    this.showResults.set(true);
  }
}
