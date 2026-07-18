import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastMessage, ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscriptions = new Subscription();
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.toastService.messages$.subscribe((toast) => {
        this.toasts = [...this.toasts, toast];
        const timer = setTimeout(() => this.removeToast(toast.id), toast.durationMs);
        this.timers.set(toast.id, timer);
      })
    );

    this.subscriptions.add(
      this.toastService.dismiss$.subscribe((id) => this.removeToast(id))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  removeToast(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
  }
}
