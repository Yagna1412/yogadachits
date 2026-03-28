import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Receipt {
  id: string;
  member: string;
  group: string;
  amount: string;
  paymentMode: string;
  date: string;
}

@Component({
  selector: 'app-member-receipts',
  imports: [CommonModule, FormsModule],
  templateUrl: './member-receipts.html',
  styleUrl: './member-receipts.scss',
})
export class MemberReceiptsComponent {
  searchTerm: string = '';
  filteredReceipts: Receipt[] = [];
  allReceipts: Receipt[] = [
    {
      id: 'RE001',
      member: 'Rajesh Kumar',
      group: 'Golden Circle 2024',
      amount: '₹ 25,000',
      paymentMode: 'UPI',
      date: 'Mar 19,2023  9:00AM',
    },
    {
      id: 'RE002',
      member: 'Priya Sharma',
      group: 'Silver Star',
      amount: '₹ 25,000',
      paymentMode: 'Cash',
      date: 'Mar 19,2023  9:00AM',
    },
    {
      id: 'RE003',
      member: 'Amit Patel',
      group: 'Bronze Fund 30',
      amount: '₹ 25,000',
      paymentMode: 'Cheque',
      date: 'Mar 19,2023  9:00AM',
    },
    {
      id: 'RE004',
      member: 'Sunita Devi',
      group: 'Silver Star',
      amount: '₹ 25,000',
      paymentMode: 'Bank Transfer',
      date: 'Mar 19,2023  9:00AM',
    },
    {
      id: 'RE005',
      member: 'Vijay Reddy',
      group: 'Bronze Fund 30',
      amount: '₹ 25,000',
      paymentMode: 'Cash',
      date: 'Mar 19,2023  9:00AM',
    },
  ];

  constructor() {
    this.filteredReceipts = this.allReceipts;
  }

  // Bound properties for Bid Entry
  newReceipt: any = {
    member: '',
    amount: '',
    paymentMode: 'Cash'
  };

  filterReceipts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredReceipts = this.allReceipts;
      return;
    }

    const search = this.searchTerm.toLowerCase();
    this.filteredReceipts = this.allReceipts.filter(
      (receipt) =>
        receipt.id.toLowerCase().includes(search) ||
        receipt.member.toLowerCase().includes(search) ||
        receipt.group.toLowerCase().includes(search) ||
        receipt.paymentMode.toLowerCase().includes(search)
    );
  }

  saveReceipt() {
    if(!this.newReceipt.member || !this.newReceipt.amount) {
      alert("Please select a Member and enter an Amount.");
      return;
    }
    const receipt: Receipt = {
      id: "RE" + Math.floor(100 + Math.random() * 900),
      member: this.newReceipt.member,
      group: "General Collection",
      amount: "₹ " + this.newReceipt.amount,
      paymentMode: this.newReceipt.paymentMode,
      date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    this.allReceipts.unshift(receipt);
    this.filterReceipts();
    this.newReceipt = { member: '', amount: '', paymentMode: 'Cash' };
    alert("Receipt saved successfully!");
  }

  saveAndPrintReceipt() {
    this.saveReceipt();
    if(!this.newReceipt.member && !this.newReceipt.amount) {
      alert("Initiating print sequence for the newly saved receipt...");
    }
  }

  viewReceipt(id: string) {
    alert(`Viewing receipt details for ID: ${id}`);
  }

  printReceipt(id: string) {
    alert(`Printing receipt ID: ${id}...`);
  }
}
