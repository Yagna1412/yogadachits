import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-company-investment-on-vacant-chits',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-investment-on-vacant-chits.html',
  styleUrls: ['./company-investment-on-vacant-chits.scss']
})
export class CompanyInvestmentOnVacantChitsComponent {
  investmentForm: FormGroup;
  investments = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.investmentForm = this.fb.group({
      date: ['', [Validators.required]],
      groupStatus: ['Both', [Validators.required]],
      reportFormat: ['PDF', [Validators.required]]
    }, { validators: this.financialYearValidator });
  }

  // Custom validator for financial year
  financialYearValidator(control: AbstractControl): { [key: string]: any } | null {
    const selectedDate = control.get('date')?.value;
    if (!selectedDate) return null;

    const date = new Date(selectedDate);
    const currentYear = new Date().getFullYear();
    const financialYearStart = new Date(currentYear - 1, 3, 1); // April 1st of previous year
    const financialYearEnd = new Date(currentYear, 2, 31); // March 31st of current year

    if (date < financialYearStart || date > financialYearEnd) {
      return { invalidFinancialYear: true };
    }
    return null;
  }

  onGenerate() {
    this.submitted = true;

    if (this.investmentForm.valid) {
      this.generateReport();
    }
  }

  private generateReport() {
    const formValue = this.investmentForm.value;

    // Mock data generation based on form values
    const mockInvestments = this.generateMockInvestments(formValue);
    this.investments.set(mockInvestments);
    this.showResults.set(true);
  }

  private generateMockInvestments(formValue: any): any[] {
    const investments = [];
    const count = Math.floor(Math.random() * 20) + 10; // 10-30 investments

    const groupStatuses = formValue.groupStatus === 'Both'
      ? ['Running', 'Closed']
      : [formValue.groupStatus];

    const chitTypes = ['Regular Chit', 'Special Chit', 'Premium Chit', 'Diamond Chit'];
    const locations = ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune'];

    for (let i = 1; i <= count; i++) {
      const groupStatus = groupStatuses[Math.floor(Math.random() * groupStatuses.length)];
      const investment: any = {
        id: `INV${String(i).padStart(4, '0')}`,
        groupId: `GRP${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        groupName: `Group ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`,
        chitType: chitTypes[Math.floor(Math.random() * chitTypes.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        groupStatus: groupStatus,
        vacantPosition: Math.floor(Math.random() * 50) + 1,
        investmentAmount: Math.floor(Math.random() * 500000) + 50000,
        investmentDate: formValue.date,
        tenure: Math.floor(Math.random() * 60) + 12, // 12-72 months
        monthlySubscription: Math.floor(Math.random() * 10000) + 1000,
        expectedReturn: Math.floor(Math.random() * 100000) + 10000,
        status: Math.random() > 0.1 ? 'Active' : 'Completed'
      };

      investments.push(investment);
    }

    return investments.sort((a, b) => a.groupId.localeCompare(b.groupId));
  }

  onClear() {
    this.investmentForm.reset({
      groupStatus: 'Both',
      reportFormat: 'PDF'
    });
    this.submitted = false;
    this.showResults.set(false);
    this.investments.set([]);
  }

  exportReport() {
    const formValue = this.investmentForm.value;
    const format = formValue.reportFormat;

    // Mock export functionality
    alert(`Company investment report exported in ${format} format with ${this.investments().length} investments`);
  }

  getTotalInvestment(): number {
    return this.investments().reduce((sum, inv) => sum + inv.investmentAmount, 0);
  }

  getTotalExpectedReturn(): number {
    return this.investments().reduce((sum, inv) => sum + inv.expectedReturn, 0);
  }

  getNetProfit(): number {
    return this.getTotalExpectedReturn() - this.getTotalInvestment();
  }

  getRunningGroupsCount(): number {
    return this.investments().filter(inv => inv.groupStatus === 'Running').length;
  }

  getClosedGroupsCount(): number {
    return this.investments().filter(inv => inv.groupStatus === 'Closed').length;
  }
}