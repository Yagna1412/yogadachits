import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';
import { AuctionsService, ChitGroupDto } from '../../../../service/auction.service';

@Component({
  selector: 'app-gst-balance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gst-balance.html',
  styleUrls: ['./gst-balance.scss']
})
export class GstBalanceComponent implements OnInit {
  balanceForm: FormGroup;
  results = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;
  isLoading = false;
  loadError = '';
  chitGroups: ChitGroupDto[] = [];

  constructor(
    private fb: FormBuilder,
    private reportService: AuctionReportService,
    private auctionsService: AuctionsService
  ) {
    this.balanceForm = this.fb.group({
      chitGroupId: [''],
      reportDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.auctionsService.listChitGroups().subscribe({
      next: (res) => {
        this.chitGroups = res.data || [];
      }
    });
  }

  onGenerate() {
    this.submitted = true;
    this.loadError = '';
    if (this.balanceForm.invalid) return;

    const { chitGroupId, reportDate } = this.balanceForm.value;
    this.isLoading = true;
    this.reportService.gstBalance({
      chitGroupId: chitGroupId ? Number(chitGroupId) : null,
      reportDate
    }).subscribe({
      next: (rows) => {
        this.results.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.results.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load GST balance.';
        this.isLoading = false;
      }
    });
  }

  onPrint() {
    window.print();
  }
}
