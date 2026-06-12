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
  // Dropdown / checkbox data (loaded from backend)
  agents: AgentTransferDropdownOption[] = [];
  members: AgentTransferDropdownOption[] = [];
  routes: string[] = [];
  groups: AgentTransferDropdownOption[] = [];

  // Table data (loaded from backend)
  transfers: AgentTransfer[] = [];

  showForm: boolean = false;
  searchTerm: string = '';

  // Form fields
  fromAgentId: number | null = null;
  toAgentId: number | null = null;
  selectedMemberIds: number[] = [];
  selectedRoutes: string[] = [];
  selectedGroupIds: number[] = [];

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

  /** Load Agents, Members, Routes, and Groups in one parallel call */
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
    this.selectedMemberIds = [];
    this.selectedRoutes = [];
    this.selectedGroupIds = [];
  }

  toggleMember(id: number, event: any): void {
    if (event.target.checked) {
      this.selectedMemberIds.push(id);
    } else {
      const idx = this.selectedMemberIds.indexOf(id);
      if (idx > -1) this.selectedMemberIds.splice(idx, 1);
    }
  }

  toggleRoute(route: string, event: any): void {
    if (event.target.checked) {
      this.selectedRoutes.push(route);
    } else {
      const idx = this.selectedRoutes.indexOf(route);
      if (idx > -1) this.selectedRoutes.splice(idx, 1);
    }
  }

  toggleGroup(id: number, event: any): void {
    if (event.target.checked) {
      this.selectedGroupIds.push(id);
    } else {
      const idx = this.selectedGroupIds.indexOf(id);
      if (idx > -1) this.selectedGroupIds.splice(idx, 1);
    }
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
    if (this.selectedMemberIds.length === 0 && this.selectedRoutes.length === 0 && this.selectedGroupIds.length === 0) {
      this.errorMessage = 'Select at least one member, route, or group to transfer';
      return;
    }

    this.agentTransferService
      .createTransfer({
        fromAgentId: this.fromAgentId,
        toAgentId: this.toAgentId,
        memberIds: [...this.selectedMemberIds],
        routes: [...this.selectedRoutes],
        groupIds: [...this.selectedGroupIds],
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
          // Surface backend message (e.g. same agent or nothing selected)
          this.errorMessage =
            err?.error?.message || 'Failed to save transfer. Please check the backend is running.';
          this.cdr.detectChanges();
        },
      });
  }
}
