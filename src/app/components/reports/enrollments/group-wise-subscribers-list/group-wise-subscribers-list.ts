import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-group-wise-subscribers-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './group-wise-subscribers-list.html',
  styleUrls: ['./group-wise-subscribers-list.scss']
})
export class GroupWiseSubscribersListComponent {
  subscribersForm: FormGroup;
  showAddress = signal(false);
  showCancellationDetails = signal(false);
  showResults = signal(false);
  subscribers = signal<any[]>([]);

  constructor(private fb: FormBuilder) {
    this.subscribersForm = this.fb.group({
      groupName: ['', [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      groupStatus: this.fb.group({
        running: [false],
        closed: [false],
        both: [true]
      }, { validators: this.atLeastOneGroupStatus }),
      includeCancelMembers: [false],
      includeAddress: [false],
      format: ['PDF']
    });
  }

  // Custom validator to ensure at least one group status is selected
  atLeastOneGroupStatus(control: AbstractControl): { [key: string]: any } | null {
    const group = control as FormGroup;
    const running = group.get('running')?.value;
    const closed = group.get('closed')?.value;
    const both = group.get('both')?.value;

    if (!running && !closed && !both) {
      return { atLeastOneRequired: true };
    }
    return null;
  }

  onSubmit() {
    if (this.subscribersForm.valid) {
      this.generateReport();
    } else {
      this.markFormGroupTouched();
    }
  }

  private generateReport() {
    const formValue = this.subscribersForm.value;

    // Update display flags
    this.showAddress.set(formValue.includeAddress);
    this.showCancellationDetails.set(formValue.includeCancelMembers);

    // Mock data generation based on form values
    const mockSubscribers = this.generateMockSubscribers(formValue);
    this.subscribers.set(mockSubscribers);
    this.showResults.set(true);
  }

  private generateMockSubscribers(formValue: any): any[] {
    const subscribers = [];
    const count = Math.floor(Math.random() * 20) + 5; // 5-25 subscribers

    const groupStatuses = [];
    if (formValue.groupStatus.running) groupStatuses.push('Running');
    if (formValue.groupStatus.closed) groupStatuses.push('Closed');
    if (formValue.groupStatus.both) groupStatuses.push('Running', 'Closed');

    for (let i = 1; i <= count; i++) {
      const subscriber: any = {
        subscriberId: `SUB${String(i).padStart(3, '0')}`,
        subscriberName: this.generateRandomName(),
        groupCode: formValue.groupName || 'GRP001',
        groupName: formValue.groupName || 'Sample Group',
        groupStatus: groupStatuses[Math.floor(Math.random() * groupStatuses.length)],
        enrollmentDate: this.generateRandomDate(formValue.fromDate, formValue.toDate),
        subscriptionAmount: Math.floor(Math.random() * 50000) + 10000,
        totalPaid: Math.floor(Math.random() * 30000) + 5000,
        outstandingAmount: 0,
        status: Math.random() > 0.1 ? 'Active' : 'Cancelled'
      };

      subscriber.outstandingAmount = subscriber.subscriptionAmount - subscriber.totalPaid;

      if (formValue.includeAddress) {
        subscriber.address = this.generateRandomAddress();
      }

      if (formValue.includeCancelMembers && subscriber.status === 'Cancelled') {
        subscriber.cancellationDate = this.generateRandomDate(formValue.fromDate, formValue.toDate);
        subscriber.cancellationReason = 'Voluntary Cancellation';
      }

      subscribers.push(subscriber);
    }

    return subscribers;
  }

  private generateRandomName(): string {
    const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vijay', 'Meera', 'Suresh', 'Kavita', 'Ravi', 'Anita'];
    const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Jain', 'Agarwal', 'Reddy', 'Nair'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  private generateRandomDate(fromDate: string, toDate: string): string {
    if (!fromDate || !toDate) {
      const today = new Date();
      const randomDays = Math.floor(Math.random() * 365);
      const date = new Date(today.getTime() - randomDays * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const randomTime = from.getTime() + Math.random() * (to.getTime() - from.getTime());
    const date = new Date(randomTime);
    return date.toISOString().split('T')[0];
  }

  private generateRandomAddress(): string {
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur'];
    const streets = ['MG Road', 'Park Street', 'Ring Road', 'Mall Road', 'Station Road', 'Market Road'];
    return `${Math.floor(Math.random() * 999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`;
  }

  onClear() {
    this.subscribersForm.reset({
      groupStatus: {
        running: false,
        closed: false,
        both: true
      },
      includeCancelMembers: false,
      includeAddress: false,
      format: 'PDF'
    });
    this.showResults.set(false);
    this.subscribers.set([]);
  }

  private markFormGroupTouched() {
    Object.keys(this.subscribersForm.controls).forEach(key => {
      const control = this.subscribersForm.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markNestedGroupTouched(control);
        }
      }
    });
  }

  private markNestedGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markNestedGroupTouched(control);
        }
      }
    });
  }

  get groupStatusForm(): FormGroup {
    return this.subscribersForm.get('groupStatus') as FormGroup;
  }

  exportReport() {
    // Mock export functionality
    const data = this.subscribers();
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'group-wise-subscribers-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  hasCancelledSubscribers(): boolean {
    return this.subscribers().some((s: any) => s.status === 'Cancelled');
  }
}