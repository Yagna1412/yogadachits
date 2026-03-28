import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-persons-information-dashboards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './persons-information-dashboards.html',
  styleUrls: ['./persons-information-dashboards.scss']
})
export class PersonsInformationDashboardsComponent {
  // placeholder for any logic
  dashboardInfo = 'Analytics charts for member demographics would appear here.';
}
