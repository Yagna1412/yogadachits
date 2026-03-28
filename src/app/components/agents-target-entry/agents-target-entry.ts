import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Agent {
  id: string;
  name: string;
}

@Component({
  selector: 'app-agents-target-entry',
  imports: [CommonModule, FormsModule],
  templateUrl: './agents-target-entry.html',
  styleUrl: './agents-target-entry.scss'
})
export class AgentsTargetEntryComponent {
  agents: Agent[] = [
    { id: 'AG001', name: 'Ravi Kumar' },
    { id: 'AG002', name: 'Meera N' },
    { id: 'AG003', name: 'Suresh R' }
  ];

  selectedAgent: string = '';
  targetAmount: number | null = null;
  targetMonth: string = '';

  savedTargets: Array<{ agentId: string; amount: number; month: string }> = [
    { agentId: 'AG001', amount: 50000, month: '2026-03' },
    { agentId: 'AG002', amount: 75000, month: '2026-04' }
  ];
  showForm: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.showForm) {
      // reset fields when closing
      this.selectedAgent = '';
      this.targetAmount = null;
      this.targetMonth = '';
    }
  }

  saveTarget(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedAgent) {
      this.errorMessage = 'Please select an agent';
      return;
    }
    if (this.targetAmount === null || isNaN(Number(this.targetAmount))) {
      this.errorMessage = 'Target must be numeric';
      return;
    }
    if (!this.targetMonth) {
      this.errorMessage = 'Please select target month';
      return;
    }

    this.savedTargets.unshift({
      agentId: this.selectedAgent,
      amount: Number(this.targetAmount),
      month: this.targetMonth
    });

    this.successMessage = 'Agent target added';

    // reset inputs
    this.selectedAgent = '';
    this.targetAmount = null;
    this.targetMonth = '';
  }

  agentName(agentId: string): string {
    const a = this.agents.find(x => x.id === agentId);
    return a ? a.name : agentId;
  }
}
