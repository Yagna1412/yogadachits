import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const BASE_URL = 'http://3.108.194.139:8080/chitfunds/api/v1/bid-payments';
const PAYOUT_URL = 'http://3.108.194.139:8080/chitfunds/api/v1/payouts';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
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

  getPayments(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(PAYOUT_URL, this.getAuthHeaders()).pipe(
      catchError(err => of({ success: false, message: err.message, data: [] }))
    );
  }

  getBidPaymentDetails(auctionId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${BASE_URL}/auction/${auctionId}`, this.getAuthHeaders()).pipe(
      catchError(err => of({ success: false, message: err.message, data: null }))
    );
  }

  processPayment(paymentData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${BASE_URL}/process`, paymentData, this.getAuthHeaders()).pipe(
      catchError(err => of({ success: false, message: err.message, data: null }))
    );
  }
}
