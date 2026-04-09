import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-re-adjust-credit-installments',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './re-adjust-credit-installments.html',
  styleUrls: ['./re-adjust-credit-installments.scss']
})
export class ReAdjustCreditInstallmentsComponent {
  adjustForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.adjustForm = this.fb.group({
      groupName: ['', Validators.required],
      ticketNo: ['', Validators.required]
    });
  }

  get f() {
    return this.adjustForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.adjustForm.invalid) {
      return;
    }

    // Mock adjustment logic
    alert('Installment adjusted successfully for Group: ' + this.adjustForm.value.groupName + ', Ticket: ' + this.adjustForm.value.ticketNo);

    // Reset form
    this.submitted = false;
    this.adjustForm.reset();
  }

  onCancel() {
    this.adjustForm.reset();
    this.submitted = false;
  }
}
