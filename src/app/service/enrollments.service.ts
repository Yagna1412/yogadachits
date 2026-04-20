import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
  private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/enrollments';

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Id': '1'
    });
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp * 1000 < Date.now();
          if (!isExpired) {
            headers = headers.set('Authorization', `Bearer ${token}`);
          } else {
            localStorage.removeItem('authToken');
          }
        } catch {
          localStorage.removeItem('authToken');
        }
      }
    }
    return { headers };
  }

  getEnrollments(): Observable<ApiResponse<EnrollmentResponse[]>> {
    return this.http.get<ApiResponse<EnrollmentResponse[]>>(
      this.apiUrl, this.getHeaders()
    ).pipe(
      catchError(() => of({
        success: false,
        message: 'Failed to load enrollments',
        data: null
      } as ApiResponse<EnrollmentResponse[]>))
    );
  }

  getEnrollmentById(enrollmentId: number): Observable<ApiResponse<EnrollmentResponse>> {
    return this.http.get<ApiResponse<EnrollmentResponse>>(
      `${this.apiUrl}/${enrollmentId}`, this.getHeaders()
    ).pipe(
      catchError(() => of({
        success: false,
        message: 'Failed to load enrollment details',
        data: null
      } as ApiResponse<EnrollmentResponse>))
    );
  }

  getInstallmentsByEnrollmentId(enrollmentId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `http://3.108.194.139:8080/chitfunds/api/v1/installments?enrollmentId=${enrollmentId}`,
      this.getHeaders()
    ).pipe(
      catchError(() => of({
        success: false,
        message: 'Failed to load installments',
        data: []
      } as ApiResponse<any[]>))
    );
  }

  createEnrollment(payload: EnrollmentPayload): Observable<ApiResponse<EnrollmentResponse>> {
    return this.http.post<ApiResponse<EnrollmentResponse>>(
      this.apiUrl, payload, this.getHeaders()
    ).pipe(
      catchError(() => of({
        success: false,
        message: 'Failed to create enrollment',
        data: null
      } as ApiResponse<EnrollmentResponse>))
    );
  }

  createSubscriberForMember(memberId: number, displayName: string): Observable<ApiResponse<any>> {
    const payload = { subscriberType: "member", memberId: memberId, displayName: displayName };
    return this.http.post<ApiResponse<any>>(
      'http://3.108.194.139:8080/chitfunds/api/v1/subscribers', payload, this.getHeaders()
    ).pipe(
      catchError(() => of({
        success: false,
        message: 'Failed to create subscriber',
        data: null
      } as ApiResponse<any>))
    );
  }
}
