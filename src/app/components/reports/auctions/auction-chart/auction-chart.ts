import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-auction-chart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auction-chart.html',
  styleUrls: ['./auction-chart.scss']
})
export class AuctionChartComponent {
  chartForm: FormGroup;
  auctions = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  groupTypes = [
    { label: 'All Groups', value: 'All' },
    { label: 'Single Group', value: 'Single' }
  ];

  constructor(private fb: FormBuilder) {
    this.chartForm = this.fb.group({
      groupType: ['All', Validators.required],
      auctionDate: ['', Validators.required]
    });
  }

  onGenerate() {
    this.submitted = true;
    if (this.chartForm.invalid) return;
    // Mocked data
    this.auctions.set([
      {
        groupType: this.chartForm.value.groupType,
        auctionDate: this.chartForm.value.auctionDate,
        chitGroup: 'Group 1',
        details: 'Auction details for Group 1'
      },
      {
        groupType: this.chartForm.value.groupType,
        auctionDate: this.chartForm.value.auctionDate,
        chitGroup: 'Group 2',
        details: 'Auction details for Group 2'
      }
    ]);
    this.showResults.set(true);
  }
}
