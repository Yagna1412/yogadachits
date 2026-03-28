import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-outstanding-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './outstanding-locations.html',
  styleUrls: ['./outstanding-locations.scss']
})
export class OutstandingLocationsComponent {
  filterDate: string = '';
  regionFilter = '';
  groupFilter = '';
  showMap = false;

  regions = ['North', 'South', 'East', 'West'];
  groups = ['Group A', 'Group B', 'Group C'];

  view() {
    this.showMap = true;
  }

  reset() {
    this.filterDate = '';
    this.regionFilter = '';
    this.groupFilter = '';
    this.showMap = false;
  }
}
