import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-group-wise-successful-bidders-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './group-wise-successful-bidders-list.html',
  styleUrls: ['./group-wise-successful-bidders-list.scss']
})
export class GroupWiseSuccessfulBiddersListComponent {
  groupForm: FormGroup;
  bidders = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  groupStatuses = [
    { label: 'Running', value: 'Running' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Both', value: 'Both' }
  ];

  constructor(private fb: FormBuilder) {
    this.groupForm = this.fb.group({
      groupName: [''],
      groupStatus: ['Both', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(control: any): { [key: string]: any } | null {
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
    if (this.groupForm.invalid) return;
    // Mocked data
    this.bidders.set([
      {
        groupName: this.groupForm.value.groupName || 'Group 1',
        groupStatus: this.groupForm.value.groupStatus,
        fromDate: this.groupForm.value.fromDate,
        toDate: this.groupForm.value.toDate,
        bidder: 'John Doe',
        amount: 100000
      },
      {
        groupName: this.groupForm.value.groupName || 'Group 2',
        groupStatus: this.groupForm.value.groupStatus,
        fromDate: this.groupForm.value.fromDate,
        toDate: this.groupForm.value.toDate,
        bidder: 'Jane Smith',
        amount: 95000
      }
    ]);
    this.showResults.set(true);
  }
}
