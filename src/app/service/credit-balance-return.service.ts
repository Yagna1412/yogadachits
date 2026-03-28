import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Adjust this base URL to match your environment
const BASE_URL = 'http://localhost:8080/chitfunds/api/v1/credit-balance-returns';

@Injectable({
    providedIn: 'root'
})
export class CreditBalanceReturnService {

    constructor(private http: HttpClient) { }

    getAllReturns(tenantId: number = 1): Observable<any[]> {
        return this.http.get<any[]>(`${BASE_URL}?tenantId=${tenantId}`);
    }

    createReturn(payload: any): Observable<any> {
        return this.http.post<any>(BASE_URL, payload);
    }
}