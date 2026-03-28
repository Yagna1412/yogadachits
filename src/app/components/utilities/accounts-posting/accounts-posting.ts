import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-accounts-posting',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './accounts-posting.html',
  styleUrls: ['./accounts-posting.scss']
})
export class AccountsPostingComponent {
  accountsForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.accountsForm = this.fb.group({
      postingType: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.accountsForm.valid) {
      // Mock posting logic
      alert('Accounts posted successfully');
      this.accountsForm.reset();
      this.submitted = false;
    }
  }

  onCancel() {
    this.accountsForm.reset();
    this.submitted = false;
  }
}