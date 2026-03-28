import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-company-setup-information',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-setup-information.html',
  styleUrls: ['./company-setup-information.scss']
})
export class CompanySetupInformationComponent {
  companyForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      // Receipt Charges Types
      receiptChargeType1: [''],
      receiptChargeType2: [''],
      receiptChargeType3: [''],
      receiptChargeType4: [''],
      receiptChargeType5: [''],

      // Company Information
      registeredOfficeAddress: ['', Validators.required],
      registeredNumber: ['', Validators.required],
      registeredPlace: ['', Validators.required],

      // Additional Information
      advocateName: [''],
      actType: [''],
      agentCommissionEligibleAmount: ['', [Validators.pattern(/^\d+$/)]],
      onlineAuction: ['Active'],
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      pinCode: ['', [Validators.pattern(/^\d{6}$/)]],
      mobileNo: ['', [Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]],

      // Footer Information
      footer1: ['Cashier'],
      footer2: ['Accountant'],
      footer3: ['Foreman']
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.companyForm.valid) {
      // Save logic here
      alert('Company setup information saved successfully');
    } else {
      alert('Please fill in all mandatory fields correctly');
    }
  }

  resetForm() {
    this.companyForm.reset({
      onlineAuction: 'Active',
      footer1: 'Cashier',
      footer2: 'Accountant',
      footer3: 'Foreman'
    });
  }
}