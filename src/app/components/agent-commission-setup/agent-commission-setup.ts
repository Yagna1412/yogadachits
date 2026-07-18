import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentCommissionSetupService } from '../../service/agent-commission-setup.service';

@Component({
  selector: 'app-agent-commission-setup',
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-commission-setup.html',
  styleUrls: ['./agent-commission-setup.scss']
})
export class AgentCommissionSetupComponent implements OnInit {
  showForm = false;
  searchTerm = '';
  isLoading = false;
  isSaving = false;
  loadError = '';

  commissionSetups: any[] = [];
  filteredSetups: any[] = [];
  newSetup: any = {};

  constructor(private agentCommissionSetupService: AgentCommissionSetupService) {}

  ngOnInit(): void {
    this.loadSetups();
  }

  loadSetups(): void {
    this.isLoading = true;
    this.loadError = '';
    this.agentCommissionSetupService.getAllSetups().subscribe({
      next: (rows) => {
        this.commissionSetups = rows || [];
        this.filterSetups();
        this.isLoading = false;
      },
      error: (err) => {
        this.commissionSetups = [];
        this.filteredSetups = [];
        this.loadError = err?.error?.message || 'Unable to load commission setups.';
        this.isLoading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  filterSetups() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredSetups = this.commissionSetups.filter((s) => {
      return (
        !q ||
        (s.agent && s.agent.toLowerCase().includes(q)) ||
        (s.commissionType && s.commissionType.toLowerCase().includes(q))
      );
    });
  }

  saveSetup() {
    if (!this.newSetup.agent) {
      alert('Agent required');
      return;
    }
    ['tdsPct', 'gstPct', 'part1Pct', 'part1InstallmentNo', 'part2Pct', 'part2InstallmentNo'].forEach((f) => {
      if (this.newSetup[f] !== undefined) {
        this.newSetup[f] = parseFloat(this.newSetup[f]) || 0;
      }
    });

    this.isSaving = true;
    this.agentCommissionSetupService.createSetup({ ...this.newSetup }).subscribe({
      next: () => {
        this.isSaving = false;
        this.newSetup = {};
        this.showForm = false;
        this.loadSetups();
        alert('Commission setup updated');
      },
      error: (err) => {
        this.isSaving = false;
        alert(err?.error?.message || 'Unable to save commission setup.');
      }
    });
  }
}
