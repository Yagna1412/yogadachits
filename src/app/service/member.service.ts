import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface KpiCard {
    count: number;
    label: string;
    changePercent?: number;
    trend?: string;
    trendLabel?: string;
}

export interface MemberKpiSummary {
    totalMembers: KpiCard;
    activeMembers: KpiCard;
    enrolledMembers: KpiCard;
    pendingEnrollment: KpiCard;
}

export interface MemberResponse {
    id: number;
    title: string;
    name: string;
    mobileNumber: string;
    city: string;
    status: string;
}

export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root',
})
export class MemberService {
    // Ensure this URL matches your Spring Boot application properties context-path
    private apiUrl = 'http://localhost:8080/chitfunds/api/v1/members';

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): { headers: HttpHeaders } {
        const token = localStorage.getItem('token') || 'PASTE_YOUR_VALID_JWT_TOKEN_HERE';
        return {
            headers: new HttpHeaders({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            })
        };
    }

    getKpiSummary(): Observable<MemberKpiSummary> {
        return this.http.get<ApiResponse<MemberKpiSummary>>(`${this.apiUrl}/kpi`, this.getAuthHeaders())
            .pipe(map(response => response.data));
    }

    getMembers(): Observable<MemberResponse[]> {
        return this.http.get<ApiResponse<MemberResponse[]>>(this.apiUrl, this.getAuthHeaders())
            .pipe(map(response => response.data));
    }

    createMember(payload: any): Observable<MemberResponse> {
        // Sending the JSON payload correctly
        return this.http.post<ApiResponse<MemberResponse>>(this.apiUrl, payload, this.getAuthHeaders())
            .pipe(map(response => response.data));
    }

    deleteMember(id: number): Observable<string> {
        return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`, this.getAuthHeaders())
            .pipe(map(response => response.message));
    }
}