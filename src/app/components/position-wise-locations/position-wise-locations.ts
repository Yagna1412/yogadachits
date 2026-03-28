import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-position-wise-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './position-wise-locations.html',
  styleUrls: ['./position-wise-locations.scss']
})
export class PositionWiseLocationsComponent {
  positions = ['Manager', 'Supervisor', 'Agent', 'Member'];
  selectedPosition = '';
  showMap = false;

  view() {
    if (!this.selectedPosition) {
      alert('Position selection required');
      return;
    }
    this.showMap = true;
  }

  reset() {
    this.selectedPosition = '';
    this.showMap = false;
  }
}
