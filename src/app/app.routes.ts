import { GstBalanceComponent } from './components/reports/auctions/gst-balance/gst-balance';
import { GstReportComponent } from './components/reports/auctions/gst-report/gst-report';
import { DividendListForMonthComponent } from './components/reports/auctions/dividend-list-for-month/dividend-list-for-month';
import { MinutesFilingRegisterComponent } from './components/reports/auctions/minutes-filing-register/minutes-filing-register';
import { BidsRegisterForMonthComponent } from './components/reports/auctions/bids-register-for-month/bids-register-for-month';
import { IntimationCardComponent } from './components/reports/auctions/intimation-card/intimation-card';
import { AuctionChartComponent } from './components/reports/auctions/auction-chart/auction-chart';
import { GroupWiseSuccessfulBiddersListComponent } from './components/reports/auctions/group-wise-successful-bidders-list/group-wise-successful-bidders-list';
import { DividendListMonthIIComponent } from './components/reports/auctions/dividend-list-month-ii/dividend-list-month-ii';
import { SuccessfulBiddersListComponent } from './components/reports/auctions/successful-bidders-list/successful-bidders-list';
import { CompanyInvestmentOwnChitsComponent } from './components/reports/auctions/company-investment-own-chits/company-investment-own-chits';
import { AuctionTurnoverStatementComponent } from './components/reports/auctions/auction-turnover-statement/auction-turnover-statement';
import { GstSummaryComponent } from './components/reports/auctions/gst-summary/gst-summary';
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { MembersComponent } from './components/members/members';
import { AgentsTargetEntryComponent } from './components/agents-target-entry/agents-target-entry';
import { AdminLayout } from './components/admin-layout/admin-layout';
import { ChitGroupsComponent } from './components/chit-groups/chit-groups';
import { SuitFileInfoComponent } from './components/suit-file/suit-file';
import { MemberReceiptsComponent } from './components/member-receipts/member-receipts';
import { AuctionsComponent } from './components/auctions/auctions';
import { CheckManagementComponent } from './components/check-management/check-management';
import { ReAuctionComponent } from './components/re-auction/re-auction';
import { CompanySetupComponent } from './components/company-setup/company-setup';
import { CompanySetupUtilitiesComponent } from './components/utilities/company-setup-utilities/company-setup-utilities';
import { SmsOptionsComponent } from './components/utilities/sms-option/sms-options';
import { ReportSmsOptionsComponent } from './components/utilities/report-sms-options/report-sms-options';
import { CompanySetupInformationComponent } from './components/utilities/company-setup-information/company-setup-information';
import { AccountsPostingComponent } from './components/utilities/accounts-posting/accounts-posting';
import { ReAdjustCreditInstallmentsComponent } from './components/utilities/re-adjust-credit-installments/re-adjust-credit-installments';
import { WrongAccountsPostingComponent } from './components/utilities/wrong-accounts-posting/wrong-accounts-posting';
import { AuditTrailComponent } from './components/utilities/audit-trail/audit-trail';
import { ChequeDetailsUpdationComponent } from './components/utilities/cheque-details-updation/cheque-details-updation';
import { RepeatedPersonsComponent } from './components/utilities/repeated-persons/repeated-persons';
import { MailSetupComponent } from './components/utilities/mail-setup/mail-setup';
import { CommunicationSetupInformationComponent } from './components/utilities/communication-setup-information/communication-setup-information';
import { GroupsListReportComponent } from './components/reports/enrollments/groups-list-report/groups-list-report';
import { GroupWiseSubscribersListComponent } from './components/reports/enrollments/group-wise-subscribers-list/group-wise-subscribers-list';
import { BusinessStatementComponent } from './components/reports/enrollments/business-statement/business-statement';
import { CompanyInvestmentOnVacantChitsComponent } from './components/reports/enrollments/company-investment-on-vacant-chits/company-investment-on-vacant-chits';
import { SuretyListComponent } from './components/reports/enrollments/surety-list/surety-list';
import { PersonsReportComponent } from './components/reports/enrollments/persons-report/persons-report';
import { MemberAccountCopyComponent } from './components/reports/enrollments/member-account-copy/member-account-copy';
import { DailyMemberAccountCopyBalancesComponent } from './components/reports/enrollments/daily-member-account-copy-balances/daily-member-account-copy-balances';
import { AgentsTargetReportComponent } from './components/reports/enrollments/agents-target-report/agents-target-report';
import { ChitAgreementComponent } from './components/reports/enrollments/chit-agreement/chit-agreement';
import { MemberAccountCopyCrDrComponent } from './components/reports/enrollments/member-account-copy-crdr/member-account-copy-crdr';
import { TransactionVouchersComponent } from './components/utilities/transaction-vouchers/transaction-vouchers';
import { SettingsComponent } from './components/settings/settings';
import { LocationComponent } from './components/location/location';
import { EnrollmentsComponent } from './components/enrollments/enrollments';
import { SelfChitsEntryComponent } from './components/self-chits-entry/self-chits-entry';
import { AccountGroupEntryComponent } from './components/account-group-entry/account-group-entry';
import { LedgerAccountEntryComponent } from './components/ledger-account-entry/ledger-account-entry';
import { BusinessAgentTransferComponent } from './components/business-agent-transfer/business-agent-transfer';
import { ReceiptsComponent } from './components/receipts/receipts';
import { MemberManagementComponent } from './components/member-management/member-management';
import { CreditorsDebtorsClosingComponent } from './components/creditors-debtors-closing/creditors-debtors-closing';
import { SuretyEntryComponent } from './components/surety-entry/surety-entry';
import { PaymentsRemovalMembersComponent } from './components/payments-removal-members/payments-removal-members';
import { BidPaymentsComponent } from './components/bid-payments/bid-payments';
import { BidAdvanceComponent } from './components/bid-advance/bid-advance';
import { CreditBalanceReturnComponent } from './components/credit-balance-return/credit-balance-return';
import { AgentCommissionPaymentComponent } from './components/agent-commission-payment/agent-commission-payment';
import { AgentCommissionSetupComponent } from './components/agent-commission-setup/agent-commission-setup';
import { AccountCashComponent } from './components/account-cash/account-cash';
import { AccountBankComponent } from './components/account-bank/account-bank';
import { AccountJournalVoucherComponent } from './components/account-journal-voucher/account-journal-voucher';
import { SuitFiledReceiptComponent } from './components/suit-filed-receipt/suit-filed-receipt';
import { RolesEntryComponent } from './components/roles-entry/roles-entry';
import { RolePermissionsListComponent } from './components/role-permissions-list/role-permissions-list';
import { UsersListComponent } from './components/users-list/users-list';
import { PersonEnquiryComponent } from './components/person-enquiry/person-enquiry';
import { ReceiptEnquiryComponent } from './components/receipt-enquiry/receipt-enquiry';
import { GroupEnquiryComponent } from './components/group-enquiry/group-enquiry';
import { PenaltyCalculationComponent } from './components/penalty-calculation/penalty-calculation';
import { HomeDashboardsComponent } from './components/home-dashboards/home-dashboards';
import { PersonsInformationDashboardsComponent } from './components/persons-information-dashboards/persons-information-dashboards';
import { AgentLocationsDashboardComponent } from './components/agent-locations-dashboard/agent-locations-dashboard';
import { CollectionAgentTrackLocationsComponent } from './components/collection-agent-track-locations/collection-agent-track-locations';
import { PositionWiseLocationsComponent } from './components/position-wise-locations/position-wise-locations';
import { OutstandingLocationsComponent } from './components/outstanding-locations/outstanding-locations';
import { GroupWiseConsolidationReportComponent } from './components/group-wise-consolidation-report/group-wise-consolidation-report';
import { BidPayableOsReportComponent } from './components/bid-payable-os-report/bid-payable-os-report';
import { AuditLogComponent } from './components/audit-log/audit-log';
import { AuctionWiseOutstandingAccountsCompareReportComponent } from './components/auction-wise-outstanding-accounts-compare-report/auction-wise-outstanding-accounts-compare-report';
import { AccountsOutstandingCompareReportComponent } from './components/accounts-outstanding-compare-report/accounts-outstanding-compare-report';
import { GroupWiseOutstandingAccountsCompareReportComponent } from './components/group-wise-outstanding-accounts-compare-report/group-wise-outstanding-accounts-compare-report';

// User Dashboard Imports
import { UserLayout } from './components/user-layout/user-layout';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard';
import { UserChitsComponent } from './components/user-chits/user-chits';
import { UserBidsHistoryComponent } from './components/user-bids-history/user-bids-history';
import { UserOnlineBidsComponent } from './components/user-online-bids/user-online-bids';
import { UserProfileComponent } from './components/user-profile/user-profile';
import { UserChitCalculatorComponent } from './components/user-chit-calculator/user-chit-calculator';
import { UserSupportComponent } from './components/user-support/user-support';

// Exporting routing definitions
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'members', component: MembersComponent },
      { path: 'agents-target-entry', component: AgentsTargetEntryComponent },
      { path: 'chit-groups', component: ChitGroupsComponent },
      { path: 'suit-file', component: SuitFileInfoComponent },
      { path: 'member-receipts', component: MemberReceiptsComponent },
      { path: 'auctions', component: AuctionsComponent },
      { path: 're-auction', component: ReAuctionComponent },
      { path: 'check-management', component: CheckManagementComponent },
      { path: 'company-setup', component: CompanySetupComponent },
      { path: 'company-setup-utilities', component: CompanySetupUtilitiesComponent },
      { path: 'company-setup-information', component: CompanySetupInformationComponent },
      { path: 'accounts-posting', component: AccountsPostingComponent },
      { path: 're-adjust-credit-installments', component: ReAdjustCreditInstallmentsComponent },
      { path: 'wrong-accounts-posting', component: WrongAccountsPostingComponent },
      { path: 'audit-trail', component: AuditTrailComponent },
      { path: 'cheque-details-updation', component: ChequeDetailsUpdationComponent },
      { path: 'repeated-persons', component: RepeatedPersonsComponent },
      { path: 'mail-setup', component: MailSetupComponent },
      { path: 'communication-setup-information', component: CommunicationSetupInformationComponent },
      { path: 'groups-list-report', component: GroupsListReportComponent },
      { path: 'group-wise-subscribers-list', component: GroupWiseSubscribersListComponent },
      { path: 'business-statement', component: BusinessStatementComponent },
      { path: 'company-investment-on-vacant-chits', component: CompanyInvestmentOnVacantChitsComponent },
      { path: 'surety-list', component: SuretyListComponent },
      { path: 'persons-report', component: PersonsReportComponent },
      { path: 'member-account-copy', component: MemberAccountCopyComponent },
      { path: 'daily-member-account-copy-balances', component: DailyMemberAccountCopyBalancesComponent },
      { path: 'transaction-vouchers', component: TransactionVouchersComponent },
      { path: 'sms-options', component: SmsOptionsComponent },
      { path: 'report-sms-options', component: ReportSmsOptionsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'location', component: LocationComponent },
      { path: 'enrollments', component: EnrollmentsComponent },
      { path: 'self-chits-entry', component: SelfChitsEntryComponent },
      { path: 'business-agent-transfer', component: BusinessAgentTransferComponent },
      { path: 'account-group-entry', component: AccountGroupEntryComponent },
      { path: 'ledger-account-entry', component: LedgerAccountEntryComponent },
      { path: 'receipts', component: ReceiptsComponent },
      { path: 'member-management', component: MemberManagementComponent },
      { path: 'bid-payments', component: BidPaymentsComponent },
      { path: 'bid-advance', component: BidAdvanceComponent },
      { path: 'credit-balance-return', component: CreditBalanceReturnComponent },
      { path: 'agent-commission-payment', component: AgentCommissionPaymentComponent },
      { path: 'agent-commission-setup', component: AgentCommissionSetupComponent },
      { path: 'account-cash', component: AccountCashComponent },
      { path: 'account-bank', component: AccountBankComponent },
      { path: 'account-journal-voucher', component: AccountJournalVoucherComponent },
      { path: 'suit-filed-receipt', component: SuitFiledReceiptComponent },
      { path: 'roles-entry', component: RolesEntryComponent },
      { path: 'role-permissions-list', component: RolePermissionsListComponent },
      { path: 'users-list', component: UsersListComponent },
      { path: 'person-enquiry', component: PersonEnquiryComponent },
      { path: 'receipt-enquiry', component: ReceiptEnquiryComponent },
      { path: 'group-enquiry', component: GroupEnquiryComponent },
      { path: 'penalty-calculation', component: PenaltyCalculationComponent },
      { path: 'home-dashboards', component: HomeDashboardsComponent },
      { path: 'persons-information-dashboards', component: PersonsInformationDashboardsComponent },
      { path: 'agent-locations-dashboard', component: AgentLocationsDashboardComponent },
      { path: 'collection-agent-track-locations', component: CollectionAgentTrackLocationsComponent },
      { path: 'position-wise-locations', component: PositionWiseLocationsComponent },
      { path: 'outstanding-locations', component: OutstandingLocationsComponent },
      { path: 'group-wise-consolidation-report', component: GroupWiseConsolidationReportComponent },
      { path: 'group-wise-outstanding-compare-report', component: GroupWiseOutstandingAccountsCompareReportComponent },
      { path: 'auction-wise-outstanding-compare-report', component: AuctionWiseOutstandingAccountsCompareReportComponent },
      { path: 'accounts-outstanding-compare-report', component: AccountsOutstandingCompareReportComponent },
      { path: 'bid-payable-os-report', component: BidPayableOsReportComponent },
      { path: 'agents-target-report', component: AgentsTargetReportComponent },
      { path: 'chit-agreement', component: ChitAgreementComponent },
      { path: 'member-account-copy-crdr', component: MemberAccountCopyCrDrComponent },
      { path: 'auction-turnover-statement', component: AuctionTurnoverStatementComponent },
      { path: 'company-investment-own-chits', component: CompanyInvestmentOwnChitsComponent },
      { path: 'successful-bidders-list', component: SuccessfulBiddersListComponent },
      { path: 'dividend-list-month-ii', component: DividendListMonthIIComponent },
      { path: 'dividend-list-for-month', component: DividendListForMonthComponent },
      { path: 'group-wise-successful-bidders-list', component: GroupWiseSuccessfulBiddersListComponent },
      { path: 'auction-chart', component: AuctionChartComponent },
      { path: 'bids-register-for-month', component: BidsRegisterForMonthComponent },
      { path: 'minutes-filing-register', component: MinutesFilingRegisterComponent },
      { path: 'intimation-card', component: IntimationCardComponent },
      { path: 'gst-report', component: GstReportComponent },
      { path: 'gst-balance', component: GstBalanceComponent },
      { path: 'gst-summary', component: GstSummaryComponent },
      { path: 'audit-log', component: AuditLogComponent },
      { path: 'surety-entry', component: SuretyEntryComponent },
      { path: 'payments-removal-members', component: PaymentsRemovalMembersComponent },
      { path: 'creditors-debtors-closing', component: CreditorsDebtorsClosingComponent },
    ],
  },
  {
    path: 'user',
    component: UserLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'chits', component: UserChitsComponent },
      { path: 'bids-history', component: UserBidsHistoryComponent },
      { path: 'online-bids', component: UserOnlineBidsComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'chit-calculator', component: UserChitCalculatorComponent },
      { path: 'support', component: UserSupportComponent },
    ],
  },
  // Backward compatibility redirects
  { path: 'dashboard', redirectTo: '/admin/dashboard', pathMatch: 'full' },
  { path: 'members', redirectTo: '/admin/members', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
