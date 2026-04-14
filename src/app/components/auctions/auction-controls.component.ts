import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auction-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auction-controls-actions">
      <button class="btn btn-secondary" (click)="download.emit()">Download details</button>
      <button class="btn btn-primary" (click)="confirm.emit()">Winner Confirmation</button>
    </div>
  `,
  styles: [`.auction-controls-actions{display:flex;gap:0.5rem;}`]
})
export class AuctionControlsComponent {
  @Output() download = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
