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

// Expanded to match the full backend DTO
export interface MemberResponse {
    id: number;
    subscriberId: number;
    title: string;
    name: string;
    guardianName: string;
    dob: string;
    age: number;
    registrationDate: string;
    gender: string;
    mobileNumber: string;
    email: string;
    aadharNumber: string;
    address: string;
    maritalStatus: string;
    introducedAs: string;
    photoUrl: string;
    signatureUrl: string;
    passbookUrl: string;
    bankAccountNumber: string;
    bankAccountHolderName: string;
    bankName: string;
    bankBranch: string;
    bankIfsc: string;
    occupation: string;
    employeeType: string;
    organization: string;
    designation: string;
    dateOfJoining: string;
    doorNo: string;
    streetName: string;
    city: string;
    pincode: string;
    nomineeName: string;
    nomineeAge: number;
    nomineeRelation: string;
    nomineeDoorNo: string;
    nomineeStreetName: string;
    nomineeCity: string;
    nomineeAddress: string;
    nomineePincode: string;
    nomineeMobileNumber: string;
    fillSubscriberAddress: string;
    route: string;
    gstNumber: string;
    panCardNumber: string;
    notes: string;
    createdAt: string;
    status: string;
}

// Updated to success boolean as per your implementation plan
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root',
})
export class MemberService {
    private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/members';

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): { headers: HttpHeaders } {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (typeof window !== 'undefined' && window.localStorage) {
            const token = localStorage.getItem('token');
            if (token) {
                headers = headers.set('Authorization', `Bearer ${token}`);
            }
        }

        return { headers };
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
        return this.http.post<ApiResponse<MemberResponse>>(this.apiUrl, payload, this.getAuthHeaders())
            .pipe(map(response => response.data));
    }

    deleteMember(id: number): Observable<string> {
        return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`, this.getAuthHeaders())
            .pipe(map(response => response.message));
    }

    updateMember(id: number, payload: any): Observable<MemberResponse> {
        return this.http.put<ApiResponse<MemberResponse>>(`${this.apiUrl}/${id}`, payload, this.getAuthHeaders())
            .pipe(map(response => response.data));
    }
}