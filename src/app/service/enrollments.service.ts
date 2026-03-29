import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    timestamp?: string;
}

export interface EnrollmentResponse {
    id: number;
    memberId?: number;
    memberName?: string;
    chitGroupId?: number;
    chitGroupName?: string;
    ticketNo?: number;
    businessAgentId?: number;
    businessAgentName?: string;
    collectionAgentId?: number;
    collectionAgentName?: string;
    status?: string;
    createdAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class EnrollmentsService {

    private platformId = inject(PLATFORM_ID);
    private apiUrl = 'http://localhost:8080/chitfunds/api/v1/enrollments';

    constructor(private http: HttpClient) { }

    private getHeaders(): { headers: HttpHeaders } {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('token');
            if (token) {
                headers = headers.set('Authorization', `Bearer ${token}`);
            }
        }
        return { headers };
    }

    private cachedEnrollments: EnrollmentResponse[] | null = null;

    getEnrollments(forceRefresh = false): Observable<ApiResponse<EnrollmentResponse[]>> {
        if (!forceRefresh && this.cachedEnrollments) {
            return of({
                success: true,
                message: 'Loaded from cache',
                data: this.cachedEnrollments
            });
        }
        return this.http.get<ApiResponse<EnrollmentResponse[]>>(
            this.apiUrl, this.getHeaders()
        ).pipe(
            tap((res: any) => {
                if (res && res.data && Array.isArray(res.data)) {
                    this.cachedEnrollments = res.data;
                }
            }),
            catchError(() => of({
                success: false,
                message: 'Failed to load enrollments',
                data: null
            } as ApiResponse<EnrollmentResponse[]>))
        );
    }

    createEnrollment(payload: any): Observable<ApiResponse<EnrollmentResponse>> {
        return this.http.post<ApiResponse<EnrollmentResponse>>(
            this.apiUrl, payload, this.getHeaders()
        ).pipe(
            tap((res: any) => {
                if (res && res.success) {
                    this.cachedEnrollments = null; // Invalidate cache so the next background fetch actually queries
                }
            }),
            catchError(() => of({
                success: false,
                message: 'Failed to create enrollment',
                data: null
            } as ApiResponse<EnrollmentResponse>))
        );
    }
}