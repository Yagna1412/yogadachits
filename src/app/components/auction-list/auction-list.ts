import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionsService, AuctionResponse } from '../../service/auction.service';

@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-list.html',
  styleUrl: './auction-list.scss'
})
export class AuctionListComponent implements OnInit {
  auctions: AuctionResponse[] = [];
  isLoading = true;

  constructor(private auctionService: AuctionsService) {}

  ngOnInit(): void {
    this.auctionService.listAuctions().subscribe({
      next: (res) => {
        if (res.data) {
          this.auctions = res.data.filter(a => a.status === 'Completed' || a.winningBidId);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
