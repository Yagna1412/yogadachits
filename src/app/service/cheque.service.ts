import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ChequeResponse {
    id: number;
    chequeNo: string;
    bank: string;
    member: string;
    amount: number;
    status: string;
    dueDate?: string;
    chequeDate?: string;
    clearedDate?: string;
    bouncedDate?: string;
    reason?: string;
}

export interface ChequeSummary {
    pendingCount: number;
    pendingAmount: number;
    clearedCount: number;
    clearedAmount: number;
    bouncedCount: number;
    bouncedAmount: number;
}

@Injectable({
    providedIn: 'root'
})
export class ChequeService {

    private baseUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/cheque-management';

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

    getSummary(): Observable<ApiResponse<ChequeSummary>> {
        return this.http.get<ApiResponse<ChequeSummary>>(`${this.baseUrl}/summary`, this.getAuthHeaders());
    }

    getPending(): Observable<ApiResponse<ChequeResponse[]>> {
        return this.http.get<ApiResponse<ChequeResponse[]>>(`${this.baseUrl}/cheques/status/PENDING`, this.getAuthHeaders());
    }

    getCleared(): Observable<ApiResponse<ChequeResponse[]>> {
        return this.http.get<ApiResponse<ChequeResponse[]>>(`${this.baseUrl}/cheques/status/CLEARED`, this.getAuthHeaders());
    }

    getBounced(): Observable<ApiResponse<ChequeResponse[]>> {
        return this.http.get<ApiResponse<ChequeResponse[]>>(`${this.baseUrl}/cheques/status/BOUNCED`, this.getAuthHeaders());
    }

    updateStatus(id: number, status: string): Observable<ApiResponse<ChequeResponse>> {
        return this.http.put<ApiResponse<ChequeResponse>>(
            `${this.baseUrl}/cheques/${id}/status?status=${status}`,
            {},
            this.getAuthHeaders()
        );
    }
}
