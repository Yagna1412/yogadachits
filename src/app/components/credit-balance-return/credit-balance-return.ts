import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credit-balance-return',
  imports: [CommonModule, FormsModule],
  templateUrl: './credit-balance-return.html',
  styleUrls: ['./credit-balance-return.scss']
})
export class CreditBalanceReturnComponent {
  showForm = false;
  searchTerm = '';

  returns: any[] = [
    { id: 1, groupName: 'Group A', ticketNo: '101', paidTo: 'Ramesh', series: 'A', no: '1', transactionDate: '2026-02-01', account: 'Cash', amount: 500, narration: 'Overpayment refund', chequeNumber: '', chequeDate: '', payable: 500, paidAmount: 500, netPayable: 500 },
    { id: 2, groupName: 'Group B', ticketNo: '202', paidTo: 'Suresh', series: 'B', no: '2', transactionDate: '2026-02-03', account: 'Bank', amount: 300, narration: '', chequeNumber: 'CHK005', chequeDate: '2026-02-03', payable: 300, paidAmount: 300, netPayable: 300 }
  ];

  filteredReturns: any[] = [...this.returns];
  newReturn: any = {};

  toggleForm() { this.showForm = !this.showForm; }

  filterReturns() {
    const q = (this.searchTerm || '').toLowerCase();
    this.filteredReturns = this.returns.filter(r => {
      return (
        !q ||
        (r.groupName && r.groupName.toLowerCase().includes(q)) ||
        (r.ticketNo && r.ticketNo.toLowerCase().includes(q)) ||
        (r.paidTo && r.paidTo.toLowerCase().includes(q))
      );
    });
  }

  saveReturn() {
    const amt = parseFloat(this.newReturn.amount) || 0;
    if (!amt || isNaN(amt)) { alert('Amount numeric'); return; }
    ['payable','paidAmount','netPayable'].forEach(f=>{
      if(this.newReturn[f]!==undefined) this.newReturn[f]=parseFloat(this.newReturn[f])||0;
    });
    const entry = { ...this.newReturn, id: Date.now(), amount: amt, payable: amt, paidAmount: amt, netPayable: amt };
    this.returns.push(entry);
    this.newReturn = {};
    this.showForm = false;
    this.filterReturns();
    alert('Credit returned');
  }
}
