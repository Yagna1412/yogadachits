import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    private apiUrl = 'http://localhost:8080/chitfunds/api/v1/self-chits';
    // private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/self-chits';

    constructor(private http: HttpClient) { }

    private getHeaders(): { headers: HttpHeaders } {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('token');
            if (token) {
                headers = headers.set('Authorization', `Bearer ${token}`);
            }
        }
        return { headers };
    }

    getAllEntries(searchTerm?: string): Observable<SelfChitEntry[]> {
        let params = new HttpParams();
        if (searchTerm && searchTerm.trim() !== '') {
            params = params.set('searchTerm', searchTerm.trim());
        }
        return this.http.get<SelfChitEntry[]>(this.apiUrl, { ...this.getHeaders(), params }).pipe(
            catchError(err => {
                console.error('Error fetching self chits:', err);
                return of([]);
            })
        );
    }

    createEntry(entryData: SelfChitEntryRequest): Observable<SelfChitEntry> {
        return this.http.post<SelfChitEntry>(this.apiUrl, entryData, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error creating self chit:', err);
                throw err; // Re-throw so component error handler fires
            })
        );
    }

    getSubscribers(): Observable<SelfChitDropdownOption[]> {
        return this.http.get<SelfChitDropdownOption[]>(`${this.apiUrl}/subscribers`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching subscribers:', err);
                return of([]);
            })
        );
    }

    getChitGroups(): Observable<SelfChitDropdownOption[]> {
        return this.http.get<SelfChitDropdownOption[]>(`${this.apiUrl}/chit-groups`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching chit groups:', err);
                return of([]);
            })
        );
    }

    getPersons(): Observable<SelfChitDropdownOption[]> {
        return this.http.get<SelfChitDropdownOption[]>(`${this.apiUrl}/persons`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching persons:', err);
                return of([]);
            })
        );
    }
}
