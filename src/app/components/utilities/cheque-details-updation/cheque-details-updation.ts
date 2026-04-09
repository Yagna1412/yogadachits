import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cheque-details-updation',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cheque-details-updation.html',
  styleUrls: ['./cheque-details-updation.scss']
})
export class ChequeDetailsUpdationComponent {
  chequeForm: FormGroup;
  submitted = false;
  chequeDetails: any[] = [];
  showDetails = false;

  constructor(private fb: FormBuilder) {
    this.chequeForm = this.fb.group({
      chequeBookType: ['', Validators.required],
      chequeNumber: ['', Validators.required],
      series: [''],
      fromNumber: [''],
      toNumber: ['']
    });
  }

  get f() {
    return this.chequeForm.controls;
  }

  onView() {
    this.submitted = true;

    if (this.chequeForm.invalid) {
      return;
    }

    // Additional validation for range
    const fromNumber = this.chequeForm.value.fromNumber;
    const toNumber = this.chequeForm.value.toNumber;

    if (fromNumber && toNumber && parseInt(fromNumber) > parseInt(toNumber)) {
      alert('From Number cannot be greater than To Number');
      return;
    }

    // Mock data for cheque details
    this.chequeDetails = [
      { id: 1, chequeBookType: this.chequeForm.value.chequeBookType, chequeNumber: this.chequeForm.value.chequeNumber, series: this.chequeForm.value.series || 'N/A', status: 'Issued', date: '2023-01-15', amount: 1000 },
      { id: 2, chequeBookType: this.chequeForm.value.chequeBookType, chequeNumber: parseInt(this.chequeForm.value.chequeNumber) + 1, series: this.chequeForm.value.series || 'N/A', status: 'Pending', date: '2023-02-20', amount: 500 },
      { id: 3, chequeBookType: this.chequeForm.value.chequeBookType, chequeNumber: parseInt(this.chequeForm.value.chequeNumber) + 2, series: this.chequeForm.value.series || 'N/A', status: 'Cleared', date: '2023-03-10', amount: 750 }
    ];

    this.showDetails = true;
  }

  onClear() {
    this.chequeForm.reset();
    this.submitted = false;
    this.showDetails = false;
    this.chequeDetails = [];
  }
}
