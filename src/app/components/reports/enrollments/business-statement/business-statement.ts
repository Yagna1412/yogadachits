import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-business-statement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business-statement.html',
  styleUrls: ['./business-statement.scss']
})
export class BusinessStatementComponent {
  statementForm: FormGroup;
  businessStatements = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.statementForm = this.fb.group({
      by: ['', [Validators.required]],
      reportFormat: ['PDF', [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]]
    }, { validators: this.dateRangeValidator });
  }

  // Custom validator for date range
  dateRangeValidator(control: AbstractControl): { [key: string]: any } | null {
    const fromDate = control.get('fromDate')?.value;
    const toDate = control.get('toDate')?.value;

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      return { invalidDateRange: true };
    }
    return null;
  }

  onGenerate() {
    this.submitted = true;

    if (this.statementForm.valid) {
      this.generateReport();
    }
  }

  private generateReport() {
    const formValue = this.statementForm.value;

    // Mock data generation based on form values
    const mockStatements = this.generateMockBusinessStatements(formValue);
    this.businessStatements.set(mockStatements);
    this.showResults.set(true);
  }

  private generateMockBusinessStatements(formValue: any): any[] {
    const statements = [];
    const count = Math.floor(Math.random() * 15) + 5; // 5-20 statements

    const businessTypes = ['Chit Fund Operations', 'Loan Disbursements', 'Collection Activities', 'Investment Returns', 'Administrative Expenses'];

    for (let i = 1; i <= count; i++) {
      const statement: any = {
        id: `BS${String(i).padStart(3, '0')}`,
        businessType: businessTypes[Math.floor(Math.random() * businessTypes.length)],
        description: this.generateBusinessDescription(),
        transactionDate: this.generateRandomDate(formValue.fromDate, formValue.toDate),
        amount: Math.floor(Math.random() * 100000) + 10000,
        transactionType: Math.random() > 0.5 ? 'Income' : 'Expense',
        category: this.generateCategory(),
        reference: `REF${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        status: Math.random() > 0.8 ? 'Pending' : 'Completed'
      };

      statements.push(statement);
    }

    return statements.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }

  private generateBusinessDescription(): string {
    const descriptions = [
      'Monthly chit fund collection',
      'Loan interest income',
      'Administrative fee collection',
      'Investment dividend received',
      'Office maintenance expenses',
      'Staff salary payment',
      'Marketing campaign costs',
      'IT infrastructure upgrade',
      'Legal and compliance fees',
      'Customer service operations'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateCategory(): string {
    const categories = [
      'Operations',
      'Finance',
      'Administration',
      'Marketing',
      'IT',
      'Legal',
      'Human Resources',
      'Customer Service'
    ];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private generateRandomDate(fromDate: string, toDate: string): string {
    if (!fromDate || !toDate) {
      const today = new Date();
      const randomDays = Math.floor(Math.random() * 365);
      const date = new Date(today.getTime() - randomDays * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const randomTime = from.getTime() + Math.random() * (to.getTime() - from.getTime());
    const date = new Date(randomTime);
    return date.toISOString().split('T')[0];
  }

  onClear() {
    this.statementForm.reset({
      reportFormat: 'PDF'
    });
    this.submitted = false;
    this.showResults.set(false);
    this.businessStatements.set([]);
  }

  exportReport() {
    const formValue = this.statementForm.value;
    const format = formValue.reportFormat;

    // Mock export functionality
    alert(`Business statement exported in ${format} format with ${this.businessStatements().length} transactions`);
  }

  getTotalIncome(): number {
    return this.businessStatements()
      .filter(s => s.transactionType === 'Income')
      .reduce((sum, s) => sum + s.amount, 0);
  }

  getTotalExpenses(): number {
    return this.businessStatements()
      .filter(s => s.transactionType === 'Expense')
      .reduce((sum, s) => sum + s.amount, 0);
  }

  getNetAmount(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }
}