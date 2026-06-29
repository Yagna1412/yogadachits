import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const DEPOSITS_URL = 'http://localhost:8080/chitfunds/api/v1/bank-deposits';
const PAYMENTS_URL = 'http://localhost:8080/chitfunds/api/v1/bank-payments';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface BankTransactionItem {
  id: number;
  transactionType: string;
  bankAccount: string;
  transactionDate: string;
  voucherSeries: string;
  voucherNo: string;
  currentBalance: number;
  particularAccount: string;
  chequeNo: string;
  chequeDate: string;
  bankName: string;
  place: string;
  narration: string;
  amount: number;
  grandTotal: number;
}

export interface BankTransactionForm {
  transactionType?: string;
  bankAccount?: string;
  transactionDate?: string;
  voucherSeries?: string;
  voucherNo?: string;
  currentBalance?: number;
  particularAccount?: string;
  chequeNo?: string;
  chequeDate?: string;
  bankName?: string;
  place?: string;
  narration?: string;
  amount?: number;
  grandTotal?: number;
}

@Injectable({ providedIn: 'root' })
export class BankAccountService {
  private platformId = inject(PLATFORM_ID);
  private apiUrl = '/chitfunds/api/admin/account-bank';
  // private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/admin/account-bank';

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

  getDeposits(searchTerm?: string): Observable<ApiResponse<BankTransactionItem[]>> {
    let params = new HttpParams();
    if (searchTerm?.trim()) params = params.set('searchTerm', searchTerm.trim());
    return this.http.get<ApiResponse<BankTransactionItem[]>>(DEPOSITS_URL, {
      ...this.getAuthHeaders(), params
    }).pipe(catchError(err => of({
      success: false,
      message: this.extractApiMessage(err, 'Unable to load bank deposits.'),
      data: []
    })));
  }

  getPayments(searchTerm?: string): Observable<ApiResponse<BankTransactionItem[]>> {
    let params = new HttpParams();
    if (searchTerm?.trim()) params = params.set('searchTerm', searchTerm.trim());
    return this.http.get<ApiResponse<BankTransactionItem[]>>(PAYMENTS_URL, {
      ...this.getAuthHeaders(), params
    }).pipe(catchError(err => of({
      success: false,
      message: this.extractApiMessage(err, 'Unable to load bank payments.'),
      data: []
    })));
  }

  getDepositFormDefaults(): Observable<ApiResponse<BankTransactionForm>> {
    return this.http.get<ApiResponse<BankTransactionForm>>(`${DEPOSITS_URL}/form-defaults`, this.getAuthHeaders())
      .pipe(catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to load deposit form defaults.'),
        data: null
      })));
  }

  getPaymentFormDefaults(): Observable<ApiResponse<BankTransactionForm>> {
    return this.http.get<ApiResponse<BankTransactionForm>>(`${PAYMENTS_URL}/form-defaults`, this.getAuthHeaders())
      .pipe(catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Unable to load payment form defaults.'),
        data: null
      })));
  }

  saveDeposit(data: BankTransactionForm): Observable<ApiResponse<BankTransactionItem>> {
    return this.http.post<ApiResponse<BankTransactionItem>>(`${DEPOSITS_URL}/process`, data, this.getAuthHeaders())
      .pipe(catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Failed to save bank deposit.'),
        data: null
      })));
  }

  savePayment(data: BankTransactionForm): Observable<ApiResponse<BankTransactionItem>> {
    return this.http.post<ApiResponse<BankTransactionItem>>(`${PAYMENTS_URL}/process`, data, this.getAuthHeaders())
      .pipe(catchError(err => of({
        success: false,
        message: this.extractApiMessage(err, 'Failed to save bank payment.'),
        data: null
      })));
  }
}
