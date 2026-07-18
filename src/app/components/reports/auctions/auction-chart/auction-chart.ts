import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';
import { AuctionsService, ChitGroupDto } from '../../../../service/auction.service';

@Component({
  selector: 'app-auction-chart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auction-chart.html',
  styleUrls: ['./auction-chart.scss']
})
export class AuctionChartComponent implements OnInit {
  chartForm: FormGroup;
  auctions = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;
  isLoading = false;
  loadError = '';
  chitGroups: ChitGroupDto[] = [];

  groupTypes = [
    { label: 'All Groups', value: 'All' },
    { label: 'Single Group', value: 'Single' }
  ];

  constructor(
    private fb: FormBuilder,
    private reportService: AuctionReportService,
    private auctionsService: AuctionsService
  ) {
    this.chartForm = this.fb.group({
      groupType: ['All', Validators.required],
      chitGroupId: [''],
      auctionDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.auctionsService.listChitGroups().subscribe({
      next: (res) => {
        this.chitGroups = res.data || [];
      }
    });

    this.chartForm.get('groupType')?.valueChanges.subscribe((type) => {
      const control = this.chartForm.get('chitGroupId');
      if (type === 'Single') {
        control?.setValidators([Validators.required]);
      } else {
        control?.clearValidators();
        control?.setValue('');
      }
      control?.updateValueAndValidity();
    });
  }

  onGenerate() {
    this.submitted = true;
    this.loadError = '';
    if (this.chartForm.invalid) return;

    const { groupType, chitGroupId, auctionDate } = this.chartForm.value;
    this.isLoading = true;
    this.reportService.auctionChart({
      groupType,
      auctionDate,
      chitGroupId: groupType === 'Single' && chitGroupId ? Number(chitGroupId) : null
    }).subscribe({
      next: (rows) => {
        this.auctions.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.auctions.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load auction chart.';
        this.isLoading = false;
      }
    });
  }
}
