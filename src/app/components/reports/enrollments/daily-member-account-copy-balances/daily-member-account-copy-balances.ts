import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-daily-member-account-copy-balances',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './daily-member-account-copy-balances.html',
  styleUrls: ['./daily-member-account-copy-balances.scss']
})
export class DailyMemberAccountCopyBalancesComponent {
  dailyForm: FormGroup;
  balances = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.dailyForm = this.fb.group({
      reportDate: ['', [Validators.required]],
      reportFormat: ['PDF', [Validators.required]],
      groupName: [''],
      ticketNo: [''],
      subscriberName: ['']
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.dailyForm.invalid) return;
    // Fetch daily balances data based on filters (mocked for now)
    this.balances.set([
      {
        reportDate: this.dailyForm.value.reportDate,
        reportFormat: this.dailyForm.value.reportFormat,
        groupName: this.dailyForm.value.groupName || 'Group A',
        ticketNo: this.dailyForm.value.ticketNo || 'T001',
        subscriberName: this.dailyForm.value.subscriberName || 'John Doe',
        balance: 12345.67
      }
    ]);
    this.showResults.set(true);
  }
}
