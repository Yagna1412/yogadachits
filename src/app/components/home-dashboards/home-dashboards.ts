import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-dashboards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-dashboards.html',
  styleUrls: ['./home-dashboards.scss']
})
export class HomeDashboardsComponent {
  dashboardTypes = ['Auction Turnover', 'Collections', 'Outstanding', 'Profit & Loss'];
  selectedType = '';

  get showContent() {
    return !!this.selectedType;
  }
}
