import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  durationMs: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 1;
  private readonly defaultDurationMs = 4000;

  readonly messages$ = new Subject<ToastMessage>();
  readonly dismiss$ = new Subject<number>();

  success(message: string, durationMs = this.defaultDurationMs): void {
    this.show('success', message, durationMs);
  }

  error(message: string, durationMs = 5000): void {
    this.show('error', message, durationMs);
  }

  warning(message: string, durationMs = this.defaultDurationMs): void {
    this.show('warning', message, durationMs);
  }

  info(message: string, durationMs = this.defaultDurationMs): void {
    this.show('info', message, durationMs);
  }

  dismiss(id: number): void {
    this.dismiss$.next(id);
  }

  private show(type: ToastType, message: string, durationMs: number): void {
    const id = this.nextId++;
    this.messages$.next({ id, type, message, durationMs });
  }
}
