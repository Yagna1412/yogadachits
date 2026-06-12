import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface SuitMemberOption {
    id: number;
    name: string;
    photoUrl?: string;
    joinedDate?: string;
}

export interface SuitMemberSummary {
    id: number;
    name: string;
    photoUrl?: string;
    joinedDate?: string;
    status: string;
    outstandingAmount: string;
    enrolledGroups: string[];
}

export interface SuitFileRecord {
    legalCaseId: number;
    memberId: number;
    memberName: string;
    caseNumber?: string;
    suitCause?: string;
    suitDate?: string;
    courtName?: string;
    lawyerDetails?: string;
    principal?: number;
    interest?: number;
    legalCost?: number;
    incCharges?: number;
    claimAmount?: number;
    legalNoticeDate?: string;
    status?: string;
}

export interface SuitTimelineEntry {
    timelineId: number;
    legalCaseId: number;
    caseNumber?: string;
    title: string;
    subtitle: string;
    date?: string;
    time?: string;
    document?: { name: string; size: string };
    notify?: string[];
}

export interface SuitFileCreateRequest {
    memberId: number;
    suitCause: string;
    suitDate?: string;
    caseNumber?: string;
    courtName?: string;
    lawyerDetails?: string;
    principal?: number;
    interest?: number;
    legalCost?: number;
    incCharges?: number;
    claimAmount?: number;
    legalNoticeDate?: string;
}

export interface SuitTimelineCreateRequest {
    title: string;
    details?: string;
    hearingDate?: string;
    hearingTime?: string;
    documentName?: string;
    documentSize?: string;
    notifyUsers?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class SuitFileService {
    private platformId = inject(PLATFORM_ID);
    private apiUrl = 'http://localhost:8080/chitfunds/api/v1/suit-files';

    constructor(private http: HttpClient) { }

    private isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    private getHeaders(): { headers: HttpHeaders } {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (this.isBrowser()) {
            const token = localStorage.getItem('token');
            if (token) {
                headers = headers.set('Authorization', `Bearer ${token}`);
            }
        }
        return { headers };
    }

    getMembers(searchTerm?: string): Observable<SuitMemberOption[]> {
        if (!this.isBrowser()) {
            return of([]);
        }
        let params = new HttpParams();
        const term = searchTerm?.trim();
        if (term) {
            params = params.set('searchTerm', term);
        }
        return this.http.get<SuitMemberOption[]>(`${this.apiUrl}/members`, { ...this.getHeaders(), params }).pipe(
            catchError(err => {
                console.error('Error fetching suit file members:', err);
                return of([]);
            })
        );
    }

    getMemberById(memberId: number): Observable<SuitMemberOption | null> {
        if (!this.isBrowser()) {
            return of(null);
        }
        return this.http.get<SuitMemberOption>(`${this.apiUrl}/members/lookup/${memberId}`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching member by id:', err);
                return of(null);
            })
        );
    }

    getMemberSummary(memberId: number): Observable<SuitMemberSummary> {
        if (!this.isBrowser()) {
            return of({} as SuitMemberSummary);
        }
        return this.http.get<SuitMemberSummary>(`${this.apiUrl}/members/${memberId}/summary`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching member summary:', err);
                throw err;
            })
        );
    }

    getSuitFileForMember(memberId: number): Observable<SuitFileRecord | null> {
        if (!this.isBrowser()) {
            return of(null);
        }
        return this.http.get<SuitFileRecord>(`${this.apiUrl}/members/${memberId}/suit`, {
            ...this.getHeaders(),
            observe: 'response'
        }).pipe(
            map(res => res.status === 204 ? null : (res.body as SuitFileRecord)),
            catchError(err => {
                if (err?.status === 204) {
                    return of(null);
                }
                console.error('Error fetching suit file:', err);
                return of(null);
            })
        );
    }

    createSuitFile(data: SuitFileCreateRequest): Observable<SuitFileRecord> {
        if (!this.isBrowser()) {
            return of({} as SuitFileRecord);
        }
        return this.http.post<SuitFileRecord>(`${this.apiUrl}`, data, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error creating suit file:', err);
                throw err;
            })
        );
    }

    getTimeline(memberId: number): Observable<SuitTimelineEntry[]> {
        if (!this.isBrowser()) {
            return of([]);
        }
        return this.http.get<SuitTimelineEntry[]>(`${this.apiUrl}/members/${memberId}/timeline`, this.getHeaders());
    }

    createTimelineEntry(memberId: number, data: SuitTimelineCreateRequest): Observable<SuitTimelineEntry> {
        if (!this.isBrowser()) {
            return of({} as SuitTimelineEntry);
        }
        return this.http.post<SuitTimelineEntry>(`${this.apiUrl}/members/${memberId}/timeline`, data, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error creating timeline entry:', err);
                throw err;
            })
        );
    }

    getNotifyUsers(): Observable<string[]> {
        if (!this.isBrowser()) {
            return of([]);
        }
        return this.http.get<string[]>(`${this.apiUrl}/notify-users`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching notify users:', err);
                return of([]);
            })
        );
    }

    getLatestCaseNumber(memberId: number): Observable<string> {
        if (!this.isBrowser()) {
            return of('');
        }
        return this.http.get<{ caseNumber: string }>(`${this.apiUrl}/members/${memberId}/case-number`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching case number:', err);
                return of({ caseNumber: '' });
            }),
            map(res => res.caseNumber || '')
        );
    }
}
