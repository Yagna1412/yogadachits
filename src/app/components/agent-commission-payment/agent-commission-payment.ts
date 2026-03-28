import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-commission-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-commission-payment.html',
  styleUrls: ['./agent-commission-payment.scss']
})
export class AgentCommissionPaymentComponent {
  showForm = false;
  searchTerm = '';

  bills: any[] = [
    { id:1, agentName:'Agent A', voucherDate:'2026-02-01', tdsPct:5, tdsAmount:100, series:'AC', voucherNo:'001', gstPct:18, gstAmount:360, fromDate:'2026-01-01', toDate:'2026-01-31', totalBill:6000, finalBill:5540 },
    { id:2, agentName:'Agent B', voucherDate:'2026-02-05', tdsPct:5, tdsAmount:150, series:'AC', voucherNo:'002', gstPct:18, gstAmount:540, fromDate:'2026-01-01', toDate:'2026-01-31', totalBill:9000, finalBill:8310 },
    { id:3, agentName:'Agent C', voucherDate:'2026-02-10', tdsPct:5, tdsAmount:120, series:'AC', voucherNo:'003', gstPct:18, gstAmount:432, fromDate:'2026-02-01', toDate:'2026-02-28', totalBill:7200, finalBill:6548 },
    { id:4, agentName:'Agent D', voucherDate:'2026-02-15', tdsPct:5, tdsAmount:200, series:'AC', voucherNo:'004', gstPct:18, gstAmount:720, fromDate:'2026-02-01', toDate:'2026-02-28', totalBill:12000, finalBill:10880 },
    { id:5, agentName:'Agent E', voucherDate:'2026-02-20', tdsPct:5, tdsAmount:175, series:'AC', voucherNo:'005', gstPct:18, gstAmount:630, fromDate:'2026-02-01', toDate:'2026-02-28', totalBill:10500, finalBill:9545 },
    { id:6, agentName:'Agent F', voucherDate:'2026-02-25', tdsPct:5, tdsAmount:90, series:'AC', voucherNo:'006', gstPct:18, gstAmount:324, fromDate:'2026-02-01', toDate:'2026-02-28', totalBill:5400, finalBill:4914 },
    { id:7, agentName:'Agent G', voucherDate:'2026-03-01', tdsPct:5, tdsAmount:135, series:'AC', voucherNo:'007', gstPct:18, gstAmount:486, fromDate:'2026-03-01', toDate:'2026-03-31', totalBill:8100, finalBill:7371 },
    { id:8, agentName:'Agent H', voucherDate:'2026-03-03', tdsPct:5, tdsAmount:110, series:'AC', voucherNo:'008', gstPct:18, gstAmount:396, fromDate:'2026-03-01', toDate:'2026-03-31', totalBill:6600, finalBill:6006 }
  ];

  filteredBills:any[]=[...this.bills];
  newBill:any={};

  toggleForm(){this.showForm=!this.showForm;}
  filterBills(){
    const q=(this.searchTerm||'').toLowerCase();
    this.filteredBills=this.bills.filter(b=>{
      return(!q||
        (b.agentName&&b.agentName.toLowerCase().includes(q))||
        (b.voucherNo&&b.voucherNo.toLowerCase().includes(q))
      );
    });
  }
  saveBill(){
    const amt=parseFloat(this.newBill.totalBill)||0;
    if(!amt||isNaN(amt)){alert('Amount numeric');return;}
    ['tdsAmount','gstAmount','totalBill','finalBill'].forEach(f=>{
      if(this.newBill[f]!==undefined) this.newBill[f]=parseFloat(this.newBill[f])||0;
    });
    const entry={...this.newBill,id:Date.now()};
    this.bills.push(entry);
    this.newBill={};this.showForm=false;this.filterBills();alert('Bill prepared');
  }
}
