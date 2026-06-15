import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, timeout } from 'rxjs';
import { catchError } from 'rxjs/operators';

const BASE_URL = 'http://localhost:8080/chitfunds/api/v1/bid-payments';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface BidPaymentListItem {
  id: number;
  auctionId: number;
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
  currentInstallment: number;
  paidUpTo: number;
  auctionOn: string;
  installmentMonth: string;
  chitAmount: number;
  companyCommission: number;
  bidAmount: number;
  bidPayable: number;
  bpAdjustment: number;
  advanceAdjustment: number;
  paidAmount: number;
  netPayable: number;
}

export interface EligibleAuctionOption {
  id: number;
  groupName: string;
  memberName: string;
  ticketNo: string;
  auctionNumber: number;
  auctionDate?: string;
  installmentMonth?: string;
  bidAmount?: number;
  netPayable?: number;
  alreadyDisbursed?: boolean;
  label: string;
}

/** Matches backend BidPaymentDTO form/details response */
export interface BidPaymentFormDetails {
  auctionId: number;
  enrollmentId?: number;
  subscriberId?: number;
  groupName: string;
  ticketNo: string;
  paidTo: string;
  series: string;
  auctionOn?: string;
  currentInstallment?: number;
  installmentMonth?: string;
  chitAmount?: number;
  companyCommission?: number;
  bidAmount?: number;
  bidPayable?: number;
  netPayable?: number;
  transactionDate?: string;
  account?: string;
  amount?: number;
  narration?: string;
  chequeNumber?: string;
  chequeDate?: string | null;
  bpAdjustment?: number;
  advanceAdjustment?: number;
}

/** Payload sent to POST /process — maps to backend BidPaymentDTO */
export interface BidPaymentSaveRequest {
  auctionId: number;
  enrollmentId?: number;
  subscriberId?: number;
  groupName?: string;
  ticketNo?: string;
  paidTo?: string;
  series?: string;
  currentInstallment?: number;
  installmentMonth?: string;
  chitAmount?: number;
  companyCommission?: number;
  bidAmount?: number;
  bidPayable?: number;
  netPayable?: number;
  transactionDate: string;
  account: string;
  amount: number;
  narration?: string;
  chequeNumber?: string;
  chequeDate?: string | null;
  bpAdjustment?: number;
  advanceAdjustment?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BidPaymentsService {

  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    let token = '';

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';
    }

    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
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

  getPayments(searchTerm?: string): Observable<ApiResponse<BidPaymentListItem[]>> {
    let params = new HttpParams();
    if (searchTerm?.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }
    return this.http.get<ApiResponse<BidPaymentListItem[]>>(BASE_URL, {
      ...this.getAuthHeaders(),
      params
    }).pipe(
      catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to load bid payments.'),
        data: []
      }))
    );
  }

  getEligibleAuctions(): Observable<ApiResponse<EligibleAuctionOption[]>> {
    return this.http.get<ApiResponse<EligibleAuctionOption[]>>(`${BASE_URL}/eligible-auctions`, this.getAuthHeaders()).pipe(
      timeout(20000),
      catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to load completed auctions. Please ensure the backend is running.'),
        data: []
      }))
    );
  }

  getBidPaymentDetails(auctionId: number): Observable<ApiResponse<BidPaymentFormDetails>> {
    return this.http.get<ApiResponse<BidPaymentFormDetails>>(`${BASE_URL}/auction/${auctionId}`, this.getAuthHeaders());
  }

  processPayment(paymentData: BidPaymentSaveRequest): Observable<ApiResponse<BidPaymentListItem>> {
    return this.http.post<ApiResponse<BidPaymentListItem>>(`${BASE_URL}/process`, paymentData, this.getAuthHeaders());
  }
}
