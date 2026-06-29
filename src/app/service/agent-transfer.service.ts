import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AgentTransferDropdownOption {
    id: number;
    name: string;
}

export interface AgentTransfer {
    transferId: number;
    fromAgentId: number;
    fromAgentName: string;
    toAgentId: number;
    toAgentName: string;
    members: string;
    routes: string;
    groups: string;
}

export interface AgentTransferRequest {
    fromAgentId: number;
    toAgentId: number;
    memberIds: number[];
    routes: string[];
    groupIds: number[];
}

@Injectable({
    providedIn: 'root'
})
export class AgentTransferService {
    private platformId = inject(PLATFORM_ID);
    private apiUrl = '/chitfunds/api/v1/agent-transfers';
    // private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/agent-transfers';

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

    getAllTransfers(searchTerm?: string): Observable<AgentTransfer[]> {
        let params = new HttpParams();
        if (searchTerm && searchTerm.trim() !== '') {
            params = params.set('searchTerm', searchTerm.trim());
        }
        return this.http.get<AgentTransfer[]>(this.apiUrl, { ...this.getHeaders(), params }).pipe(
            catchError(err => {
                console.error('Error fetching agent transfers:', err);
                return of([]);
            })
        );
    }

    createTransfer(transferData: AgentTransferRequest): Observable<AgentTransfer> {
        return this.http.post<AgentTransfer>(this.apiUrl, transferData, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error creating agent transfer:', err);
                throw err; // Re-throw so component error handler fires
            })
        );
    }

    getAgents(): Observable<AgentTransferDropdownOption[]> {
        return this.http.get<AgentTransferDropdownOption[]>(`${this.apiUrl}/agents`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching agents:', err);
                return of([]);
            })
        );
    }

    getMembers(): Observable<AgentTransferDropdownOption[]> {
        return this.http.get<AgentTransferDropdownOption[]>(`${this.apiUrl}/members`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching members:', err);
                return of([]);
            })
        );
    }

    getRoutes(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/routes`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching routes:', err);
                return of([]);
            })
        );
    }

    getGroups(): Observable<AgentTransferDropdownOption[]> {
        return this.http.get<AgentTransferDropdownOption[]>(`${this.apiUrl}/groups`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching groups:', err);
                return of([]);
            })
        );
    }
}
