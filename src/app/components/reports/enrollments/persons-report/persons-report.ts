import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-persons-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './persons-report.html',
  styleUrls: ['./persons-report.scss']
})
export class PersonsReportComponent {
  personsForm: FormGroup;
  persons = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  personTypes = [
    { label: 'All', value: 'All' },
    { label: 'Member', value: 'Member' },
    { label: 'Business Agent', value: 'Business Agent' },
    { label: 'Guarantor', value: 'Guarantor' },
    { label: 'Collection Agent', value: 'Collection Agent' }
  ];

  constructor(private fb: FormBuilder) {
    this.personsForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      personType: ['All', [Validators.required]],
      address: ['']
    }, { validators: this.dateRangeValidator });
  }

  // Custom validator for date range
  dateRangeValidator(control: AbstractControl): { [key: string]: any } | null {
    const from = control.get('fromDate')?.value;
    const to = control.get('toDate')?.value;
    if (!from || !to) return null;
    if (new Date(from) > new Date(to)) {
      return { invalidDateRange: true };
    }
    return null;
  }

  onGenerate() {
    this.submitted = true;
    if (this.personsForm.invalid) return;
    // Fetch persons data based on filters (mocked for now)
    this.persons.set([
      {
        name: 'John Doe',
        type: this.personsForm.value.personType,
        address: this.personsForm.value.address || '123 Main St',
        fromDate: this.personsForm.value.fromDate,
        toDate: this.personsForm.value.toDate
      }
    ]);
    this.showResults.set(true);
  }
}
