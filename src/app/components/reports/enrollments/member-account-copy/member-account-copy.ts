import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-member-account-copy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member-account-copy.html',
  styleUrls: ['./member-account-copy.scss']
})
export class MemberAccountCopyComponent {
  accountForm: FormGroup;
  accounts = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      groupName: ['', [Validators.required]],
      ticketNo: ['', [Validators.required]],
      subscriberName: [''],
      allReceipts: [false],
      guarantor: [false],
      auctionParticulars: [false],
      dueInfo: [false],
      paymentPosition: [false],
      dfd: ['No'],
      reportDate: ['', [Validators.required]],
      reportFormat: ['PDF', [Validators.required]]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.accountForm.invalid) return;
    // Fetch account data based on filters (mocked for now)
    this.accounts.set([
      {
        groupName: this.accountForm.value.groupName,
        ticketNo: this.accountForm.value.ticketNo,
        subscriberName: this.accountForm.value.subscriberName || 'John Doe',
        allReceipts: this.accountForm.value.allReceipts,
        guarantor: this.accountForm.value.guarantor,
        auctionParticulars: this.accountForm.value.auctionParticulars,
        dueInfo: this.accountForm.value.dueInfo,
        paymentPosition: this.accountForm.value.paymentPosition,
        dfd: this.accountForm.value.dfd,
        reportDate: this.accountForm.value.reportDate,
        reportFormat: this.accountForm.value.reportFormat
      }
    ]);
    this.showResults.set(true);
  }
}
