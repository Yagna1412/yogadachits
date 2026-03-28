import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-sms-options',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-sms-options.html',
  styleUrls: ['./report-sms-options.scss']
})
export class ReportSmsOptionsComponent {
  activeTab = 'outstanding';
  smsCategory = 'Outstanding';
  model: any = {};
  generatedList: any[] = [];
  showGenerated = false;

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.smsCategory = this.getCategoryName(tab);
    this.model = {};
    this.showGenerated = false;
    this.generatedList = [];
  }

  getTabFromCategory(category: string): string {
    const tabMap: { [key: string]: string } = {
      'Outstanding': 'outstanding',
      'Promotional': 'promotional',
      'Receipts': 'receipts',
      'Auctions': 'auctions',
      'Greetings': 'greetings',
      'Guarantor Dues': 'guarantor'
    };
    return tabMap[category] || 'outstanding';
  }

  getCategoryName(tab: string): string {
    const categoryMap: { [key: string]: string } = {
      'outstanding': 'Outstanding',
      'promotional': 'Promotional',
      'receipts': 'Receipts',
      'auctions': 'Auctions',
      'greetings': 'Greetings',
      'guarantor': 'Guarantor Dues'
    };
    return categoryMap[tab] || 'Outstanding';
  }

  generate() {
    // Validation based on tab
    if (!this.validateForm()) {
      return;
    }

    // Mock generation logic based on category
    this.generatedList = this.generateMockData();
    this.showGenerated = true;
    alert('SMS report data generated');
  }

  validateForm(): boolean {
    switch (this.activeTab) {
      case 'outstanding':
        if (!this.model.dueDate) {
          alert('Due Date is mandatory for Outstanding SMS');
          return false;
        }
        break;
      case 'promotional':
        if (!this.model.messageContent) {
          alert('Message Content is mandatory for Promotional SMS');
          return false;
        }
        break;
      case 'receipts':
        if (!this.model.receiptDate) {
          alert('Receipt Date is mandatory for Receipts SMS');
          return false;
        }
        break;
      case 'auctions':
        if (!this.model.auctionDate) {
          alert('Auction Date is mandatory for Auctions SMS');
          return false;
        }
        break;
      case 'greetings':
        if (!this.model.greetingDate) {
          alert('Greeting Date is mandatory for Greetings SMS');
          return false;
        }
        break;
      case 'guarantor':
        if (!this.model.date) {
          alert('Date is mandatory for Guarantor Dues SMS');
          return false;
        }
        break;
    }
    return true;
  }

  generateMockData(): any[] {
    const mockData = [
      { name: 'John Doe', phone: '9876543210', message: 'Outstanding due reminder' },
      { name: 'Jane Smith', phone: '8765432109', message: 'Receipt confirmation' },
      { name: 'Bob Johnson', phone: '7654321098', message: 'Auction notification' }
    ];

    // Customize based on category
    switch (this.activeTab) {
      case 'promotional':
        return mockData.map(item => ({ ...item, message: this.model.messageContent }));
      case 'greetings':
        return mockData.map(item => ({ ...item, message: 'Happy Birthday! Best wishes from our team.' }));
      default:
        return mockData;
    }
  }

  sendSms() {
    if (!this.generatedList.length) {
      alert('Please generate the list first');
      return;
    }
    alert('SMS sent successfully to ' + this.generatedList.length + ' members');
    this.showGenerated = false;
    this.generatedList = [];
  }

  cancel() {
    this.model = {};
    this.showGenerated = false;
    this.generatedList = [];
  }
}