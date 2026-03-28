import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    auctionNumber: number;
    winner: string;
    amount: number;
    date: string;
}

export interface ReAuctionDetailsResponse {
    previousWinner: PreviousWinnerInfo;
    eligibleMembers: EligibleMember[];
    pastAuctions: PastAuction[];
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
    data: T;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReAuctionService {
    private baseUrl = 'http://localhost:8080/chitfunds/api/v1/re-auctions';

    constructor(private http: HttpClient) { }

    getReAuctionDetails(auctionId: number): Observable<ApiResponse<ReAuctionDetailsResponse>> {
        return this.http.get<ApiResponse<ReAuctionDetailsResponse>>(`${this.baseUrl}/details/${auctionId}`);
    }

    confirmReAuction(request: ReAuctionConfirmRequest): Observable<ApiResponse<string>> {
        return this.http.post<ApiResponse<string>>(`${this.baseUrl}/confirm`, request);
    }
}