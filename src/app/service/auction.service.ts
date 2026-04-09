import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Client } from '@stomp/stompjs';

const BASE = 'http://localhost:8080/chitfunds/api/v1';
const WS_BASE = 'ws://localhost:8080/chitfunds/ws/auctions';

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

export interface AuctionSessionResponse {
    id: number;
    auctionId: number;
    sessionStatus: string;
    startedAt: string;
    endedAt?: string;
    durationSeconds: number;
    remainingSeconds: number;
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
    private _chitGroups$: Observable<ApiResponse<ChitGroupDto[]>> | null = null;
    private _auctions$: Observable<ApiResponse<AuctionResponse[]>> | null = null;
    private _enrollments$: Map<number, Observable<ApiResponse<EnrollmentResponse[]>>> = new Map();
    private stompClient: Client | null = null;

    clearAuctionsCache() { this._auctions$ = null; }
    clearChitGroupsCache() { this._chitGroups$ = null; }
    clearEnrollmentsCache(chitGroupId?: number) {
        if (chitGroupId !== undefined) { this._enrollments$.delete(chitGroupId); }
        else { this._enrollments$.clear(); }
    }

    startAuction(auctionId: number): Observable<ApiResponse<AuctionSessionResponse>> {
        return of({
            success: true,
            message: 'Mock Data Mode',
            data: { id: 1, auctionId, sessionStatus: 'Live', startedAt: '2026-04-09T10:00:00', durationSeconds: 600, remainingSeconds: 300 }
        });
    }

    getAuctionSession(auctionId: number): Observable<ApiResponse<AuctionSessionResponse>> {
        return of({
            success: true,
            message: 'Mock Data Mode',
            data: { id: 1, auctionId, sessionStatus: 'Live', startedAt: '2026-04-09T10:00:00', durationSeconds: 600, remainingSeconds: 300 }
        });
    }

    getAuctionById(auctionId: number): Observable<ApiResponse<AuctionResponse>> {
        return of({
            success: true,
            message: 'Mock Data Mode',
            data: { id: auctionId, chitGroupId: 1, auctionNumber: 1, auctionDate: '2026-01-01', status: 'Completed', maxMembers: 4, companyCommissionPct: 5, chitAmount: 500000, netPayable: 450000, winningBidAmount: 50000, createdAt: '', updatedAt: '' }
        });
    }

    connectToAuction(
        auctionId: number,
        onSessionUpdate: (session: AuctionSessionResponse) => void,
        onBidUpdate: (bid: AuctionBidResponse) => void
    ): void {
        // Disabling STOMP for Mock Data Mode
    }

    disconnectFromAuction(): void {
        // Disabling STOMP for Mock Data Mode
    }

    private getHeaders(): { headers: HttpHeaders } {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'X-Tenant-Id': '1'
        });
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('authToken')
                || localStorage.getItem('token')
                || localStorage.getItem('auth_token');
            if (token) {
                headers = headers.set('Authorization', `Bearer ${token}`);
            }
        }
        return { headers };
    }

    listChitGroups(): Observable<ApiResponse<ChitGroupDto[]>> {
        return of({
            success: true,
            message: 'Mock Data Mode',
            data: [
                { id: 1, groupName: 'T1-GROUP-01 (MOCKED)', chitAmount: 500000 },
                { id: 2, groupName: 'T2-GROUP-02 (MOCKED)', chitAmount: 1000000 }
            ]
        });
    }

    listAuctions(): Observable<ApiResponse<AuctionResponse[]>> {
        return of({
            success: true,
            message: 'Mock Data Mode',
            data: [
                { id: 1, chitGroupId: 1, auctionNumber: 1, auctionDate: '2026-01-01', status: 'Completed', chitAmount: 500000, maxMembers: 4, companyCommissionPct: 5, netPayable: 450000, winningBidAmount: 50000, createdAt: '', updatedAt: '' },
                { id: 2, chitGroupId: 1, auctionNumber: 2, auctionDate: '2026-02-01', status: 'Completed', chitAmount: 500000, maxMembers: 4, companyCommissionPct: 5, netPayable: 460000, winningBidAmount: 40000, createdAt: '', updatedAt: '' },
                { id: 3, chitGroupId: 1, auctionNumber: 3, auctionDate: '2026-03-01', status: 'Active', chitAmount: 500000, maxMembers: 4, companyCommissionPct: 5, createdAt: '', updatedAt: '' },
            ]
        });
    }

    listBids(auctionId: number): Observable<ApiResponse<AuctionBidResponse[]>> {
        return of({
            success: true,
            message: 'Mock Data Mode',
            data: [
                { id: 100, auctionId, enrollmentId: 10, bidAmount: 15000, bidTime: '', isWinning: false, channel: 'offline', createdAt: '' },
                { id: 101, auctionId, enrollmentId: 11, bidAmount: 25000, bidTime: '', isWinning: true, channel: 'offline', createdAt: '' }
            ]
        });
    }

    getEnrollments(chitGroupId: number): Observable<ApiResponse<EnrollmentResponse[]>> {
        return of({
            success: true,
            message: 'Mock Data Mode',
            data: [
                { id: 10, subscriberId: 100, subscriberName: 'John Doe', chitGroupId, ticketNo: 1, status: 'Active' },
                { id: 11, subscriberId: 101, subscriberName: 'Jane Smith', chitGroupId, ticketNo: 2, status: 'Active' },
                { id: 12, subscriberId: 102, subscriberName: 'Bob Builder', chitGroupId, ticketNo: 3, status: 'Active' },
                { id: 13, subscriberId: 103, subscriberName: 'Alice Green', chitGroupId, ticketNo: 4, status: 'Active' }
            ]
        });
    }

    createBid(req: CreateBidRequest): Observable<ApiResponse<AuctionBidResponse>> {
        return of({
            success: true,
            message: 'Mock Data Mode',
            data: { id: 999, auctionId: req.auctionId, enrollmentId: req.enrollmentId, bidAmount: req.bidAmount, bidTime: '', isWinning: true, channel: 'offline', createdAt: '' }
        });
    }

    selectWinner(auctionId: number, bidId: number): Observable<ApiResponse<AuctionResponse>> {
        return of({
            success: true,
            message: 'Mock Data Mode',
            data: { id: auctionId, chitGroupId: 1, auctionNumber: 3, auctionDate: '2026-03-01', status: 'Completed', maxMembers: 4, companyCommissionPct: 5, createdAt: '', updatedAt: '' }
        });
    }
}
