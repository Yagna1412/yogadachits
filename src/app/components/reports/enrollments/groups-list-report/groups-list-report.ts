import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-groups-list-report',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './groups-list-report.html',
  styleUrls: ['./groups-list-report.scss']
})
export class GroupsListReportComponent {
  reportForm: FormGroup;
  submitted = false;
  groups: any[] = [];
  showGroups = false;

  constructor(private fb: FormBuilder) {
    this.reportForm = this.fb.group({
      groupType: ['', Validators.required]
    });
  }

  get f() {
    return this.reportForm.controls;
  }

  onGenerate() {
    this.submitted = true;

    if (this.reportForm.invalid) {
      return;
    }

    // Mock data for groups
    this.groups = [
      { id: 1, name: 'Group A', type: this.reportForm.value.groupType, status: 'Active', members: 50, amount: 10000 },
      { id: 2, name: 'Group B', type: this.reportForm.value.groupType, status: 'Active', members: 30, amount: 5000 },
      { id: 3, name: 'Group C', type: this.reportForm.value.groupType, status: 'Closed', members: 40, amount: 8000 }
    ];

    this.showGroups = true;
  }

  onClear() {
    this.reportForm.reset();
    this.submitted = false;
    this.showGroups = false;
    this.groups = [];
  }
}
