import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuctionReportService } from '../../../../service/auction-report.service';
import { AuctionsService, ChitGroupDto } from '../../../../service/auction.service';

@Component({
  selector: 'app-intimation-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './intimation-card.html',
  styleUrls: ['./intimation-card.scss']
})
export class IntimationCardComponent implements OnInit {
  cardForm: FormGroup;
  cards = signal<any[]>([]);
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
    this.cardForm = this.fb.group({
      chitGroupId: ['', Validators.required],
      ticketFrom: ['', Validators.required],
      ticketTo: ['', Validators.required],
      noticeDate: ['', Validators.required]
    }, { validators: this.ticketRangeValidator });
  }

  ngOnInit(): void {
    this.auctionsService.listChitGroups().subscribe({
      next: (res) => {
        this.chitGroups = res.data || [];
      }
    });
  }

  ticketRangeValidator(control: any): { [key: string]: any } | null {
    const from = +control.get('ticketFrom')?.value;
    const to = +control.get('ticketTo')?.value;
    if (!from || !to) return null;
    if (from > to) {
      return { invalidTicketRange: true };
    }
    return null;
  }

  onGenerate() {
    this.submitted = true;
    this.loadError = '';
    if (this.cardForm.invalid) return;

    const { chitGroupId, ticketFrom, ticketTo, noticeDate } = this.cardForm.value;
    this.isLoading = true;
    this.reportService.intimationCard({
      chitGroupId: Number(chitGroupId),
      ticketFrom: ticketFrom != null && ticketFrom !== '' ? Number(ticketFrom) : null,
      ticketTo: ticketTo != null && ticketTo !== '' ? Number(ticketTo) : null,
      noticeDate
    }).subscribe({
      next: (rows) => {
        this.cards.set(rows);
        this.showResults.set(true);
        this.isLoading = false;
      },
      error: (err) => {
        this.cards.set([]);
        this.showResults.set(true);
        this.loadError = err?.error?.message || 'Unable to load intimation cards.';
        this.isLoading = false;
      }
    });
  }
}
