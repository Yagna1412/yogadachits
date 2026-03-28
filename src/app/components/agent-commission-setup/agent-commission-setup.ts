import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-commission-setup',
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-commission-setup.html',
  styleUrls: ['./agent-commission-setup.scss']
})
export class AgentCommissionSetupComponent {
  showForm = false;
  searchTerm = '';

  commissionSetups: any[] = [
    { id:1, agent:'Agent A', commissionType:'Collection', tdsPct:5, gstPct:18, part1Pct:2, part1InstallmentNo:1, part2Pct:1, part2InstallmentNo:2 },
    { id:2, agent:'Agent B', commissionType:'Business', tdsPct:5, gstPct:18, part1Pct:3, part1InstallmentNo:1, part2Pct:2, part2InstallmentNo:2 },
    { id:3, agent:'Agent C', commissionType:'Collection', tdsPct:5, gstPct:18, part1Pct:2.5, part1InstallmentNo:1, part2Pct:1.5, part2InstallmentNo:3 },
    { id:4, agent:'Agent D', commissionType:'Business', tdsPct:5, gstPct:18, part1Pct:3.5, part1InstallmentNo:1, part2Pct:2.5, part2InstallmentNo:2 }
  ];

  filteredSetups: any[] = [...this.commissionSetups];
  newSetup: any = {};

  toggleForm() { this.showForm = !this.showForm; }

  filterSetups() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredSetups = this.commissionSetups.filter(s => {
      return (!q ||
        (s.agent && s.agent.toLowerCase().includes(q)) ||
        (s.commissionType && s.commissionType.toLowerCase().includes(q))
      );
    });
  }

  saveSetup() {
    if (!this.newSetup.agent) { alert('Agent required'); return; }
    ['tdsPct', 'gstPct', 'part1Pct', 'part1InstallmentNo', 'part2Pct', 'part2InstallmentNo'].forEach(f => {
      if (this.newSetup[f] !== undefined) this.newSetup[f] = parseFloat(this.newSetup[f]) || 0;
    });
    const entry = { ...this.newSetup, id: Date.now() };
    this.commissionSetups.push(entry);
    this.newSetup = {};
    this.showForm = false;
    this.filterSetups();
    alert('Commission setup updated');
  }
}
