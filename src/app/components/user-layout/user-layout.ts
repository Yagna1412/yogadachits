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
      const allResults = [
        { title: 'Dashboard', type: 'Dashboard', link: '/user/dashboard' },
        { title: 'Chit Calculator', type: 'Tool', link: '/user/chit-calculator' },
        { title: 'My Chits', type: 'Chits', link: '/user/chits' },
        { title: 'Bids History', type: 'Bids', link: '/user/bids-history' },
        { title: 'Online Bidding', type: 'Live Auction', link: '/user/online-bids' },
        { title: 'My Profile', type: 'User Settings', link: '/user/profile' },
        { title: 'Preferences', type: 'User Settings', link: '/user/preferences' },
        { title: 'Help & Support', type: 'Support', link: '/user/support' }
      ];
      
      this.searchResults = allResults.filter(r => 
        r.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.searchResults = [];
    }
  }

  hideSearch() {
    setTimeout(() => {
      this.searchResults = [];
    }, 200);
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
