import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bid-advance',
  imports: [CommonModule, FormsModule],
  templateUrl: './bid-advance.html',
  styleUrls: ['./bid-advance.scss']
})
export class BidAdvanceComponent {
  showForm = false;
  searchTerm: string = '';

  advances: any[] = [
    { id:1, groupName:'Group A', ticketNo:'101', paidTo:'Ramesh', series:'A', no:'1', transactionDate:'2026-02-01', account:'Cash', amount:2000, narration:'Advance bid', chequeNumber:'', chequeDate:'', currentInstallment:5, paidUpTo:'2026-01', chitAmount:4500, companyCommission:50, advanceAmount:2000, adjustmentAmount:0, totalPaid:2000 },
    { id:2, groupName:'Group B', ticketNo:'202', paidTo:'Suresh', series:'B', no:'2', transactionDate:'2026-02-03', account:'Bank', amount:3000, narration:'', chequeNumber:'CHK001', chequeDate:'2026-02-03', currentInstallment:6, paidUpTo:'2026-02', chitAmount:7800, companyCommission:100, advanceAmount:3000, adjustmentAmount:0, totalPaid:3000 },
    { id:3, groupName:'Group C', ticketNo:'303', paidTo:'Meena', series:'C', no:'3', transactionDate:'2026-02-05', account:'Cash', amount:1500, narration:'', chequeNumber:'', chequeDate:'', currentInstallment:4, paidUpTo:'2026-01', chitAmount:6000, companyCommission:80, advanceAmount:1500, adjustmentAmount:0, totalPaid:1500 },
    { id:4, groupName:'Group D', ticketNo:'404', paidTo:'Anita', series:'D', no:'4', transactionDate:'2026-02-07', account:'Bank', amount:4000, narration:'', chequeNumber:'CHK002', chequeDate:'2026-02-07', currentInstallment:8, paidUpTo:'2026-02', chitAmount:15000, companyCommission:300, advanceAmount:4000, adjustmentAmount:0, totalPaid:4000 },
    { id:5, groupName:'Group E', ticketNo:'505', paidTo:'Vikas', series:'E', no:'5', transactionDate:'2026-02-09', account:'Cash', amount:1000, narration:'', chequeNumber:'', chequeDate:'', currentInstallment:2, paidUpTo:'2026-01', chitAmount:2500, companyCommission:20, advanceAmount:1000, adjustmentAmount:0, totalPaid:1000 },
    { id:6, groupName:'Group F', ticketNo:'606', paidTo:'Priya', series:'F', no:'6', transactionDate:'2026-02-11', account:'Bank', amount:2500, narration:'', chequeNumber:'CHK003', chequeDate:'2026-02-11', currentInstallment:7, paidUpTo:'2026-01', chitAmount:10000, companyCommission:150, advanceAmount:2500, adjustmentAmount:0, totalPaid:2500 },
    { id:7, groupName:'Group G', ticketNo:'707', paidTo:'Sunil', series:'G', no:'7', transactionDate:'2026-02-13', account:'Cash', amount:1800, narration:'', chequeNumber:'', chequeDate:'', currentInstallment:3, paidUpTo:'2026-01', chitAmount:3000, companyCommission:30, advanceAmount:1800, adjustmentAmount:0, totalPaid:1800 },
    { id:8, groupName:'Group H', ticketNo:'808', paidTo:'Geeta', series:'H', no:'8', transactionDate:'2026-02-15', account:'Bank', amount:2200, narration:'', chequeNumber:'', chequeDate:'', currentInstallment:5, paidUpTo:'2026-01', chitAmount:4500, companyCommission:45, advanceAmount:2200, adjustmentAmount:0, totalPaid:2200 },
    { id:9, groupName:'Group I', ticketNo:'909', paidTo:'Rohit', series:'I', no:'9', transactionDate:'2026-02-17', account:'Cash', amount:3500, narration:'', chequeNumber:'', chequeDate:'', currentInstallment:6, paidUpTo:'2026-01', chitAmount:7000, companyCommission:70, advanceAmount:3500, adjustmentAmount:0, totalPaid:3500 },
    { id:10, groupName:'Group J', ticketNo:'1001', paidTo:'Sunita', series:'J', no:'10', transactionDate:'2026-02-19', account:'Bank', amount:5000, narration:'', chequeNumber:'CHK004', chequeDate:'2026-02-19', currentInstallment:9, paidUpTo:'2026-02', chitAmount:9500, companyCommission:95, advanceAmount:5000, adjustmentAmount:0, totalPaid:5000 }
  ];

  filteredAdvances: any[] = [...this.advances];
  newAdvance: any = {};

  constructor() {}
  ngOnInit(): void {}

  toggleForm() {this.showForm = !this.showForm;}

  filterAdvances() {
    const q=(this.searchTerm||'').toLowerCase();
    this.filteredAdvances=this.advances.filter(a=>{
      return (!q||
        (a.groupName&&a.groupName.toLowerCase().includes(q))||
        (a.ticketNo&&a.ticketNo.toLowerCase().includes(q))||
        (a.paidTo&&a.paidTo.toLowerCase().includes(q))
      );
    });
  }

  saveAdvance(){
    const amt=parseFloat(this.newAdvance.amount)||0;
    if(!amt||isNaN(amt)){alert('Amount numeric');return;}
    ['chitAmount','companyCommission','advanceAmount','adjustmentAmount','totalPaid'].forEach(f=>{
      if(this.newAdvance[f]!==undefined) this.newAdvance[f]=parseFloat(this.newAdvance[f])||0;
    });
    const entry={...this.newAdvance,id:Date.now(),amount:amt,advanceAmount:amt,totalPaid:amt};
    this.advances.push(entry);this.newAdvance={};this.showForm=false;this.filterAdvances();alert('Advance recorded');
  }
}
