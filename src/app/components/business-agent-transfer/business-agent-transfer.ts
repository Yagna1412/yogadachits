import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Agent { id: string; name: string; }

@Component({
  selector: 'app-business-agent-transfer',
  imports: [CommonModule, FormsModule],
  templateUrl: './business-agent-transfer.html',
  styleUrl: './business-agent-transfer.scss'
})
export class BusinessAgentTransferComponent {
  agents: Agent[] = [
    { id: 'AG001', name: 'Ravi Kumar' },
    { id: 'AG002', name: 'Meera N' },
    { id: 'AG003', name: 'Suresh R' }
  ];

  members: string[] = ['Member A', 'Member B', 'Member C'];
  routes: string[] = ['Route 1', 'Route 2', 'Route 3'];
  groups: string[] = ['Group X', 'Group Y', 'Group Z'];

  fromAgent: string = '';
  toAgent: string = '';
  selectedMembers: string[] = [];
  selectedRoutes: string[] = [];
  selectedGroups: string[] = [];

  transfers: Array<{
    fromAgent: string;
    toAgent: string;
    members: string[];
    routes: string[];
    groups: string[];
  }> = [
    { fromAgent: 'AG001', toAgent: 'AG002', members: ['Member A'], routes: ['Route 1'], groups: ['Group X'] }
  ];

  showForm: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.showForm) {
      this.fromAgent = '';
      this.toAgent = '';
      this.selectedMembers = [];
      this.selectedRoutes = [];
      this.selectedGroups = [];
    }
  }

  toggleSelection(field: 'members'|'routes'|'groups', value: string, event: any): void {
    let arr: string[];
    if (field === 'members') {
      arr = this.selectedMembers;
    } else if (field === 'routes') {
      arr = this.selectedRoutes;
    } else {
      arr = this.selectedGroups;
    }

    if (event.target.checked) {
      arr.push(value);
    } else {
      const idx = arr.indexOf(value);
      if (idx > -1) arr.splice(idx, 1);
    }
  }

  saveTransfer(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.fromAgent || !this.toAgent) {
      this.errorMessage = 'Please select both agents';
      return;
    }
    if (this.fromAgent === this.toAgent) {
      this.errorMessage = 'Cannot transfer to the same agent';
      return;
    }

    this.transfers.unshift({
      fromAgent: this.fromAgent,
      toAgent: this.toAgent,
      members: [...this.selectedMembers],
      routes: [...this.selectedRoutes],
      groups: [...this.selectedGroups]
    });

    this.successMessage = 'Transfer completed';
    // keep form open or reset fields
    this.fromAgent = '';
    this.toAgent = '';
    this.selectedMembers = [];
    this.selectedRoutes = [];
    this.selectedGroups = [];
  }

  agentName(id: string): string {
    const a = this.agents.find(x => x.id === id);
    return a ? a.name : id;
  }
}
