import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../enviornment/enviornment';
import { AuthService } from './auth';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface MeProfile {
  userId: number;
  email: string;
  fullName: string;
  phone?: string;
  role?: string;
  userType?: string;
  userCode?: string;
  memberId?: number;
  memberDisplayId?: string;
}

export interface UpcomingPayment {
  groupName: string;
  groupCode?: string;
  amount: number;
  dueDate: string;
  enrollmentId?: number;
}

export interface MeDashboard {
  enrolledChitGroups: number;
  activeChitGroups: number;
  installmentsPaid: number;
  totalInstallments: number;
  totalPaidAmount: number;
  bidsWon: number;
  totalPrizeAmount: number;
  upcomingPayment?: UpcomingPayment | null;
}

export interface MeEnrollmentItem {
  enrollmentId: number;
  groupName: string;
  groupCode?: string;
  chitAmount: number;
  installmentsPaid: number;
  totalInstallments: number;
  progressPercent: number;
  nextDueDate?: string | null;
  status: string;
}

export interface MeReceiptItem {
  id: number;
  receiptNo: string;
  groupName: string;
  installmentLabel?: string;
  amount: number;
  dividend: number;
  netPayable: number;
  receiptDate: string;
  paymentMode?: string;
  status: string;
}

export interface MeNotificationItem {
  id: string;
  type: 'payment' | 'bid' | 'alert' | string;
  title: string;
  message: string;
  occurredAt: string;
  referenceId?: number;
  unread?: boolean;
}

export interface MeDueItem {
  installmentId: number;
  enrollmentId?: number;
  groupName: string;
  groupCode?: string;
  installmentNo?: number;
  amount: number;
  dueDate: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeService {
  private apiUrl = `${environment.apiUrl}/me`;
  private readonly READ_KEY_PREFIX = 'meNotificationReadIds:';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getProfile(): Observable<MeProfile> {
    return this.http.get<ApiResponse<MeProfile>>(this.apiUrl, this.getHeaders()).pipe(
      map(res => res.data)
    );
  }

  getDashboard(): Observable<MeDashboard> {
    return this.http.get<ApiResponse<MeDashboard>>(`${this.apiUrl}/dashboard`, this.getHeaders()).pipe(
      map(res => res.data)
    );
  }

  getEnrollments(): Observable<MeEnrollmentItem[]> {
    return this.http.get<ApiResponse<MeEnrollmentItem[]>>(`${this.apiUrl}/enrollments`, this.getHeaders()).pipe(
      map(res => res.data || [])
    );
  }

  getRecentReceipts(limit = 10): Observable<MeReceiptItem[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<ApiResponse<MeReceiptItem[]>>(`${this.apiUrl}/receipts`, {
      ...this.getHeaders(),
      params
    }).pipe(
      map(res => res.data || [])
    );
  }

  getNotifications(limit = 15): Observable<MeNotificationItem[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<ApiResponse<MeNotificationItem[]>>(`${this.apiUrl}/notifications`, {
      ...this.getHeaders(),
      params
    }).pipe(
      map(res => {
        const readIds = this.getReadNotificationIds();
        return (res.data || []).map(item => ({
          ...item,
          unread: !readIds.has(item.id)
        }));
      })
    );
  }

  getPendingDues(): Observable<MeDueItem[]> {
    return this.http.get<ApiResponse<MeDueItem[]>>(`${this.apiUrl}/dues`, this.getHeaders()).pipe(
      map(res => res.data || [])
    );
  }

  downloadReceiptPdf(receiptId: number): Observable<Blob> {
    let headers = new HttpHeaders();
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      headers = headers.set('X-Tenant-Id', tenantId);
    }
    return this.http.get(`${this.apiUrl}/receipts/${receiptId}/pdf`, {
      headers,
      responseType: 'blob'
    });
  }

  markNotificationRead(notificationId: string): void {
    const readIds = this.getReadNotificationIds();
    readIds.add(notificationId);
    this.saveReadNotificationIds(readIds);
  }

  markAllNotificationsRead(notificationIds: string[]): void {
    const readIds = this.getReadNotificationIds();
    notificationIds.forEach(id => readIds.add(id));
    this.saveReadNotificationIds(readIds);
  }

  private getReadNotificationIds(): Set<string> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return new Set();
    }
    const key = this.readStorageKey();
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return new Set();
      }
      const parsed = JSON.parse(raw);
      return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch {
      return new Set();
    }
  }

  private saveReadNotificationIds(ids: Set<string>): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    localStorage.setItem(this.readStorageKey(), JSON.stringify(Array.from(ids)));
  }

  private readStorageKey(): string {
    const userId = localStorage.getItem('userId') || 'anonymous';
    return `${this.READ_KEY_PREFIX}${userId}`;
  }

  private getHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      headers = headers.set('X-Tenant-Id', tenantId);
    }
    return { headers };
  }
}
