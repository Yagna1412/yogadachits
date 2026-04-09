import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ReceiptResponse {
  id: number;
  enrollmentId: number;
  type?: string;           
  groupName?: string;      
  ticketNo?: string;       
  subscriberName?: string; 
  agentName?: string;      
  receiptDate: string;
  receiptNo: string;
  paymentMode: string;
  receiptAmount: number;
  bankName?: string;
  instrumentNo?: string;
  instrumentDate?: string;
  collectedByAgentId: number;
  notes: string;
  createdAt: string;
}

export interface ReceiptCreateRequest {
  enrollmentId: number;
  receiptType: string;
  receiptDate: string;
  receiptNo: string;
  paymentMode: string;
  receiptAmount: number;
  bankName?: string | null;
  instrumentNo?: string | null;
  instrumentDate?: string | null;
  collectedByAgentId?: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  
  private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/receipts'; 

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token'); 
    }
    if (token) {
      return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    return new HttpHeaders();
  }

  getReceipts(): Observable<ApiResponse<ReceiptResponse[]>> {
    return this.http.get<ApiResponse<ReceiptResponse[]>>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  createReceipt(request: ReceiptCreateRequest): Observable<ApiResponse<ReceiptResponse>> {
    return this.http.post<ApiResponse<ReceiptResponse>>(this.apiUrl, request, {
      headers: this.getAuthHeaders()
    });
  }

  deleteReceipt(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
