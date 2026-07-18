import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../enviornment/enviornment';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface SelfChitDropdownOption {
    id: number;
    name: string;
}

export interface SelfChitEntry {
    selfChitId: number;
    subscriberId: number;
    subscriberName: string;
    chitGroupId: number;
    groupName: string;
    ticketNo: string;
    personId: number;
    personName: string;
}

export interface SelfChitEntryRequest {
    subscriberId: number;
    chitGroupId: number;
    ticketNo: string;
    personId: number;
}

@Injectable({
    providedIn: 'root'
})
export class SelfChitsService {
    private platformId = inject(PLATFORM_ID);
    private apiUrl = `${environment.apiUrl}/self-chits`;

    constructor(private http: HttpClient) { }

    private isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    private getHeaders(): { headers: HttpHeaders } {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        if (this.isBrowser()) {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            if (token) {
                headers = headers.set('Authorization', `Bearer ${token}`);
            }
        }
        return { headers };
    }

    getAllEntries(searchTerm?: string): Observable<SelfChitEntry[]> {
        if (!this.isBrowser()) {
            return of([]);
        }
        let params = new HttpParams();
        if (searchTerm && searchTerm.trim() !== '') {
            params = params.set('searchTerm', searchTerm.trim());
        }
        return this.http.get<ApiResponse<SelfChitEntry[]>>(this.apiUrl, { ...this.getHeaders(), params }).pipe(
            map(res => res.data || [])
        );
    }

    createEntry(entryData: SelfChitEntryRequest): Observable<SelfChitEntry> {
        if (!this.isBrowser()) {
            return of({} as SelfChitEntry);
        }
        return this.http.post<ApiResponse<SelfChitEntry>>(this.apiUrl, entryData, this.getHeaders()).pipe(
            map(res => res.data)
        );
    }

    getChitGroups(): Observable<SelfChitDropdownOption[]> {
        if (!this.isBrowser()) {
            return of([]);
        }
        return this.http.get<ApiResponse<SelfChitDropdownOption[]>>(`${this.apiUrl}/chit-groups`, this.getHeaders()).pipe(
            map(res => res.data || [])
        );
    }

    getPersons(): Observable<SelfChitDropdownOption[]> {
        if (!this.isBrowser()) {
            return of([]);
        }
        return this.http.get<ApiResponse<SelfChitDropdownOption[]>>(`${this.apiUrl}/persons`, this.getHeaders()).pipe(
            map(res => res.data || [])
        );
    }
}
