import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SuretyService {
    private platformId = inject(PLATFORM_ID);
    private apiUrl = 'http://localhost:8080/chitfunds/api/v1/sureties';

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

    getAllSureties(searchTerm?: string): Observable<any[]> {
        let params = new HttpParams();
        if (searchTerm && searchTerm.trim() !== '') {
            params = params.set('searchTerm', searchTerm.trim());
        }
        return this.http.get<any[]>(this.apiUrl, { ...this.getHeaders(), params }).pipe(
            catchError(err => {
                console.error('Error fetching sureties:', err);
                return of([]);
            })
        );
    }

    createSurety(suretyData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, suretyData, this.getHeaders()).pipe(
            catchError(err => {
                console.error('Error creating surety:', err);
                throw err; // Re-throw so component error handler fires
            })
        );
    }
}