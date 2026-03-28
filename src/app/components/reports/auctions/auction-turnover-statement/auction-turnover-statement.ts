import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  constructor(private fb: FormBuilder) {
    this.turnoverForm = this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.turnoverForm.invalid) return;
    // Mocked data
    this.turnovers.set([
      {
        order: 1,
        month: this.turnoverForm.value.month,
        year: this.turnoverForm.value.year,
        chitGroup: 'Group A',
        turnover: 150000
      },
      {
        order: 2,
        month: this.turnoverForm.value.month,
        year: this.turnoverForm.value.year,
        chitGroup: 'Group B',
        turnover: 120000
      }
    ]);
    this.showResults.set(true);
  }
}
