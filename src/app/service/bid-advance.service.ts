import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BidAdvanceService {
    // Update this to match your actual backend URL/port
    private apiUrl = 'http://localhost:8080/chitfunds/api/v1/bid-advances';

    constructor(private http: HttpClient) { }

    getAllAdvances(tenantId: number): Observable<any[]> {
        let params = new HttpParams().set('tenantId', tenantId.toString());
        return this.http.get<any[]>(this.apiUrl, { params });
    }

    createAdvance(advanceData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, advanceData);
    }
}