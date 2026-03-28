import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-locations-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-locations-dashboard.html',
  styleUrls: ['./agent-locations-dashboard.scss']
})
export class AgentLocationsDashboardComponent {
  agents = ['Agent A', 'Agent B', 'Agent C'];
  selectedAgent = '';
  reportDate: string = '';
  showMap = false;

  view() {
    if (!this.selectedAgent) {
      alert('Agent selection required');
      return;
    }
    this.showMap = true;
  }

  reset() {
    this.selectedAgent = '';
    this.reportDate = '';
    this.showMap = false;
  }
}
