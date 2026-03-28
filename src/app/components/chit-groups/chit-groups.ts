import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChitGroup {
  id: string;
  name: string;
  chitAmount: number;
  chitSeries: string;
  auctionType: string;
  noOfInstallments: number;
  psoDate: string;
  psoNumber: string;
  commencementDate: string;
  termDate: string;
  caNumber: string;
  caDate: string;
  enrollmentFee: number;
  companyChitNumber: string;
  noOfAuctionInstallments: number;
  companyCommission: number;
  maxCeiling: number;
  penaltyNps: number;
  penaltyPs: number;
  auctionsPerMonth: number;
  installmentAmount: number;
  auctionDate: string;
  auctionDay: string;
  auctionTimeFrom: string;
  auctionTimeTo: string;
  dividendMonth: string;
  sendSms: boolean;
  fdrNumber: string;
  fdrType: string;
  fdrAmount: number;
  fdrDate: string;
  numberOfMonths: number;
  maturityDate: string;
  roiPerYear: number;
  fdrMaturityAmount: number;
  bankNameBranch: string;
  tenure: number;
  monthlyAmount: number;
  commission: number;
  currentMembers: number;
  maxMembers: number;
  auctionSchedule: string;
  auctionTime: string;
  startDate: string;
  status: 'Active' | 'Upcoming' | 'Completed' | 'Inactive';
}

@Component({
  selector: 'app-chit-groups',
  imports: [CommonModule, FormsModule],
  templateUrl: './chit-groups.html',
  styleUrl: './chit-groups.scss',
})
export class ChitGroupsComponent {
  showAddGroupForm = false;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  statusFilter = '';

  newGroup: Partial<ChitGroup> = {
    name: '',
    chitAmount: 0,
    chitSeries: '',
    auctionType: '',
    noOfInstallments: 0,
    psoDate: '',
    psoNumber: '',
    commencementDate: '',
    termDate: '',
    caNumber: '',
    caDate: '',
    enrollmentFee: 0,
    companyChitNumber: '',
    noOfAuctionInstallments: 0,
    companyCommission: 0,
    maxCeiling: 0,
    penaltyNps: 0,
    penaltyPs: 0,
    auctionsPerMonth: 0,
    installmentAmount: 0,
    auctionDate: '',
    auctionDay: '',
    auctionTimeFrom: '',
    auctionTimeTo: '',
    dividendMonth: '',
    sendSms: false,
    fdrNumber: '',
    fdrType: '',
    fdrAmount: 0,
    fdrDate: '',
    numberOfMonths: 0,
    maturityDate: '',
    roiPerYear: 0,
    fdrMaturityAmount: 0,
    bankNameBranch: '',
    tenure: 0,
    maxMembers: 0,
    commission: 0,
    auctionTime: '',
    startDate: '',
    status: undefined,
  } as Partial<ChitGroup>;

  chitGroups: ChitGroup[] = [
    {
      id: '123456',
      name: 'Golden Circle 2024',
      chitAmount: 500000,
      chitSeries: '',
      auctionType: '',
      noOfInstallments: 0,
      psoDate: '',
      psoNumber: '',
      commencementDate: '',
      termDate: '',
      caNumber: '',
      caDate: '',
      enrollmentFee: 0,
      companyChitNumber: '',
      noOfAuctionInstallments: 0,
      companyCommission: 0,
      maxCeiling: 0,
      penaltyNps: 0,
      penaltyPs: 0,
      auctionsPerMonth: 0,
      installmentAmount: 0,
      auctionDate: '',
      auctionDay: 'Sunday',
      auctionTimeFrom: '',
      auctionTimeTo: '',
      dividendMonth: '',
      sendSms: false,
      fdrNumber: '',
      fdrType: '',
      fdrAmount: 0,
      fdrDate: '',
      numberOfMonths: 0,
      maturityDate: '',
      roiPerYear: 0,
      fdrMaturityAmount: 0,
      bankNameBranch: '',
      tenure: 20,
      monthlyAmount: 25000,
      commission: 4,
      currentMembers: 20,
      maxMembers: 20,
      auctionSchedule: '1st Sunday',
      auctionTime: '10:00',
      startDate: '2024-01-01',
      status: 'Active',
    },
    {
      id: '456789',
      name: 'Diamond ELite',
      chitAmount: 2500000,
      chitSeries: '',
      auctionType: '',
      noOfInstallments: 0,
      psoDate: '',
      psoNumber: '',
      commencementDate: '',
      termDate: '',
      caNumber: '',
      caDate: '',
      enrollmentFee: 0,
      companyChitNumber: '',
      noOfAuctionInstallments: 0,
      companyCommission: 0,
      maxCeiling: 0,
      penaltyNps: 0,
      penaltyPs: 0,
      auctionsPerMonth: 0,
      installmentAmount: 0,
      auctionDate: '',
      auctionDay: 'Sunday',
      auctionTimeFrom: '',
      auctionTimeTo: '',
      dividendMonth: '',
      sendSms: false,
      fdrNumber: '',
      fdrType: '',
      fdrAmount: 0,
      fdrDate: '',
      numberOfMonths: 0,
      maturityDate: '',
      roiPerYear: 0,
      fdrMaturityAmount: 0,
      bankNameBranch: '',
      tenure: 20,
      monthlyAmount: 125000,
      commission: 4,
      currentMembers: 20,
      maxMembers: 20,
      auctionSchedule: '1st Sunday',
      auctionTime: '11:00',
      startDate: '2024-01-01',
      status: 'Active',
    },
    {
      id: '789012',
      name: 'Silver Star 50',
      chitAmount: 100000,
      chitSeries: '',
      auctionType: '',
      noOfInstallments: 0,
      psoDate: '',
      psoNumber: '',
      commencementDate: '',
      termDate: '',
      caNumber: '',
      caDate: '',
      enrollmentFee: 0,
      companyChitNumber: '',
      noOfAuctionInstallments: 0,
      companyCommission: 0,
      maxCeiling: 0,
      penaltyNps: 0,
      penaltyPs: 0,
      auctionsPerMonth: 0,
      installmentAmount: 0,
      auctionDate: '',
      auctionDay: 'Saturday',
      auctionTimeFrom: '',
      auctionTimeTo: '',
      dividendMonth: '',
      sendSms: false,
      fdrNumber: '',
      fdrType: '',
      fdrAmount: 0,
      fdrDate: '',
      numberOfMonths: 0,
      maturityDate: '',
      roiPerYear: 0,
      fdrMaturityAmount: 0,
      bankNameBranch: '',
      tenure: 10,
      monthlyAmount: 10000,
      commission: 4,
      currentMembers: 15,
      maxMembers: 20,
      auctionSchedule: '2nd Saturday',
      auctionTime: '14:00',
      startDate: '2024-02-01',
      status: 'Active',
    },
    {
      id: '345678',
      name: 'Premium Plus 2025',
      chitAmount: 1000000,
      chitSeries: '',
      auctionType: '',
      noOfInstallments: 0,
      psoDate: '',
      psoNumber: '',
      commencementDate: '',
      termDate: '',
      caNumber: '',
      caDate: '',
      enrollmentFee: 0,
      companyChitNumber: '',
      noOfAuctionInstallments: 0,
      companyCommission: 0,
      maxCeiling: 0,
      penaltyNps: 0,
      penaltyPs: 0,
      auctionsPerMonth: 0,
      installmentAmount: 0,
      auctionDate: '',
      auctionDay: 'Sunday',
      auctionTimeFrom: '',
      auctionTimeTo: '',
      dividendMonth: '',
      sendSms: false,
      fdrNumber: '',
      fdrType: '',
      fdrAmount: 0,
      fdrDate: '',
      numberOfMonths: 0,
      maturityDate: '',
      roiPerYear: 0,
      fdrMaturityAmount: 0,
      bankNameBranch: '',
      tenure: 25,
      monthlyAmount: 40000,
      commission: 5,
      currentMembers: 18,
      maxMembers: 25,
      auctionSchedule: 'Last Sunday',
      auctionTime: '15:00',
      startDate: '2025-01-01',
      status: 'Upcoming',
    },
  ];

  get filteredGroups(): ChitGroup[] {
    let filtered = this.chitGroups;

    if (this.searchTerm) {
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          group.id.includes(this.searchTerm),
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter((group) => group.status === this.statusFilter);
    }

    return filtered;
  }

  validationErrors: { [key: string]: boolean } = {};

  toggleAddGroupForm(): void {
    this.showAddGroupForm = !this.showAddGroupForm;
    if (!this.showAddGroupForm) {
      this.resetForm();
    }
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  createGroup(): void {
    if (this.isFormValid()) {
      const monthlyAmount =
        this.newGroup.installmentAmount ||
        Math.round((this.newGroup.chitAmount ?? 0) / (this.newGroup.tenure ?? 1));

      const newChitGroup: ChitGroup = {
        id: this.generateId(),
        monthlyAmount,
        currentMembers: 0,
        auctionSchedule: this.getAuctionSchedule(this.newGroup.auctionDay as string),
        status: (this.newGroup.status || 'Active') as 'Active' | 'Upcoming' | 'Completed' | 'Inactive',
        ...(this.newGroup as any),
      };

      this.chitGroups.unshift(newChitGroup);
      this.toggleAddGroupForm();
      alert(`Chit Group "${newChitGroup.name}" created successfully!`);
    } else {
      alert("Please enter at least the Group Name and Chit Amount.");
    }
  }

  editGroup(group: ChitGroup): void {
    alert(`Edit Group settings for "${group.name}" (ID: ${group.id})`);
  }

  private isFormValid(): boolean {
    this.validationErrors = {};
    let isValid = true;
    
    if (!this.newGroup.name?.trim()) {
      this.validationErrors['name'] = true;
      isValid = false;
    }
    if (!this.newGroup.chitAmount) {
      this.validationErrors['chitAmount'] = true;
      isValid = false;
    }

    return isValid;
  }

  private resetForm(): void {
    this.newGroup = {
      name: '',
      chitAmount: 0,
      chitSeries: '',
      auctionType: '',
      noOfInstallments: 0,
      psoDate: '',
      psoNumber: '',
      commencementDate: '',
      termDate: '',
      caNumber: '',
      caDate: '',
      enrollmentFee: 0,
      companyChitNumber: '',
      noOfAuctionInstallments: 0,
      companyCommission: 0,
      maxCeiling: 0,
      penaltyNps: 0,
      penaltyPs: 0,
      auctionsPerMonth: 0,
      installmentAmount: 0,
      auctionDate: '',
      auctionDay: '',
      auctionTimeFrom: '',
      auctionTimeTo: '',
      dividendMonth: '',
      sendSms: false,
      fdrNumber: '',
      fdrType: '',
      fdrAmount: 0,
      fdrDate: '',
      numberOfMonths: 0,
      maturityDate: '',
      roiPerYear: 0,
      fdrMaturityAmount: 0,
      bankNameBranch: '',
      tenure: 0,
      maxMembers: 0,
      commission: 0,
      auctionTime: '',
      startDate: '',
      status: undefined,
    };
  }

  private generateId(): string {
    return Math.random().toString().substr(2, 6);
  }

  private getAuctionSchedule(day: string): string {
    const schedules = {
      Sunday: '1st Sunday',
      Monday: '1st Monday',
      Tuesday: '1st Tuesday',
      Wednesday: '1st Wednesday',
      Thursday: '1st Thursday',
      Friday: '1st Friday',
      Saturday: '1st Saturday',
    };
    return schedules[day as keyof typeof schedules] || day;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN').format(amount);
  }
}
