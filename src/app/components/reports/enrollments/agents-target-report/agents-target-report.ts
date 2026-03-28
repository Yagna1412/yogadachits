import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-agents-target-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agents-target-report.html',
  styleUrls: ['./agents-target-report.scss']
})
export class AgentsTargetReportComponent {
  targetForm: FormGroup;
  agents = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  agentTypes = [
    { label: 'All', value: 'All' },
    { label: 'Collection Agent', value: 'Collection Agent' },
    { label: 'Business Agent', value: 'Business Agent' }
  ];

  constructor(private fb: FormBuilder) {
    this.targetForm = this.fb.group({
      agentType: ['All', [Validators.required]],
      agentName: [''],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]]
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
    if (this.targetForm.invalid) return;
    // Mocked agent data
    this.agents.set([
      {
        agentType: this.targetForm.value.agentType,
        agentName: this.targetForm.value.agentName || 'Agent 1',
        fromDate: this.targetForm.value.fromDate,
        toDate: this.targetForm.value.toDate,
        target: 100000,
        achieved: 95000
      }
    ]);
    this.showResults.set(true);
  }
}
