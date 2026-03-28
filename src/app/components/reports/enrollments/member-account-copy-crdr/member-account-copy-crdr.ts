import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-member-account-copy-crdr',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member-account-copy-crdr.html',
  styleUrls: ['./member-account-copy-crdr.scss']
})
export class MemberAccountCopyCrDrComponent {
  crdrForm: FormGroup;
  accounts = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.crdrForm = this.fb.group({
      groupName: ['', [Validators.required]],
      ticketNo: [''],
      subscriberName: [''],
      allReceipts: [false],
      reportDate: ['', [Validators.required]]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.crdrForm.invalid) return;
    // Mocked account data
    this.accounts.set([
      {
        groupName: this.crdrForm.value.groupName,
        ticketNo: this.crdrForm.value.ticketNo,
        subscriberName: this.crdrForm.value.subscriberName,
        allReceipts: this.crdrForm.value.allReceipts,
        reportDate: this.crdrForm.value.reportDate,
        credit: 5000,
        debit: 3000,
        balance: 2000
      }
    ]);
    this.showResults.set(true);
  }
}
