import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AgentTargetDropdownOption {
    id: number;
    name: string;
}

export interface AgentTargetEntry {
    agentTargetId: number;
    agentId: number;
    agentName: string;
    targetAmount: number;
    targetMonth: string;
}

export interface AgentTargetEntryRequest {
    agentId: number;
    targetAmount: number;
    targetMonth: string;
}

@Injectable({
    providedIn: 'root'
})
export class AgentTargetService {
    private platformId = inject(PLATFORM_ID);
    private apiUrl = 'http://localhost:8080/chitfunds/api/v1/agent-targets';
    // private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/agent-targets';

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

    getAllTargets(searchTerm?: string): Observable<AgentTargetEntry[]> {
        let params = new HttpParams();
        if (searchTerm && searchTerm.trim() !== '') {
            params = params.set('searchTerm', searchTerm.trim());
        }
        return this.http.get<AgentTargetEntry[]>(this.apiUrl, { ...this.getHeaders(), params }).pipe(
            catchError(err => {
                console.error('Error fetching agent targets:', err);
                return of([]);
            })
        );
    }

    createTarget(targetData: AgentTargetEntryRequest): Observable<AgentTargetEntry> {
        return this.http.post<AgentTargetEntry>(this.apiUrl, targetData, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error creating agent target:', err);
                throw err; // Re-throw so component error handler fires
            })
        );
    }

    getAgents(): Observable<AgentTargetDropdownOption[]> {
        return this.http.get<AgentTargetDropdownOption[]>(`${this.apiUrl}/agents`, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error fetching agents:', err);
                return of([]);
            })
        );
    }
}
