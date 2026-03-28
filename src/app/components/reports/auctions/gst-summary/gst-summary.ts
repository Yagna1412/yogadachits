import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-gst-summary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gst-summary.html',
  styleUrls: ['./gst-summary.scss']
})
export class GstSummaryComponent {
  summaryForm: FormGroup;
  results = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  groups = ['Group A', 'Group B', 'Group C'];
  charges = ['Subscription', 'Penalty', 'Other'];

  constructor(private fb: FormBuilder) {
    this.summaryForm = this.fb.group({
      group: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      gstPercent: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
      charge: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(control: any): { [key: string]: any } | null {
    const from = control.get('fromDate')?.value;
    const to = control.get('toDate')?.value;
    if (!from || !to) return null;
    if (from > to) {
      return { invalidDateRange: true };
    }
    return null;
  }

  onGenerate() {
    this.submitted = true;
    if (this.summaryForm.invalid) return;
    // Mocked data for preview
    this.results.set([
      { group: this.summaryForm.value.group, charge: this.summaryForm.value.charge, gstPercent: this.summaryForm.value.gstPercent, fromDate: this.summaryForm.value.fromDate, toDate: this.summaryForm.value.toDate, totalCharges: 10000, gstCollected: 1800 },
      { group: this.summaryForm.value.group, charge: this.summaryForm.value.charge, gstPercent: this.summaryForm.value.gstPercent, fromDate: this.summaryForm.value.fromDate, toDate: this.summaryForm.value.toDate, totalCharges: 8000, gstCollected: 1440 }
    ]);
    this.showResults.set(true);
  }

  onPrint() {
    window.print();
  }
}
