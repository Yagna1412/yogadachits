import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-penalty-calculation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './penalty-calculation.html',
  styleUrls: ['./penalty-calculation.scss']
})
export class PenaltyCalculationComponent {
  groupName = '';
  ticketNo = '';
  installmentRange = '';
  dividend = 0;

  calculation: any = null;

  groups = ['Golden Circle 2024', 'Diamond Elite', 'Silver Saver', 'Platinum Plus'];
  ticketNumbers = ['0001', '0002', '0003', '0004', '0005'];
  installmentRanges = ['1-3 months', '3-6 months', '6-12 months', '12+ months'];

  generate() {
    // validate mandatory fields
    if (!this.groupName || !this.ticketNo || !this.installmentRange || !this.dividend) {
      alert('All fields are mandatory');
      return;
    }

    // penalty calculation logic
    let penaltyRate = 0;
    const rangeMap: any = {
      '1-3 months': 2,
      '3-6 months': 5,
      '6-12 months': 10,
      '12+ months': 15
    };
    penaltyRate = rangeMap[this.installmentRange] || 0;

    const penaltyAmount = (this.dividend * penaltyRate) / 100;

    this.calculation = {
      groupName: this.groupName,
      ticketNo: this.ticketNo,
      installmentRange: this.installmentRange,
      dividend: this.dividend,
      penaltyRate: penaltyRate,
      penaltyAmount: penaltyAmount.toFixed(2),
      generatedDate: new Date().toLocaleDateString()
    };
  }

  reset() {
    this.groupName = '';
    this.ticketNo = '';
    this.installmentRange = '';
    this.dividend = 0;
    this.calculation = null;
  }
}
