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
    collectedByAgentId: number;
    notes: string;
    createdAt: string;
}

export interface ReceiptCreateRequest {
    enrollmentId: number;
    receiptDate: string;
    receiptNo: string;
    paymentMode: string;
    receiptAmount: number;
    collectedByAgentId?: number;
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReceiptService {

    private apiUrl = 'http://localhost:8080/chitfunds/api/v1/receipts';

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    private getAuthHeaders(): HttpHeaders {
        let token: string | null = null;

        if (isPlatformBrowser(this.platformId)) {
            token = localStorage.getItem('token');
        }

        if (token) {
            return new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
        }

        console.warn("No token found or running on server! Request may fail with 403 Forbidden.");
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
}