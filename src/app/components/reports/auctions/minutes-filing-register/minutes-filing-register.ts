import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';

@Component({
  selector: 'app-minutes-filing-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './minutes-filing-register.html',
  styleUrls: ['./minutes-filing-register.scss']
})
export class MinutesFilingRegisterComponent {
  registerForm: FormGroup;
  results = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;
  isLoading = false;
  loadError = '';

  constructor(
    private fb: FormBuilder,
    private reportService: AuctionReportService
  ) {
    this.registerForm = this.fb.group({
      groupName: [''],
      noticeDate: ['', Validators.required],
      toDate: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(control: any): { [key: string]: any } | null {
    const from = control.get('noticeDate')?.value;
    const to = control.get('toDate')?.value;
    if (!from || !to) return null;
    if (from > to) {
      return { invalidDateRange: true };
    }
    return null;
  }

  onPreview() {
    this.submitted = true;
    this.loadError = '';
    if (this.registerForm.invalid) return;

    const { groupName, noticeDate, toDate } = this.registerForm.value;
    this.isLoading = true;
    this.reportService.minutesFilingRegister({
      groupName,
      fromDate: noticeDate,
      toDate
    }).subscribe({
      next: (rows) => {
        this.results.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.results.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load minutes filing register.';
        this.isLoading = false;
      }
    });
  }

  onPrint() {
    window.print();
  }
}
