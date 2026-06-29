import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

const BASE_URL = 'http://localhost:8080/chitfunds/api/v1/bid-advances';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface BidAdvanceListItem {
  id: number;
  enrollmentId: number;
  groupName: string;
  ticketNo: string;
  paidTo: string;
  series: string;
  no: string;
  transactionDate: string;
  account: string;
  amount: number;
  narration: string;
  chequeNumber: string;
  chequeDate: string | null;
  currentInstallmentNo: number;
  paidUpTo: string;
  chitAmount: number;
  companyCommission: number;
  advanceAmount: number;
  adjustmentAmount: number;
  totalPaid: number;
}

export interface EligibleEnrollmentOption {
  enrollmentId: number;
  chitGroupId: number;
  groupName: string;
  ticketNo: string;
  memberName: string;
  chitAmount: number;
  existingAdvanceTotal: number;
  label: string;
}

export interface BidAdvanceFormDetails {
  enrollmentId?: number;
  groupName: string;
  ticketNo: string;
  paidTo: string;
  series: string;
  no?: string;
  transactionDate?: string;
  account?: string;
  amount?: number;
  narration?: string;
  chequeNumber?: string;
  chequeDate?: string | null;
  currentInstallmentNo?: number;
  paidUpTo?: string;
  chitAmount?: number;
  companyCommission?: number;
  advanceAmount?: number;
  adjustmentAmount?: number;
  totalPaid?: number;
}

export interface BidAdvanceSaveRequest {
  enrollmentId?: number;
  groupName?: string;
  ticketNo?: string;
  paidTo?: string;
  series?: string;
  no?: string;
  transactionDate: string;
  account: string;
  amount: number;
  narration?: string;
  chequeNumber?: string;
  chequeDate?: string | null;
  currentInstallmentNo?: number;
  paidUpTo?: string;
  chitAmount?: number;
  companyCommission?: number;
  advanceAmount?: number;
  adjustmentAmount?: number;
  totalPaid?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BidAdvanceService {
  private platformId = inject(PLATFORM_ID);
  // Update this to match your actual backend URL/port
  private apiUrl = '/chitfunds/api/v1/bid-advances';
  // private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/bid-advances';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';
    }
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  private extractApiMessage(err: any, fallback: string): string {
    if (err?.error?.message) {
      return err.error.message;
    }
    if (typeof err?.error === 'string') {
      return err.error;
    }
    return fallback;
  }

  getAdvances(searchTerm?: string): Observable<ApiResponse<BidAdvanceListItem[]>> {
    let params = new HttpParams();
    if (searchTerm?.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }
    return this.http.get<ApiResponse<BidAdvanceListItem[]>>(BASE_URL, {
      ...this.getAuthHeaders(),
      params
    }).pipe(
      catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to load bid advances.'),
        data: []
      }))
    );
  }

  getEligibleEnrollments(): Observable<ApiResponse<EligibleEnrollmentOption[]>> {
    return this.http.get<ApiResponse<EligibleEnrollmentOption[]>>(`${BASE_URL}/eligible-enrollments`, this.getAuthHeaders()).pipe(
      timeout(60000),
      catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to load members. Please ensure the backend is running.'),
        data: []
      }))
    );
  }

  getEnrollmentsByChitGroup(chitGroupId: number): Observable<ApiResponse<EligibleEnrollmentOption[]>> {
    return this.http.get<ApiResponse<EligibleEnrollmentOption[]>>(
      `${BASE_URL}/chit-group/${chitGroupId}/enrollments`,
      this.getAuthHeaders()
    ).pipe(
      timeout(20000),
      catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to load members for this group.'),
        data: []
      }))
    );
  }

  getFormDetails(enrollmentId: number): Observable<ApiResponse<BidAdvanceFormDetails>> {
    return this.http.get<ApiResponse<BidAdvanceFormDetails>>(`${BASE_URL}/enrollment/${enrollmentId}`, this.getAuthHeaders()).pipe(
      catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to load member details.'),
        data: null
      }))
    );
  }

  lookupFormDetails(groupName: string, ticketNo: string): Observable<ApiResponse<BidAdvanceFormDetails>> {
    const params = new HttpParams()
      .set('groupName', groupName)
      .set('ticketNo', ticketNo);
    return this.http.get<ApiResponse<BidAdvanceFormDetails>>(`${BASE_URL}/lookup`, {
      ...this.getAuthHeaders(),
      params
    }).pipe(
      catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to find member for this group and ticket.'),
        data: null
      }))
    );
  }

  saveAdvance(payload: BidAdvanceSaveRequest): Observable<ApiResponse<BidAdvanceListItem>> {
    return this.http.post<ApiResponse<BidAdvanceListItem>>(`${BASE_URL}/process`, payload, this.getAuthHeaders()).pipe(
      catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Failed to save bid advance.'),
        data: null
      }))
    );
  }
}
