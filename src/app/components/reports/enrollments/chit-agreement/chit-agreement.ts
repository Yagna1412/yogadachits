import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-chit-agreement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chit-agreement.html',
  styleUrls: ['./chit-agreement.scss']
})
export class ChitAgreementComponent {
  agreementForm: FormGroup;
  agreements = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.agreementForm = this.fb.group({
      reportDate: ['', [Validators.required]],
      groupName: ['', [Validators.required]],
      ticketNo: ['', [Validators.required]]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.agreementForm.invalid) return;
    // Mocked agreement data
    this.agreements.set([
      {
        reportDate: this.agreementForm.value.reportDate,
        groupName: this.agreementForm.value.groupName,
        ticketNo: this.agreementForm.value.ticketNo,
        subscriber: 'John Doe',
        terms: 'Sample chit agreement terms...'
      }
    ]);
    this.showResults.set(true);
  }
}
