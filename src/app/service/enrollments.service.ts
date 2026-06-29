import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp?: string;
}

export interface EnrollmentResponse {
  id: number;
  memberId?: number;
  memberName?: string;
  chitGroupId?: number;
  chitGroupName?: string;
  ticketNo?: number;
  businessAgentId?: number;
  businessAgentName?: string;
  collectionAgentId?: number;
  collectionAgentName?: string;
  status?: string;
  createdAt?: string;
}

export interface EnrollmentPayload {
  memberId: number;
  subscriberId: number;
  chitGroupId: number;
  businessAgentId?: number | null;
  collectionAgentId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentsService {

  private platformId = inject(PLATFORM_ID);
  private apiUrl = '/chitfunds/api/v1/enrollments';
  // private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/enrollments';

  constructor(private http: HttpClient) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Id': '1'
    });
    if (this.isBrowser()) {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp * 1000 < Date.now();
          if (!isExpired) {
            headers = headers.set('Authorization', `Bearer ${token}`);
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
          }
        } catch {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
        }
      }
    }
    return { headers };
  }

  getEnrollments(): Observable<ApiResponse<EnrollmentResponse[]>> {
    if (!this.isBrowser()) {
      return of({ success: true, message: '', data: [] });
    }
    return this.http.get<ApiResponse<EnrollmentResponse[]>>(this.apiUrl, this.getHeaders());
  }

  getEnrollmentById(enrollmentId: number): Observable<ApiResponse<EnrollmentResponse>> {
    if (!this.isBrowser()) {
      return of({ success: false, message: '', data: null });
    }
    return this.http.get<ApiResponse<EnrollmentResponse>>(
      `${this.apiUrl}/${enrollmentId}`, this.getHeaders()
    );
  }

  getInstallmentsByEnrollmentId(enrollmentId: number): Observable<ApiResponse<any[]>> {
    if (!this.isBrowser()) {
      return of({ success: true, message: '', data: [] });
    }
    return this.http.get<ApiResponse<any[]>>(
      `/chitfunds/api/v1/installments?enrollmentId=${enrollmentId}`,
      // `http://3.108.194.139:8080/chitfunds/api/v1/installments?enrollmentId=${enrollmentId}`,
      this.getHeaders()
    );
  }

  createEnrollment(payload: EnrollmentPayload): Observable<ApiResponse<EnrollmentResponse>> {
    if (!this.isBrowser()) {
      return of({ success: false, message: 'Not available on server', data: null });
    }
    return this.http.post<ApiResponse<EnrollmentResponse>>(
      this.apiUrl, payload, this.getHeaders()
    );
  }

  createSubscriberForMember(memberId: number, displayName: string): Observable<ApiResponse<any>> {
    if (!this.isBrowser()) {
      return of({ success: false, message: 'Not available on server', data: null });
    }
    const payload = { subscriberType: 'member', memberId, displayName };
    return this.http.post<ApiResponse<any>>(
      '/chitfunds/api/v1/subscribers', payload, this.getHeaders()
      // 'http://3.108.194.139:8080/chitfunds/api/v1/subscribers', payload, this.getHeaders()
    ).pipe(
      catchError(() => of({
        success: false,
        message: 'Failed to create subscriber',
        data: null
      } as ApiResponse<any>))
    );
  }
}
