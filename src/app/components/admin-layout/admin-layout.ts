import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  masterMenuExpanded = false;
  transactionsMenuExpanded = false;  consolidationMenuExpanded = false;  misSubmenuExpanded = false;  accountsSubmenuExpanded = false;
  agentsSubmenuExpanded = false;
  accountsSectionExpanded = false;
  placesSectionExpanded = false;
  paymentsSubmenuExpanded = false;
  accountsTransactionSubmenuExpanded = false;
  securityMenuExpanded = false;
  enquiryMenuExpanded = false;
  setupSubmenuExpanded = false;
  utilitiesMenuExpanded = false;
  footerSettingsExpanded = false;
  reportsMenuExpanded = false;
  enrollmentsSubmenuExpanded = false;
  searchQuery = '';

  auctionSubmenuExpanded = false;

  constructor(private router: Router) {}

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  toggleAuctionSubmenu() {
    this.auctionSubmenuExpanded = !this.auctionSubmenuExpanded;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  toggleMasterMenu() {
    this.masterMenuExpanded = !this.masterMenuExpanded;
    // Close other menus when opening this one
    if (this.masterMenuExpanded) {
      this.transactionsMenuExpanded = false;
    }
  }

  toggleTransactionsMenu() {
    this.transactionsMenuExpanded = !this.transactionsMenuExpanded;
    // Close other menus when opening this one
    if (this.transactionsMenuExpanded) {
      this.masterMenuExpanded = false;
    }
  }

  togglePaymentsSubmenu() {
    this.paymentsSubmenuExpanded = !this.paymentsSubmenuExpanded;
  }

  toggleAccountsTransactionSubmenu() {
    this.accountsTransactionSubmenuExpanded = !this.accountsTransactionSubmenuExpanded;
  }

  toggleSecurityMenu() {
    this.securityMenuExpanded = !this.securityMenuExpanded;
  }

  toggleEnquiryMenu() {
    this.enquiryMenuExpanded = !this.enquiryMenuExpanded;
  }

  toggleConsolidationMenu() {
    this.consolidationMenuExpanded = !this.consolidationMenuExpanded;
  }

  toggleUtilitiesMenu() {
    this.utilitiesMenuExpanded = !this.utilitiesMenuExpanded;
  }

  toggleMisSubmenu() {
    this.misSubmenuExpanded = !this.misSubmenuExpanded;
  }

  toggleAccountsSubmenu() {
    this.accountsSubmenuExpanded = !this.accountsSubmenuExpanded;
  }

  toggleAgentsSubmenu() {
    this.agentsSubmenuExpanded = !this.agentsSubmenuExpanded;
  }

  toggleAccountsSection() {
    this.accountsSectionExpanded = !this.accountsSectionExpanded;
  }

  togglePlacesSection() {
    this.placesSectionExpanded = !this.placesSectionExpanded;
  }

  toggleSetupSubmenu() {
    this.setupSubmenuExpanded = !this.setupSubmenuExpanded;
  }

  toggleFooterSettings() {
    this.footerSettingsExpanded = !this.footerSettingsExpanded;
  }

  toggleReportsMenu() {
    this.reportsMenuExpanded = !this.reportsMenuExpanded;
  }

  toggleEnrollmentsSubmenu() {
    this.enrollmentsSubmenuExpanded = !this.enrollmentsSubmenuExpanded;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
