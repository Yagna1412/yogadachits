import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-surety-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './surety-list.html',
  styleUrls: ['./surety-list.scss']
})
export class SuretyListComponent {
  suretyForm: FormGroup;
  sureties = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.suretyForm = this.fb.group({
      reportDate: ['', [Validators.required]],
      reportFormat: ['PDF', [Validators.required]],
      groupName: [''],
      ticketNo: [''],
      subscriberName: [''],
      suretyType: ['All', [Validators.required]]
    }, { validators: this.financialYearValidator });
  }

  // Custom validator for financial year
  financialYearValidator(control: AbstractControl): { [key: string]: any } | null {
    const selectedDate = control.get('reportDate')?.value;
    if (!selectedDate) return null;

    const date = new Date(selectedDate);
    const currentYear = new Date().getFullYear();
    const financialYearStart = new Date(currentYear - 1, 3, 1); // April 1st of previous year
    const financialYearEnd = new Date(currentYear, 2, 31); // March 31st of current year

    if (date < financialYearStart || date > financialYearEnd) {
      return { invalidFinancialYear: true };
    }
    return null;
  }

  onGenerate() {
    this.submitted = true;
    if (this.suretyForm.invalid) return;
    // Fetch surety data based on filters (mocked for now)
    this.sureties.set([
      {
        reportDate: this.suretyForm.value.reportDate,
        groupName: this.suretyForm.value.groupName || 'Group A',
        ticketNo: this.suretyForm.value.ticketNo || 'T001',
        subscriberName: this.suretyForm.value.subscriberName || 'John Doe',
        suretyType: this.suretyForm.value.suretyType || 'Primary',
      }
    ]);
    this.showResults.set(true);
  }
}
