import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Client } from '@stomp/stompjs';
import { environment } from '../../enviornment/environment';

const BASE = environment.apiUrl ?? '/chitfunds/api/v1';
const WS_BASE = environment.wsUrl ?? 'ws://localhost:8080/chitfunds/ws/auctions';

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
  approvalStatus?: string;
  approvedAt?: string;
  approvedByName?: string;
  rejectionReason?: string;
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
    memberName?: string;
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

export interface AuctionKpiSummary {
    totalAuctions: number;
    upcomingAuctions: number;
    todaysAuctions: number;
    completedAuctions: number;
    liveSessions: number;
    pendingWinnerConfirmation: number;
    distinctChitGroups: number;
}

export interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface AuctionNotificationResponse {
    id: number;
    auctionId: number;
    enrollmentId?: number;
    recipientName?: string;
    recipientMobile: string;
    channel: string;
    status: string;
    message: string;
    errorMessage?: string;
    createdAt: string;
}

export interface AuctionNotifyResultResponse {
    auctionId: number;
    totalEligible: number;
    sentCount: number;
    skippedCount: number;
    failedCount: number;
    notifications: AuctionNotificationResponse[];
}

export interface AuctionListParams {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    chitGroupId?: number | null;
    hasWinner?: boolean | null;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDir?: string;
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
        return this.http.post<ApiResponse<AuctionSessionResponse>>(`${BASE}/auctions/${auctionId}/start`, {}, this.getHeaders()).pipe(
            catchError((err) => of({ success: false, message: err?.message || 'error', data: null } as ApiResponse<AuctionSessionResponse>))
        );
    }

    getAuctionSession(auctionId: number): Observable<ApiResponse<AuctionSessionResponse>> {
        return this.http.get<ApiResponse<AuctionSessionResponse>>(`${BASE}/auctions/${auctionId}/session`, this.getHeaders()).pipe(
            catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<AuctionSessionResponse>))
        );
    }

    getAuctionById(auctionId: number): Observable<ApiResponse<AuctionResponse>> {
        return this.http.get<ApiResponse<AuctionResponse>>(`${BASE}/auctions/${auctionId}`, this.getHeaders()).pipe(
            catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<AuctionResponse>))
        );
    }

    connectToAuction(
        auctionId: number,
        onSessionUpdate: (session: AuctionSessionResponse) => void,
        onBidUpdate: (bid: AuctionBidResponse) => void
    ): void {
        this.disconnectFromAuction();

        if (!isPlatformBrowser(this.platformId)) return;

        const token = localStorage.getItem('authToken')
            || localStorage.getItem('token')
            || localStorage.getItem('auth_token');

        if (!token) {
            console.error('Auction WebSocket: login required — no auth token found.');
            return;
        }

        const connectHeaders: { [key: string]: string } = {
            Authorization: `Bearer ${token}`,
        };

        const separator = WS_BASE.includes('?') ? '&' : '?';
        const brokerURL = `${WS_BASE}${separator}access_token=${encodeURIComponent(token)}`;

        this.stompClient = new Client({
            brokerURL,
            connectHeaders,
            reconnectDelay: 5000,
            onConnect: () => {
                // Subscribe to Session Updates
                this.stompClient?.subscribe(`/topic/auctions/${auctionId}`, (message) => {
                    if (message.body) {
                        try {
                            const session: AuctionSessionResponse = JSON.parse(message.body);
                            onSessionUpdate(session);
                        } catch (e) { console.error('Error parsing session data', e); }
                    }
                });

                // Subscribe to Live Bids
                this.stompClient?.subscribe(`/topic/auctions/${auctionId}/bids`, (message) => {
                    if (message.body) {
                        try {
                            const bid: AuctionBidResponse = JSON.parse(message.body);
                            onBidUpdate(bid);
                        } catch (e) { console.error('Error parsing bid data', e); }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message'], frame.body);
            },
            onWebSocketError: (event) => {
                console.error('Auction WebSocket connection failed. Check login token and backend availability.', event);
            },
        });

        this.stompClient.activate();
    }

    disconnectFromAuction(): void {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.stompClient = null;
        }
    }

    private getHeaders(): { headers: HttpHeaders } {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
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

    private mapApiError<T>(err: unknown, fallback: string): Observable<ApiResponse<T>> {
        const message = (err as { error?: { message?: string }; message?: string })?.error?.message
            || (err as { message?: string })?.message
            || fallback;
        return of({ success: false, message, data: null } as ApiResponse<T>);
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

    listAuctionsPaged(params: AuctionListParams = {}): Observable<PagedResponse<AuctionResponse>> {
        const query = new URLSearchParams();
        query.set('page', String(params.page ?? 0));
        query.set('size', String(params.size ?? 50));
        if (params.search?.trim()) query.set('search', params.search.trim());
        if (params.status?.trim()) query.set('status', params.status.trim());
        if (params.chitGroupId != null) query.set('chitGroupId', String(params.chitGroupId));
        if (params.hasWinner != null) query.set('hasWinner', String(params.hasWinner));
        if (params.dateFrom) query.set('dateFrom', params.dateFrom);
        if (params.dateTo) query.set('dateTo', params.dateTo);
        query.set('sortBy', params.sortBy ?? 'auctionNumber');
        query.set('sortDir', params.sortDir ?? 'asc');

        return this.http
            .get<ApiResponse<PagedResponse<AuctionResponse>>>(`${BASE}/auctions/paged?${query.toString()}`, this.getHeaders())
            .pipe(
                map(response => response.data ?? { content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 }),
                catchError(() => of({ content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 }))
            );
    }

    getKpiSummary(chitGroupId?: number | null): Observable<ApiResponse<AuctionKpiSummary>> {
        const query = chitGroupId != null ? `?chitGroupId=${chitGroupId}` : '';
        return this.http
            .get<ApiResponse<AuctionKpiSummary>>(`${BASE}/auctions/kpi${query}`, this.getHeaders())
            .pipe(catchError(() => of({
                success: false,
                message: 'Failed to load auction KPIs',
                data: null,
            } as ApiResponse<AuctionKpiSummary>)));
    }

    generateAuctionsForGroup(chitGroupId: number): Observable<ApiResponse<AuctionResponse[]>> {
        this.clearAuctionsCache();
        return this.http
            .post<ApiResponse<AuctionResponse[]>>(`${BASE}/auctions/generate/${chitGroupId}`, {}, this.getHeaders())
            .pipe(catchError((err) => this.mapApiError<AuctionResponse[]>(err, 'Failed to generate auction schedule.')));
    }

    sendAuctionIntimation(auctionId: number, forceResend = false): Observable<ApiResponse<AuctionNotifyResultResponse>> {
        return this.http
            .post<ApiResponse<AuctionNotifyResultResponse>>(
                `${BASE}/auctions/${auctionId}/notify?forceResend=${forceResend}`, {}, this.getHeaders())
            .pipe(catchError((err) => this.mapApiError<AuctionNotifyResultResponse>(err, 'Failed to send auction intimation.')));
    }

    listAuctionNotifications(auctionId: number): Observable<ApiResponse<AuctionNotificationResponse[]>> {
        return this.http
            .get<ApiResponse<AuctionNotificationResponse[]>>(`${BASE}/auctions/${auctionId}/notifications`, this.getHeaders())
            .pipe(catchError(() => of({ success: true, message: '', data: [] } as ApiResponse<AuctionNotificationResponse[]>)));
    }

    listBids(auctionId: number): Observable<ApiResponse<AuctionBidResponse[]>> {
        return this.http.get<ApiResponse<AuctionBidResponse[]>>(`${BASE}/auctions/${auctionId}/bids`, this.getHeaders()).pipe(
            catchError(() => of({ success: true, message: '', data: [] } as ApiResponse<AuctionBidResponse[]>))
        );
    }

    getEnrollmentsFresh(chitGroupId: number): Observable<ApiResponse<EnrollmentResponse[]>> {
        return this.http
            .get<ApiResponse<EnrollmentResponse[]>>(`${BASE}/enrollments/chit-group/${chitGroupId}`, this.getHeaders())
            .pipe(
                catchError(() => of({ success: true, message: '', data: [] } as ApiResponse<EnrollmentResponse[]>))
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
        this.clearAuctionsCache();
        return this.http.post<ApiResponse<AuctionBidResponse>>(`${BASE}/auctions/bids`, req, this.getHeaders()).pipe(
            catchError((err) => this.mapApiError<AuctionBidResponse>(err, 'Failed to submit bid.'))
        );
    }

    selectWinner(auctionId: number, bidId: number): Observable<ApiResponse<AuctionResponse>> {
        this.clearAuctionsCache();
        return this.http.put<ApiResponse<AuctionResponse>>(`${BASE}/auctions/${auctionId}/winner/${bidId}`, {}, this.getHeaders()).pipe(
            catchError((err) => this.mapApiError<AuctionResponse>(err, 'Failed to confirm winner.'))
        );
    }

    approveWinner(auctionId: number): Observable<ApiResponse<AuctionResponse>> {
        this.clearAuctionsCache();
        return this.http.post<ApiResponse<AuctionResponse>>(`${BASE}/auctions/${auctionId}/approve`, {}, this.getHeaders()).pipe(
            catchError((err) => this.mapApiError<AuctionResponse>(err, 'Failed to approve winner.'))
        );
    }

    rejectWinner(auctionId: number, reason?: string): Observable<ApiResponse<AuctionResponse>> {
        this.clearAuctionsCache();
        return this.http.post<ApiResponse<AuctionResponse>>(
            `${BASE}/auctions/${auctionId}/reject`,
            { reason: reason ?? null },
            this.getHeaders()
        ).pipe(
            catchError((err) => this.mapApiError<AuctionResponse>(err, 'Failed to reject winner.'))
        );
    }
}