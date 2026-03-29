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
  searchResults: any[] = [];

  constructor(private router: Router) {}

  onSearch() {
    if (this.searchQuery.length > 2) {
      const allResults = [
        { title: 'Dashboard', type: 'Platform', link: '/admin/dashboard' },
        { title: 'Member Registration', type: 'Master > Members', link: '/admin/members' },
        { title: 'Chit Group', type: 'Master > Members', link: '/admin/chit-groups' },
        { title: 'Suit File Info', type: 'Master > Members', link: '/admin/suit-file' },
        { title: 'Enrollments', type: 'Master > Members', link: '/admin/enrollments' },
        { title: 'Self Chits Entry', type: 'Master > Members', link: '/admin/self-chits-entry' },
        { title: 'Agents Target Entry', type: 'Master > Members', link: '/admin/agents-target-entry' },
        { title: 'Business Agent Transfer', type: 'Master > Members', link: '/admin/business-agent-transfer' },
        { title: 'Account Group Entry', type: 'Master > Accounts', link: '/admin/account-group-entry' },
        { title: 'Ledger Accounts', type: 'Master > Accounts', link: '/admin/ledger-account-entry' },
        { title: 'Location', type: 'Master > Places', link: '/admin/location' },
        { title: 'Company Setup', type: 'Master > Settings', link: '/admin/company-setup' },
        { title: 'Roles Entry', type: 'Security', link: '/admin/roles-entry' },
        { title: 'Role Permissions List', type: 'Security', link: '/admin/role-permissions-list' },
        { title: 'Users List', type: 'Security', link: '/admin/users-list' },
        { title: 'Group Consolidation Report', type: 'Consolidation', link: '/admin/group-wise-consolidation-report' },
        { title: 'Group Outstanding Compare Report', type: 'Consolidation', link: '/admin/group-wise-outstanding-compare-report' },
        { title: 'Bid Payable As On Date', type: 'Consolidation', link: '/admin/bid-payable-os-report' },
        { title: 'Person Enquiry', type: 'Enquiry', link: '/admin/person-enquiry' },
        { title: 'Receipt Enquiry', type: 'Enquiry', link: '/admin/receipt-enquiry' },
        { title: 'Group Enquiry', type: 'Enquiry', link: '/admin/group-enquiry' },
        { title: 'Penalty Calculation', type: 'Enquiry', link: '/admin/penalty-calculation' },
        { title: 'Home Dashboards', type: 'Enquiry > MIS', link: '/admin/home-dashboards' },
        { title: 'Persons Information Dashboards', type: 'Enquiry > MIS', link: '/admin/persons-information-dashboards' },
        { title: 'Agent Locations Dashboard', type: 'Enquiry > MIS', link: '/admin/agent-locations-dashboard' },
        { title: 'Tracking Locations', type: 'Enquiry > MIS', link: '/admin/collection-agent-track-locations' },
        { title: 'Outstanding Locations', type: 'Enquiry > MIS', link: '/admin/outstanding-locations' },
        { title: 'Auctions', type: 'Transactions', link: '/admin/auctions' },
        { title: 'Member Receipts', type: 'Transactions', link: '/admin/member-receipts' },
        { title: 'Cheque Management', type: 'Transactions', link: '/admin/check-management' },
        { title: 'Re-Auction', type: 'Transactions', link: '/admin/re-auction' },
        { title: 'Receipts', type: 'Transactions', link: '/admin/receipts' },
        { title: 'Bid Payments', type: 'Transactions > Payments', link: '/admin/bid-payments' },
        { title: 'Bid Advance', type: 'Transactions > Payments', link: '/admin/bid-advance' },
        { title: 'Agent Commission Setup', type: 'Transactions > Agents', link: '/admin/agent-commission-setup' },
        { title: 'Agent Commission Payment', type: 'Transactions > Agents', link: '/admin/agent-commission-payment' },
        { title: 'Suit Filed Receipt', type: 'Transactions & Legal', link: '/admin/suit-filed-receipt' },
        { title: 'Company Setup Utilities', type: 'Utilities', link: '/admin/company-setup-utilities' },
        { title: 'SMS Options', type: 'Utilities', link: '/admin/sms-options' },
        { title: 'Accounts Posting', type: 'Utilities', link: '/admin/accounts-posting' },
        { title: 'Audit Trail', type: 'Utilities', link: '/admin/audit-trail' },
        { title: 'Groups List Report', type: 'Reports', link: '/admin/groups-list-report' },
        { title: 'Business Statement', type: 'Reports', link: '/admin/business-statement' },
        { title: 'Surety List', type: 'Reports', link: '/admin/surety-list' },
        { title: 'Persons Report', type: 'Reports', link: '/admin/persons-report' },
        { title: 'Auction Chart', type: 'Reports', link: '/admin/auction-chart' },
        { title: 'Auction Turnover Statement', type: 'Reports', link: '/admin/auction-turnover-statement' },
        { title: 'GST Report', type: 'Reports', link: '/admin/gst-report' },
        { title: 'Settings', type: 'System', link: '/admin/settings' },
        { title: 'Profile', type: 'User Settings', link: '/admin/profile' },
        { title: 'Preferences', type: 'User Settings', link: '/admin/preferences' }
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
