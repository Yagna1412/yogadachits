import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-wrong-accounts-posting',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './wrong-accounts-posting.html',
  styleUrls: ['./wrong-accounts-posting.scss']
})
export class WrongAccountsPostingComponent {
  searchForm: FormGroup;
  submitted = false;
  records: any[] = [];
  showRecords = false;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      postingType: ['', Validators.required],
      year: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });
  }

  get f() {
    return this.searchForm.controls;
  }

  onRetrieve() {
    this.submitted = true;

    if (this.searchForm.invalid) {
      return;
    }

    // Mock data for wrong postings
    this.records = [
      { id: 1, account: 'Account 1', amount: 1000, date: '2023-01-15', issue: 'Wrong debit' },
      { id: 2, account: 'Account 2', amount: 500, date: '2023-02-20', issue: 'Duplicate entry' },
      { id: 3, account: 'Account 3', amount: 750, date: '2023-03-10', issue: 'Incorrect amount' }
    ];

    this.showRecords = true;
  }

  onCancel() {
    this.searchForm.reset();
    this.submitted = false;
    this.showRecords = false;
    this.records = [];
  }
}