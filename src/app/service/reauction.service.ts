import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export interface PreviousWinnerInfo {
    ticket: string;
    name: string;
    bidAmount: number;
    auctionDate: string;
    netPayable: number;
}

export interface EligibleMember {
    enrollmentId: number;
    memberName: string;
    ticketNo: string;
}

export interface PastAuction {
    auctionId: number;
    auctionNumber: number;
    winner: string;
    amount: number;
    date: string;
}

export interface ReAuctionDetailsResponse {
    auctionId: number;
    chitGroupId: number;
    chitGroupName: string;
    auctionNumber: number;
    chitAmount: number;
    status: string;
    failureReason: string;
    previousWinner: PreviousWinnerInfo;
    eligibleMembers: EligibleMember[];
    pastAuctions: PastAuction[];
}

export interface ReAuctionPreviewRequest {
    auctionId: number;
    newWinnerEnrollmentId: number;
    newBidAmount: number;
}

export interface ReAuctionPreviewResponse {
    newWinnerName: string;
    newWinnerTicket: string;
    newBidAmount: number;
    netPayable: number;
    bidDifference: number;
    payableDifference: number;
    previousWinnerName: string;
    previousBidAmount: number;
    previousNetPayable: number;
}

export interface ReAuctionConfirmRequest {
    auctionId: number;
    newWinnerEnrollmentId: number;
    newBidAmount: number;
    reason: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    timestamp?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReAuctionService {
    private baseUrl = 'http://localhost:8080/chitfunds/api/v1/re-auctions';
    // private baseUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/re-auctions';

    constructor(private http: HttpClient) { }

    private request<T>(obs: Observable<ApiResponse<T>>, fallbackMessage: string): Observable<ApiResponse<T>> {
        return obs.pipe(
            timeout(30000),
            catchError((err) => of({
                success: false,
                message: err?.error?.message || err?.message || fallbackMessage,
                data: null,
            }))
        );
    }

    getReAuctionDetails(auctionId: number): Observable<ApiResponse<ReAuctionDetailsResponse>> {
        return this.request(
            this.http.get<ApiResponse<ReAuctionDetailsResponse>>(`${this.baseUrl}/details/${auctionId}`),
            'Unable to load re-auction details.'
        );
    }

    getReAuctionDetailsByChitGroup(chitGroupId: number): Observable<ApiResponse<ReAuctionDetailsResponse>> {
        return this.request(
            this.http.get<ApiResponse<ReAuctionDetailsResponse>>(`${this.baseUrl}/chit-group/${chitGroupId}`),
            'Unable to load re-auction details.'
        );
    }

    previewReAuction(request: ReAuctionPreviewRequest): Observable<ApiResponse<ReAuctionPreviewResponse>> {
        return this.request(
            this.http.post<ApiResponse<ReAuctionPreviewResponse>>(`${this.baseUrl}/preview`, request),
            'Unable to preview re-auction.'
        );
    }

    confirmReAuction(request: ReAuctionConfirmRequest): Observable<ApiResponse<string>> {
        return this.request(
            this.http.post<ApiResponse<string>>(`${this.baseUrl}/confirm`, request),
            'Failed to confirm re-auction.'
        );
    }

    getReasonOptions(): Observable<ApiResponse<string[]>> {
        return this.request(
            this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/reasons`),
            'Unable to load reason options.'
        );
    }

    getLatestEligibleReAuction(): Observable<ApiResponse<ReAuctionDetailsResponse>> {
        return this.request(
            this.http.get<ApiResponse<ReAuctionDetailsResponse>>(`${this.baseUrl}/latest`),
            'Unable to load re-auction details.'
        );
    }
}
