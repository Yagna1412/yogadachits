import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.scss',
})
export class UserLayout {
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  
  // Submenu states
  dashboardMenuExpanded = true;
  chitsMenuExpanded = false;
  bidsMenuExpanded = false;
  footerSettingsExpanded = false;
  searchQuery = '';
  searchResults: any[] = [];

  constructor(private router: Router) {}

  onSearch() {
    if (this.searchQuery.length > 2) {
      // Mock search results
      const allResults = [
        { title: 'Gold Chit 50L', type: 'Chit Group', link: '/user/chits' },
        { title: 'Payment Receipt #RCP-0341', type: 'Payment', link: '/user/dashboard' },
        { title: 'Bids History', type: 'Bids', link: '/user/bids-history' },
        { title: 'Online Bidding', type: 'Live Auction', link: '/user/online-bids' },
        { title: 'Support Help Desk', type: 'Help', link: '/user/support' }
      ];
      
      this.searchResults = allResults.filter(r => 
        r.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.searchResults = [];
    }
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  toggleDashboardMenu() {
    this.dashboardMenuExpanded = !this.dashboardMenuExpanded;
  }


  toggleChitsMenu() {
    this.chitsMenuExpanded = !this.chitsMenuExpanded;
  }

  toggleBidsMenu() {
    this.bidsMenuExpanded = !this.bidsMenuExpanded;
  }


  toggleFooterSettings() {
    this.footerSettingsExpanded = !this.footerSettingsExpanded;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
