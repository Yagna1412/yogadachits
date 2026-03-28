import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-gst-balance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gst-balance.html',
  styleUrls: ['./gst-balance.scss']
})
export class GstBalanceComponent {
  balanceForm: FormGroup;
  results = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  groups = ['Group A', 'Group B', 'Group C'];

  constructor(private fb: FormBuilder) {
    this.balanceForm = this.fb.group({
      group: ['', Validators.required],
      reportDate: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.balanceForm.invalid) return;
    // Mocked data for preview
    this.results.set([
      { group: this.balanceForm.value.group, reportDate: this.balanceForm.value.reportDate, gstPayable: 2500, gstAdjusted: 1200, gstBalance: 1300 }
    ]);
    this.showResults.set(true);
  }

  onPrint() {
    window.print();
  }
}
