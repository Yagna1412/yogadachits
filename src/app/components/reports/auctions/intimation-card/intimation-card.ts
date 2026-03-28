import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-intimation-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './intimation-card.html',
  styleUrls: ['./intimation-card.scss']
})
export class IntimationCardComponent {
  cardForm: FormGroup;
  cards = signal<any[]>([]);
  showResults = signal(false);
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.cardForm = this.fb.group({
      groupName: ['', Validators.required],
      ticketFrom: ['', Validators.required],
      ticketTo: ['', Validators.required],
      noticeDate: ['', Validators.required]
    }, { validators: this.ticketRangeValidator });
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
    if (this.cardForm.invalid) return;
    // Mocked data
    this.cards.set([
      {
        groupName: this.cardForm.value.groupName,
        ticketFrom: this.cardForm.value.ticketFrom,
        ticketTo: this.cardForm.value.ticketTo,
        noticeDate: this.cardForm.value.noticeDate,
        message: 'Auction Intimation Card for tickets ' + this.cardForm.value.ticketFrom + ' to ' + this.cardForm.value.ticketTo
      }
    ]);
    this.showResults.set(true);
  }
}
