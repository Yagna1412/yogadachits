import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-gst-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gst-report.html',
  styleUrls: ['./gst-report.scss']
})
export class GstReportComponent {
  gstForm: FormGroup;
  results = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  orders = ['Order 1', 'Order 2', 'Order 3'];
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years = [2024, 2025, 2026];

  constructor(private fb: FormBuilder) {
    this.gstForm = this.fb.group({
      order: ['', Validators.required],
      month: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.gstForm.invalid) return;
    // Mocked data for preview
    this.results.set([
      { order: this.gstForm.value.order, month: this.gstForm.value.month, year: this.gstForm.value.year, subscriber: 'John Doe', chitAmount: 10000, gst: 1800, total: 11800 },
      { order: this.gstForm.value.order, month: this.gstForm.value.month, year: this.gstForm.value.year, subscriber: 'Jane Smith', chitAmount: 8000, gst: 1440, total: 9440 }
    ]);
    this.showResults.set(true);
  }

  onPrint() {
    window.print();
  }
}
