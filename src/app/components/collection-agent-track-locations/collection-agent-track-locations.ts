import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-collection-agent-track-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collection-agent-track-locations.html',
  styleUrls: ['./collection-agent-track-locations.scss']
})
export class CollectionAgentTrackLocationsComponent {
  agents = ['Agent A', 'Agent B', 'Agent C'];
  selectedAgent = '';
  reportDate: string = '';
  showTracking = false;

  view() {
    if (!this.selectedAgent) {
      alert('Agent selection required');
      return;
    }
    this.showTracking = true;
  }

  reset() {
    this.selectedAgent = '';
    this.reportDate = '';
    this.showTracking = false;
  }
}
