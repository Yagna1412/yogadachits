import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AgentTargetService,
  AgentTargetDropdownOption,
  AgentTargetEntry,
} from '../../service/agent-target.service';

@Component({
  selector: 'app-agents-target-entry',
  imports: [CommonModule, FormsModule],
  templateUrl: './agents-target-entry.html',
  styleUrl: './agents-target-entry.scss'
})
export class AgentsTargetEntryComponent implements OnInit {
  // Dropdown data (loaded from backend)
  agents: AgentTargetDropdownOption[] = [];

  // Table data (loaded from backend)
  savedTargets: AgentTargetEntry[] = [];

  showForm: boolean = false;
  searchTerm: string = '';

  // Form fields
  selectedAgentId: number | null = null;
  targetAmount: number | null = null;
  targetMonth: string = '';

  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private agentTargetService: AgentTargetService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTargets();
    this.loadAgents();
  }

  loadTargets(): void {
    this.agentTargetService.getAllTargets(this.searchTerm).subscribe({
      next: (data) => {
        this.savedTargets = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching agent targets:', err),
    });
  }

  loadAgents(): void {
    this.agentTargetService.getAgents().subscribe({
      next: (data) => {
        this.agents = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching agents:', err),
    });
  }

  filterTargets(): void {
    this.loadTargets();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.showForm) {
      // reset fields when closing
      this.selectedAgentId = null;
      this.targetAmount = null;
      this.targetMonth = '';
    }
  }

  saveTarget(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedAgentId) {
      this.errorMessage = 'Please select an agent';
      return;
    }
    if (this.targetAmount === null || isNaN(Number(this.targetAmount)) || Number(this.targetAmount) <= 0) {
      this.errorMessage = 'Target must be a positive number';
      return;
    }
    if (!this.targetMonth) {
      this.errorMessage = 'Please select target month';
      return;
    }

    this.agentTargetService
      .createTarget({
        agentId: this.selectedAgentId,
        targetAmount: Number(this.targetAmount),
        targetMonth: this.targetMonth,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Agent target added';
          // reset inputs
          this.selectedAgentId = null;
          this.targetAmount = null;
          this.targetMonth = '';
          this.loadTargets();
          this.cdr.detectChanges();
          setTimeout(() => {
            this.successMessage = '';
            this.showForm = false;
            this.cdr.detectChanges();
          }, 2000);
        },
        error: (err) => {
          // Surface backend message (e.g. duplicate target for the same agent and month)
          this.errorMessage =
            err?.error?.message || 'Failed to save target. Please check the backend is running.';
          this.cdr.detectChanges();
        },
      });
  }
}
