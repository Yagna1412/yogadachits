import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    constructor(private http: HttpClient) { }

    listChitGroups(): Observable<ApiResponse<ChitGroupDto[]>> {
        return this.http.get<ApiResponse<ChitGroupDto[]>>(`${BASE}/chit-groups`).pipe(
            catchError(() => of({ success: false, message: 'error', data: [] } as ApiResponse<ChitGroupDto[]>))
        );
    }

    listAuctions(): Observable<ApiResponse<AuctionResponse[]>> {
        return this.http.get<ApiResponse<AuctionResponse[]>>(`${BASE}/auctions`).pipe(
            catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<AuctionResponse[]>))
        );
    }

    listBids(auctionId: number): Observable<ApiResponse<AuctionBidResponse[]>> {
        return this.http.get<ApiResponse<AuctionBidResponse[]>>(`${BASE}/auctions/${auctionId}/bids`).pipe(
            catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<AuctionBidResponse[]>))
        );
    }

    getEnrollments(chitGroupId: number): Observable<ApiResponse<EnrollmentResponse[]>> {
        return this.http.get<ApiResponse<EnrollmentResponse[]>>(`${BASE}/enrollments/chit-group/${chitGroupId}`).pipe(
            catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<EnrollmentResponse[]>))
        );
    }

    createBid(req: CreateBidRequest): Observable<ApiResponse<AuctionBidResponse>> {
        return this.http.post<ApiResponse<AuctionBidResponse>>(`${BASE}/auctions/bids`, req).pipe(
            catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<AuctionBidResponse>))
        );
    }

    selectWinner(auctionId: number, bidId: number): Observable<ApiResponse<AuctionResponse>> {
        return this.http.put<ApiResponse<AuctionResponse>>(`${BASE}/auctions/${auctionId}/winner/${bidId}`, {}).pipe(
            catchError(() => of({ success: false, message: 'error', data: null } as ApiResponse<AuctionResponse>))
        );
    }
}