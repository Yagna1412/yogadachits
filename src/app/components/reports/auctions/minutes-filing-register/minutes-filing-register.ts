import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      groupName: ['', Validators.required],
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
    if (this.registerForm.invalid) return;
    // Mocked data for preview
    this.results.set([
      { group: this.registerForm.value.groupName, noticeDate: this.registerForm.value.noticeDate, toDate: this.registerForm.value.toDate, minutesFiled: 5 },
      { group: this.registerForm.value.groupName, noticeDate: this.registerForm.value.noticeDate, toDate: this.registerForm.value.toDate, minutesFiled: 3 }
    ]);
    this.showResults.set(true);
  }

  onPrint() {
    window.print();
  }
}
