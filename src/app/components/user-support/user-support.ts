import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="support-container">
      <div class="support-header">
        <h1>Help & Support</h1>
        <p>Find answers to common questions or reach out to our team.</p>
      </div>

      <div class="support-grid">
        <!-- FAQ Section -->
        <div class="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div class="faq-list">
            <div *ngFor="let item of faqs; let i = index" class="faq-item" [class.open]="openFaq === i">
              <button class="faq-question" (click)="toggleFaq(i)">
                {{ item.q }}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" [class.rotated]="openFaq === i">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div class="faq-answer" *ngIf="openFaq === i">
                {{ item.a }}
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="contact-section">
          <div class="contact-card">
            <h3>Direct Contact</h3>
            <div class="contact-methods">
              <div class="method">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 12345 67890</span>
              </div>
              <div class="method">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 012-2V7a2 2 0 01-2-2H5a2 2 0 01-2 2v10a2 2 0 012 2z" />
                </svg>
                <span>support&#64;yogdafund.com</span>
              </div>
            </div>

            <hr class="divider">

            <h3>Drop us a Message</h3>
            <form (ngSubmit)="submitMessage()" #supportForm="ngForm">
              <div class="form-group">
                <label>Subject</label>
                <input type="text" [(ngModel)]="contact.subject" name="subject" required placeholder="Billing, Technical, etc.">
              </div>
              <div class="form-group">
                <label>Message</label>
                <textarea rows="4" [(ngModel)]="contact.message" name="message" required placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" class="submit-btn" [disabled]="!supportForm.valid">Send Message</button>
            </form>
            <div *ngIf="successMessage" class="success-msg">{{ successMessage }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .support-container { padding: 2rem; max-width: 1200px; margin: 0 auto; min-height: 100vh; background: #f7fbfe; }
    .support-header { margin-bottom: 2rem; }
    .support-header h1 { font-size: 1.875rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem; }
    .support-header p { color: #6b7280; font-size: 1.1rem; }
    .support-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }
    @media (max-width: 900px) { .support-grid { grid-template-columns: 1fr; } }
    
    .faq-section h2 { font-size: 1.25rem; font-weight: 700; color: #374151; margin-bottom: 1.5rem; }
    .faq-list { display: flex; flex-direction: column; gap: 1rem; }
    .faq-item { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; transition: all 0.2s; }
    .faq-question { width: 100%; padding: 1.25rem; background: none; border: none; text-align: left; font-weight: 600; color: #111827; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
    .faq-question svg { width: 20px; height: 20px; color: #9ca3af; transition: transform 0.2s; }
    .faq-question svg.rotated { transform: rotate(180deg); color: #6366f1; }
    .faq-answer { padding: 0 1.25rem 1.25rem 1.25rem; color: #4b5563; line-height: 1.6; font-size: 0.9375rem; border-top: 1px solid #f3f4f6; padding-top: 1rem; }
    
    .contact-card { background: white; border-radius: 16px; padding: 2rem; border: 1px solid #e5e7eb; position: sticky; top: 2rem; }
    .contact-card h3 { font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 1.25rem; }
    .contact-methods { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
    .method { display: flex; align-items: center; gap: 0.75rem; color: #4b5563; font-weight: 500; font-size: 0.9375rem; }
    .method svg { width: 20px; height: 20px; color: #6366f1; }
    .divider { border: 0; border-top: 1px solid #f3f4f6; margin: 2rem 0; }
    
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
    .form-group input, .form-group textarea { width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9375rem; transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    
    .submit-btn { width: 100%; padding: 0.875rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
    .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .success-msg { margin-top: 1rem; text-align: center; color: #059669; font-weight: 600; font-size: 0.875rem; }
  `]
})
export class UserSupportComponent {
  openFaq: number | null = null;
  contact = { subject: '', message: '' };
  successMessage = '';

  faqs = [
    { q: 'How do I pay my monthly installment?', a: 'You can pay through the "Dashboard" section by clicking the "Pay Now" button next to your pending receipt. We support UPI, Debit Cards, and Net Banking.' },
    { q: 'What happens if I miss an installment?', a: 'Missing an installment may incur a small penalty. However, you can still participate in the next auction as long as the previous month is cleared before the bid.' },
    { q: 'How are dividends calculated?', a: 'Dividends are the auction discount amount divided equally among all non-winning members after deducting the company\'s commission.' },
    { q: 'Can I release my chit amount early?', a: 'The prize money is only released after you win an auction and provide sufficient surety details as per company policy.' }
  ];

  toggleFaq(index: number) {
    this.openFaq = this.openFaq === index ? null : index;
  }

  submitMessage() {
    this.successMessage = 'Your message has been sent. We will get back to you within 24 hours.';
    this.contact = { subject: '', message: '' };
    setTimeout(() => this.successMessage = '', 4000);
  }
}
