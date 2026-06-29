import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const RECEIPTS_URL = '/chitfunds/api/v1/cash-receipts';
const PAYMENTS_URL = '/chitfunds/api/v1/cash-payments';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface CashTransactionItem {
  id: number;
  transactionType: string;
  account: string;
  transactionDate: string;
  voucherSeries: string;
  voucherNo: string;
  currentBalance: number;
  particularAccount: string;
  narration: string;
  amount: number;
  grandTotal: number;
}

export interface CashTransactionForm {
  transactionType?: string;
  account?: string;
  transactionDate?: string;
  voucherSeries?: string;
  voucherNo?: string;
  currentBalance?: number;
  particularAccount?: string;
  narration?: string;
  amount?: number;
  grandTotal?: number;
}

@Injectable({ providedIn: 'root' })
export class CashAccountService {
  private platformId = inject(PLATFORM_ID);
  private apiUrl = '/chitfunds/api/admin/account-cash';
  // private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/admin/account-cash';

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
    if (err?.error?.message) return err.error.message;
    if (typeof err?.error === 'string') return err.error;
    return fallback;
  }

  getReceipts(searchTerm?: string): Observable<ApiResponse<CashTransactionItem[]>> {
    let params = new HttpParams();
    if (searchTerm?.trim()) params = params.set('searchTerm', searchTerm.trim());
    return this.http.get<ApiResponse<CashTransactionItem[]>>(RECEIPTS_URL, {
      ...this.getAuthHeaders(), params
    }).pipe(catchError(err => of({
      success: false,
      message: this.extractApiMessage(err, 'Unable to load cash receipts.'),
      data: []
    })));
  }

  getPayments(searchTerm?: string): Observable<ApiResponse<CashTransactionItem[]>> {
    let params = new HttpParams();
    if (searchTerm?.trim()) params = params.set('searchTerm', searchTerm.trim());
    return this.http.get<ApiResponse<CashTransactionItem[]>>(PAYMENTS_URL, {
      ...this.getAuthHeaders(), params
    }).pipe(catchError(err => of({
      success: false,
      message: this.extractApiMessage(err, 'Unable to load cash payments.'),
      data: []
    })));
  }

  getReceiptFormDefaults(): Observable<ApiResponse<CashTransactionForm>> {
    return this.http.get<ApiResponse<CashTransactionForm>>(`${RECEIPTS_URL}/form-defaults`, this.getAuthHeaders())
      .pipe(catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to load receipt form defaults.'),
        data: null
      })));
  }

  getPaymentFormDefaults(): Observable<ApiResponse<CashTransactionForm>> {
    return this.http.get<ApiResponse<CashTransactionForm>>(`${PAYMENTS_URL}/form-defaults`, this.getAuthHeaders())
      .pipe(catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to load payment form defaults.'),
        data: null
      })));
  }

  saveReceipt(data: CashTransactionForm): Observable<ApiResponse<CashTransactionItem>> {
    return this.http.post<ApiResponse<CashTransactionItem>>(`${RECEIPTS_URL}/process`, data, this.getAuthHeaders())
      .pipe(catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Failed to save cash receipt.'),
        data: null
      })));
  }

  savePayment(data: CashTransactionForm): Observable<ApiResponse<CashTransactionItem>> {
    return this.http.post<ApiResponse<CashTransactionItem>>(`${PAYMENTS_URL}/process`, data, this.getAuthHeaders())
      .pipe(catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Failed to save cash payment.'),
        data: null
      })));
  }
}
