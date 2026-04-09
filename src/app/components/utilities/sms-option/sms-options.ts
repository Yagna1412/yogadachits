import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sms-options',
  imports: [CommonModule, FormsModule],
  templateUrl: './sms-options.html',
  styleUrls: ['./sms-options.scss']
})
export class SmsOptionsComponent {
  activeTab = 'outstanding';
  model: any = {};
  generatedList: any[] = [];
  showGenerated = false;

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.model = {};
    this.showGenerated = false;
    this.generatedList = [];
  }

  generate() {
    // Mock generation logic
    this.generatedList = [
      { name: 'John Doe', phone: '9876543210', message: 'Outstanding due reminder' },
      { name: 'Jane Smith', phone: '8765432109', message: 'Receipt confirmation' },
      { name: 'Bob Johnson', phone: '7654321098', message: 'Auction notification' }
    ];
    this.showGenerated = true;
    alert('SMS list generated successfully');
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
