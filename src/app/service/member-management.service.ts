import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../enviornment/enviornment';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface Member {
    id: number;
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
    id?: number;
    groupName: string;
    ticketNo: string;
    subscriber: string;
    removalDate: string;
    authorizedBy: string;
    reason: string;
}

export interface MemberTransfer {
    id?: number;
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
    id?: number;
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

export interface MemberLookupOptions {
    groups: string[];
    authorizedBy: string[];
    agents: string[];
}

@Injectable({
    providedIn: 'root'
})
export class MemberManagementService {

    private apiUrl = `${environment.apiUrl}/member-management`;

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
        return new HttpHeaders();
    }

    getMembers(searchTerm?: string, groupName?: string, status?: string): Observable<ApiResponse<Member[]>> {
        let params = new HttpParams();
        if (searchTerm) {
            params = params.set('searchTerm', searchTerm);
        }
        if (groupName) {
            params = params.set('groupName', groupName);
        }
        if (status) {
            params = params.set('status', status);
        }
        return this.http.get<ApiResponse<Member[]>>(`${this.apiUrl}/members`, {
            headers: this.getAuthHeaders(),
            params
        });
    }

    getLookupOptions(): Observable<ApiResponse<MemberLookupOptions>> {
        return this.http.get<ApiResponse<MemberLookupOptions>>(`${this.apiUrl}/lookup-options`, {
            headers: this.getAuthHeaders()
        });
    }

    getRemovals(): Observable<ApiResponse<MemberRemoval[]>> {
        return this.http.get<ApiResponse<MemberRemoval[]>>(`${this.apiUrl}/removals`, {
            headers: this.getAuthHeaders()
        });
    }

    getTransfers(): Observable<ApiResponse<MemberTransfer[]>> {
        return this.http.get<ApiResponse<MemberTransfer[]>>(`${this.apiUrl}/transfers`, {
            headers: this.getAuthHeaders()
        });
    }

    getReallotments(): Observable<ApiResponse<MemberReallotment[]>> {
        return this.http.get<ApiResponse<MemberReallotment[]>>(`${this.apiUrl}/reallotments`, {
            headers: this.getAuthHeaders()
        });
    }

    createRemoval(request: MemberRemoval): Observable<ApiResponse<MemberRemoval>> {
        return this.http.post<ApiResponse<MemberRemoval>>(`${this.apiUrl}/removals`, request, {
            headers: this.getAuthHeaders()
        });
    }

    createTransfer(request: MemberTransfer): Observable<ApiResponse<MemberTransfer>> {
        return this.http.post<ApiResponse<MemberTransfer>>(`${this.apiUrl}/transfers`, request, {
            headers: this.getAuthHeaders()
        });
    }

    createReallotment(request: MemberReallotment): Observable<ApiResponse<MemberReallotment>> {
        return this.http.post<ApiResponse<MemberReallotment>>(`${this.apiUrl}/reallotments`, request, {
            headers: this.getAuthHeaders()
        });
    }
}
