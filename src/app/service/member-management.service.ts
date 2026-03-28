import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface Member {
    id: string;
    name: string;
    groupName: string;
    ticketNo: string;
    mobile: string;
    status: 'Active' | 'Inactive' | 'Transferred' | 'Removed';
    enrollDate?: string;
    address?: string;
    paidUpTo?: string;
    payable?: number;
    paid?: number;
}

export interface MemberRemoval {
    id?: string;
    groupName: string;
    ticketNo: string;
    subscriber: string;
    removalDate: string;
    authorizedBy: string;
    reason: string;
}

export interface MemberTransfer {
    id?: string;
    transferDate: string;
    groupName: string;
    ticketNo: string;
    subscriber: string;
    transferTo: string;
    busAgent: string;
    collAgent: string;
    authorizedBy: string;
    reason: string;
    addressType: string;
    enrollDate: string;
    memberAddr: string;
    paidUpTo: string;
    payable: number;
    paid: number;
    transferee: string;
    transfereeAddr: string;
    nominee: string;
    age: string;
    relation: string;
    mobile: string;
    doorNo?: string;
    street?: string;
    city?: string;
    pincode?: string;
}

export interface MemberReallotment {
    id?: string;
    groupName: string;
    ticketNumber: string;
    bidder: string;
    reallotmentDate: string;
    authorizedBy: string;
    reason: string;
    enrollmentDate: string;
    address: string;
    runningInstallmentNo: number;
    subscriptionPayable: number;
    paidAmount: number;
    balanceAmount: number;
}

@Injectable({
    providedIn: 'root'
})
export class MemberManagementService {

    private apiUrl = 'http://localhost:8080/chitfunds/api/v1/member-management';

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
            return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
        }
        console.warn("No token found. Request may fail with 403 Forbidden.");
        return new HttpHeaders();
    }

    // --- GET METHODS ---

    getMembers(): Observable<ApiResponse<Member[]>> {
        // ✅ FIXED: Now points to the correct controller endpoint
        return this.http.get<ApiResponse<Member[]>>(`${this.apiUrl}/members`, {
            headers: this.getAuthHeaders()
        });
    }

    getRemovals(): Observable<ApiResponse<MemberRemoval[]>> {
        return this.http.get<ApiResponse<MemberRemoval[]>>(`${this.apiUrl}/removals`, { headers: this.getAuthHeaders() });
    }

    getTransfers(): Observable<ApiResponse<MemberTransfer[]>> {
        return this.http.get<ApiResponse<MemberTransfer[]>>(`${this.apiUrl}/transfers`, { headers: this.getAuthHeaders() });
    }

    getReallotments(): Observable<ApiResponse<MemberReallotment[]>> {
        return this.http.get<ApiResponse<MemberReallotment[]>>(`${this.apiUrl}/reallotments`, { headers: this.getAuthHeaders() });
    }

    // --- POST METHODS ---

    createRemoval(request: MemberRemoval): Observable<ApiResponse<MemberRemoval>> {
        return this.http.post<ApiResponse<MemberRemoval>>(`${this.apiUrl}/removals`, request, { headers: this.getAuthHeaders() });
    }

    createTransfer(request: MemberTransfer): Observable<ApiResponse<MemberTransfer>> {
        return this.http.post<ApiResponse<MemberTransfer>>(`${this.apiUrl}/transfers`, request, { headers: this.getAuthHeaders() });
    }

    createReallotment(request: MemberReallotment): Observable<ApiResponse<MemberReallotment>> {
        return this.http.post<ApiResponse<MemberReallotment>>(`${this.apiUrl}/reallotments`, request, { headers: this.getAuthHeaders() });
    }
}