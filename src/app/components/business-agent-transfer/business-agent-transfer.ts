import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  AgentTransferService,
  AgentTransferDropdownOption,
  AgentTransfer,
} from '../../service/agent-transfer.service';

@Component({
  selector: 'app-business-agent-transfer',
  imports: [CommonModule, FormsModule],
  templateUrl: './business-agent-transfer.html',
  styleUrl: './business-agent-transfer.scss'
})
export class BusinessAgentTransferComponent implements OnInit {
  agents: AgentTransferDropdownOption[] = [];
  members: AgentTransferDropdownOption[] = [];
  routes: string[] = [];
  groups: AgentTransferDropdownOption[] = [];

  transfers: AgentTransfer[] = [];

  showForm: boolean = false;
  searchTerm: string = '';

  fromAgentId: number | null = null;
  toAgentId: number | null = null;
  selectedMemberId: number | null = null;
  selectedRoute: string | null = null;
  selectedGroupId: number | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private agentTransferService: AgentTransferService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTransfers();
    this.loadFormData();
  }

  loadTransfers(): void {
    this.agentTransferService.getAllTransfers(this.searchTerm).subscribe({
      next: (data) => {
        this.transfers = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching agent transfers:', err),
    });
  }

  loadFormData(): void {
    forkJoin({
      agents: this.agentTransferService.getAgents(),
      members: this.agentTransferService.getMembers(),
      routes: this.agentTransferService.getRoutes(),
      groups: this.agentTransferService.getGroups(),
    }).subscribe({
      next: ({ agents, members, routes, groups }) => {
        this.agents = agents;
        this.members = members;
        this.routes = routes;
        this.groups = groups;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading form data:', err);
        this.cdr.detectChanges();
      },
    });
  }

  filterTransfers(): void {
    this.loadTransfers();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.fromAgentId = null;
    this.toAgentId = null;
    this.selectedMemberId = null;
    this.selectedRoute = null;
    this.selectedGroupId = null;
  }

  saveTransfer(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.fromAgentId || !this.toAgentId) {
      this.errorMessage = 'Please select both agents';
      return;
    }
    if (this.fromAgentId === this.toAgentId) {
      this.errorMessage = 'Cannot transfer to the same agent';
      return;
    }
    if (!this.selectedMemberId && !this.selectedRoute && !this.selectedGroupId) {
      this.errorMessage = 'Select at least one member, route, or group to transfer';
      return;
    }

    this.agentTransferService
      .createTransfer({
        fromAgentId: this.fromAgentId,
        toAgentId: this.toAgentId,
        memberIds: this.selectedMemberId ? [this.selectedMemberId] : [],
        routes: this.selectedRoute ? [this.selectedRoute] : [],
        groupIds: this.selectedGroupId ? [this.selectedGroupId] : [],
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Transfer completed';
          this.resetForm();
          this.loadTransfers();
          this.cdr.detectChanges();
          setTimeout(() => {
            this.successMessage = '';
            this.showForm = false;
            this.cdr.detectChanges();
          }, 2000);
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message || 'Failed to save transfer. Please check the backend is running.';
          this.cdr.detectChanges();
        },
      });
  }
}
