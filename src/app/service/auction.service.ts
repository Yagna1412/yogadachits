import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

const BASE = 'http://localhost:8080/chitfunds/api/v1';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    timestamp?: string;
}

export interface ChitGroupDto {
    id: number;
    groupName: string;
    chitAmount: number;
}

export interface AuctionResponse {
    id: number;
    chitGroupId: number;
    chitAmount?: number;
    groupName?: string;
    maxMembers?: number;
    companyCommissionPct?: number;
    auctionNumber: number;
    auctionDate: string;
    winnerEnrollmentId?: number;
    bidderType?: string;
    winningBidId?: number;
    winningBidAmount?: number;
    bidLossAmount?: number;
    dividendSnapshot?: number;
    dividendPerMember?: number;
    installmentDueDate?: string;
    installmentNo?: number;
    winnerSubscriberId?: number;
    netPayable?: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuctionBidResponse {
    id: number;
    auctionId: number;
    enrollmentId: number;
    bidAmount: number;
    bidTime: string;
    isWinning: boolean;
    channel: string;
    createdAt: string;
}

export interface EnrollmentResponse {
    id: number;
    subscriberId: number;
    subscriberName: string;
    chitGroupId: number;
    ticketNo: number;
    status: string;
}

export interface CreateBidRequest {
    auctionId: number;
    enrollmentId: number;
    bidAmount: number;
    channel?: string;
}

@Injectable({ providedIn: 'root' })
export class AuctionsService {
    private platformId = inject(PLATFORM_ID);
    constructor(private http: HttpClient) { }

    // ── In-memory caches (singleton, survive route changes) ──────────────────
    private _chitGroups$   : Observable<ApiResponse<ChitGroupDto[]>>   | null = null;
    private _auctions$     : Observable<ApiResponse<AuctionResponse[]>> | null = null;
    private _enrollments$  : Map<number, Observable<ApiResponse<EnrollmentResponse[]>>> = new Map();

    clearAuctionsCache()  { this._auctions$    = null; }
    clearChitGroupsCache(){ this._chitGroups$   = null; }
    clearEnrollmentsCache(chitGroupId?: number) {
        if (chitGroupId !== undefined) { this._enrollments$.delete(chitGroupId); }
        else { this._enrollments$.clear(); }
    }

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

    listChitGroups(): Observable<ApiResponse<ChitGroupDto[]>> {
        if (!this._chitGroups$) {
            this._chitGroups$ = this.http
                .get<ApiResponse<ChitGroupDto[]>>(`${BASE}/chit-groups`, this.getHeaders())
                .pipe(
                    shareReplay(1),
                    catchError(() => of({ success: false, message: 'error', data: [] } as ApiResponse<ChitGroupDto[]>))
                );
        }
        return this._chitGroups$;
    }

    listAuctions(): Observable<ApiResponse<AuctionResponse[]>> {
        if (!this._auctions$) {
            this._auctions$ = this.http
                .get<ApiResponse<AuctionResponse[]>>(`${BASE}/auctions`, this.getHeaders())
                .pipe(
                    shareReplay(1),
                    catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<AuctionResponse[]>))
                );
        }
        return this._auctions$;
    }

    listBids(auctionId: number): Observable<ApiResponse<AuctionBidResponse[]>> {
        return this.http.get<ApiResponse<AuctionBidResponse[]>>(`${BASE}/auctions/${auctionId}/bids`, this.getHeaders()).pipe(
            catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<AuctionBidResponse[]>))
        );
    }

    getEnrollments(chitGroupId: number): Observable<ApiResponse<EnrollmentResponse[]>> {
        if (!this._enrollments$.has(chitGroupId)) {
            const req$ = this.http
                .get<ApiResponse<EnrollmentResponse[]>>(`${BASE}/enrollments/chit-group/${chitGroupId}`, this.getHeaders())
                .pipe(
                    shareReplay(1),
                    catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<EnrollmentResponse[]>))
                );
            this._enrollments$.set(chitGroupId, req$);
        }
        return this._enrollments$.get(chitGroupId)!;
    }

    createBid(req: CreateBidRequest): Observable<ApiResponse<AuctionBidResponse>> {
        this.clearAuctionsCache(); // Bust so next load reflects new bid state
        return this.http.post<ApiResponse<AuctionBidResponse>>(`${BASE}/auctions/bids`, req, this.getHeaders()).pipe(
            catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<AuctionBidResponse>))
        );
    }

    selectWinner(auctionId: number, bidId: number): Observable<ApiResponse<AuctionResponse>> {
        this.clearAuctionsCache(); // Bust so winner state is fresh on re-visit
        return this.http.put<ApiResponse<AuctionResponse>>(`${BASE}/auctions/${auctionId}/winner/${bidId}`, {}, this.getHeaders()).pipe(
            catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<AuctionResponse>))
        );
    }
}