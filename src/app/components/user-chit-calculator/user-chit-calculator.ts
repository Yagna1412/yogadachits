import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-chit-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-chit-calculator.html',
  styleUrl: './user-chit-calculator.scss'
})
export class UserChitCalculatorComponent {
  activeTab: 'affordability' | 'income' | 'emi' = 'affordability';

  // Affordability Calculator Inputs
  monthlyIncome: number | null = null;
  existingEmis: number | null = null;
  selectedTenure: number | null = null;

  // Calculation Results
  suggestedInstallment: number = 0;
  suggestedChitValue: number = 0;
  riskStatus: 'Safe' | 'Moderate' | 'High' = 'Safe';
  surplusIncome: number = 0;
  isCalculated: boolean = false;
  validationError: string = '';

  // Income Input Tab State
  incomeAccepted = false;
  incomeValidationError = '';

  // EMI Input Tab State
  emiAccepted = false;
  emiValidationError = '';

  tenureOptions = [
    { label: '25 Months', value: 25 },
    { label: '30 Months', value: 30 },
    { label: '40 Months', value: 40 },
    { label: '50 Months', value: 50 }
  ];

  setActiveTab(tab: 'affordability' | 'income' | 'emi') {
    this.activeTab = tab;
    this.isCalculated = false;
    this.validationError = '';
    this.incomeValidationError = '';
    this.incomeAccepted = false;
    this.emiValidationError = '';
    this.emiAccepted = false;
  }

  acceptMonthlyIncome() {
    this.incomeValidationError = '';
    this.incomeAccepted = false;

    if (!this.monthlyIncome || this.monthlyIncome <= 0) {
      this.incomeValidationError = 'Must be numeric and greater than zero.';
      return;
    }

    this.incomeAccepted = true;
  }

  acceptExistingEmis() {
    this.emiValidationError = '';
    this.emiAccepted = false;

    const emis = this.existingEmis || 0;

    if (emis < 0) {
      this.emiValidationError = 'EMI cannot be negative.';
      return;
    }

    if (this.monthlyIncome && emis > this.monthlyIncome) {
      this.emiValidationError = 'EMI cannot exceed your Monthly Income (₹' + this.monthlyIncome.toLocaleString() + ').';
      return;
    }

    this.emiAccepted = true;
  }

  skipExistingEmis() {
    this.existingEmis = 0;
    this.emiAccepted = true;
    this.emiValidationError = '';
  }

  calculateAffordability() {
    this.validationError = '';
    this.isCalculated = false;

    // Validation Rules
    if (!this.monthlyIncome || this.monthlyIncome <= 0) {
      this.validationError = 'Monthly Income must be greater than 0.';
      return;
    }

    const currentEmis = this.existingEmis || 0;
    if (currentEmis > this.monthlyIncome) {
      this.validationError = 'Total EMI cannot exceed your Monthly Income.';
      return;
    }

    if (!this.selectedTenure) {
      this.validationError = 'Please select a preferred tenure.';
      return;
    }

    // Calculation Logic
    this.surplusIncome = this.monthlyIncome - currentEmis;

    // We suggest that a safe installment is roughly 30% of your remaining surplus
    const suggestedSafeRatio = 0.3; 
    this.suggestedInstallment = Math.round(this.surplusIncome * suggestedSafeRatio);
    this.suggestedChitValue = this.suggestedInstallment * this.selectedTenure;

    // Determine Risk Status based on overall debt-to-income
    const totalObligations = currentEmis + this.suggestedInstallment;
    const obligationRatio = totalObligations / this.monthlyIncome;

    if (obligationRatio <= 0.4) {
      this.riskStatus = 'Safe';
    } else if (obligationRatio <= 0.6) {
      this.riskStatus = 'Moderate';
    } else {
      this.riskStatus = 'High';
    }

    this.isCalculated = true;
  }
}
