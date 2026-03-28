import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-setup-utilities',
  imports: [CommonModule, FormsModule],
  templateUrl: './company-setup-utilities.html',
  styleUrls: ['./company-setup-utilities.scss']
})
export class CompanySetupUtilitiesComponent {
  showForm = false;
  model: any = {};
  nameQuery = '';
  companies: any[] = [
    {
      companyName: 'Sample Company',
      address: '123 Main St',
      phone: '1234567890',
      email: 'info@sample.com',
      gstNo: '22AAAAA0000A1Z5',
      enrollmentCharges: 100,
      companyCommission: 5
    },
    {
      companyName: 'Tech Solutions Ltd',
      address: '456 Tech Park, Bangalore',
      phone: '9876543210',
      email: 'contact@techsolutions.com',
      gstNo: '29AABCU9603R1ZU',
      enrollmentCharges: 150,
      companyCommission: 7
    },
    {
      companyName: 'Finance Corp',
      address: '789 Finance Tower, Mumbai',
      phone: '8765432109',
      email: 'admin@financecorp.in',
      gstNo: '27AAACC1234F1Z8',
      enrollmentCharges: 200,
      companyCommission: 6
    },
    {
      companyName: 'Global Enterprises',
      address: '321 Global Plaza, Delhi',
      phone: '7654321098',
      email: 'support@globalent.com',
      gstNo: '07AAACH1234H1Z9',
      enrollmentCharges: 120,
      companyCommission: 8
    },
    {
      companyName: 'Chit Fund Services',
      address: '654 Chit Fund Road, Chennai',
      phone: '6543210987',
      email: 'info@chitfundservices.com',
      gstNo: '33AAADA1234A1Z0',
      enrollmentCharges: 180,
      companyCommission: 4
    }
  ];
  filteredCompanies: any[] = [...this.companies];

  toggleForm() {
    this.showForm = !this.showForm;
  }

  search() {
    const query = (this.nameQuery || '').toLowerCase();
    this.filteredCompanies = this.companies.filter(c =>
      (c.companyName || '').toLowerCase().includes(query)
    );
  }

  save() {
    if (!this.model.companyName) {
      alert('Company Name is mandatory');
      return;
    }
    if (this.model.gstNo && !this.validGst(this.model.gstNo)) {
      alert('Invalid GST number format');
      return;
    }
    const entry = { ...this.model };
    this.companies.push(entry);
    this.filteredCompanies = [...this.companies];
    this.model = {};
    this.showForm = false;
    alert('Company setup saved successfully');
  }

  reset() {
    this.model = {};
  }

  validGst(gst: string) {
    // basic regex for Indian GSTIN (15 chars): 2 digits state code + 10 PAN + 1 char entity + 1 char checksum
    const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Zz]{1}[A-Z0-9]{1}$/;
    return re.test((gst || '').toUpperCase());
  }
}