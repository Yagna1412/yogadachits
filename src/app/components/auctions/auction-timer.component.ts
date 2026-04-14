import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuctionsService } from '../../service/auction.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auction-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-timer.component.html',
  styleUrls: ['./auction-timer.component.scss']
})
export class AuctionTimerComponent implements OnInit, OnDestroy {
  timerValue = 0;
  isRunning = false;
  isComplete = false;
  private subs: Subscription[] = [];

  constructor(private svc: AuctionsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.subs.push(this.svc.timerValue$.subscribe(v => { this.timerValue = v; this.cdr.markForCheck(); }));
    this.subs.push(this.svc.isTimerRunning$.subscribe(s => { this.isRunning = s; this.cdr.markForCheck(); }));
    this.subs.push(this.svc.isTimerComplete$.subscribe(done => { this.isComplete = done; this.cdr.markForCheck(); }));
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }

  formatTimer(): string {
    const m = Math.floor(this.timerValue / 60);
    const s = this.timerValue % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
