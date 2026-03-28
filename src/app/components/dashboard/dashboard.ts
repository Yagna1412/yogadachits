import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  sidebarCollapsed = false;

  recentActivities = [
    {
      title: 'New member joined Group A',
      time: '5 minutes ago',
      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Payment received for Group B',
      time: '12 minutes ago',
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      title: 'New chit group created',
      time: '1 hour ago',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      title: 'Report generated successfully',
      time: '2 hours ago',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    {
      title: 'Member profile updated',
      time: '3 hours ago',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
    }
  ];

  chitGroups = [
    { name: 'Gold Group A', members: 25, amount: '5,00,000', status: 'Active', statusClass: 'status-active', nextDraw: 'Feb 15, 2026' },
    { name: 'Silver Group B', members: 20, amount: '3,00,000', status: 'Active', statusClass: 'status-active', nextDraw: 'Feb 18, 2026' },
    { name: 'Platinum Group C', members: 30, amount: '10,00,000', status: 'Active', statusClass: 'status-active', nextDraw: 'Feb 20, 2026' },
    { name: 'Diamond Group D', members: 15, amount: '2,00,000', status: 'Pending', statusClass: 'status-pending', nextDraw: 'Feb 25, 2026' },
    { name: 'Emerald Group E', members: 28, amount: '7,50,000', status: 'Active', statusClass: 'status-active', nextDraw: 'Feb 28, 2026' }
  ];

  constructor(private router: Router) {}

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
