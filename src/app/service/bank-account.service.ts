import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BankAccountService {
    private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/admin/account-bank';

    constructor(private http: HttpClient) { }

    getTransactions(tenantId: number, type: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/list?tenantId=${tenantId}&type=${type}`);
    }

    saveDeposit(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/deposit`, data);
    }

    savePayment(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/payment`, data);
    }
}
