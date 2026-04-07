import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MemberReceiptTableResponse {
  id: number; // Added ID for delete action
  receiptNo: string;
  memberName: string;
  groupName: string;
  amount: number;
  paymentMode: string;
  entryDate: string; 
}

export interface MemberReceiptCreateRequest {
  enrollmentId: number;
  receiptType: string;
  amount: number | null;
  paymentMode: string;
  bankName?: string;
  instrumentNo?: string;
  instrumentDate?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class MemberReceiptService {
  private apiUrl = 'http://localhost:8080/chitfunds/api/v1/member-receipts';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private getAuthHeaders(): { headers: HttpHeaders } {
    let token = '';
    
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }

    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }


  getReceiptTableData(): Observable<MemberReceiptTableResponse[]> {
    return this.http.get<ApiResponse<MemberReceiptTableResponse[]>>(
      `${this.apiUrl}/table`, 
      this.getAuthHeaders() 
    ).pipe(map(response => response.data));
  }

  getTodayKpi(): Observable<any> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/kpi/today`, 
      this.getAuthHeaders() 
    ).pipe(map(response => response.data));
  }

  createReceipt(request: MemberReceiptCreateRequest): Observable<string> {
    return this.http.post<ApiResponse<string>>(
      this.apiUrl, 
      request, 
      this.getAuthHeaders() 
    ).pipe(map(response => response.message));
  }

  deleteReceipt(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      this.getAuthHeaders()
    );
  }
}