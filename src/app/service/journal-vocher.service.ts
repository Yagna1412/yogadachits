import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JournalVoucherService {
    private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/admin/journal-voucher';

    constructor(private http: HttpClient) { }

    getJournals(tenantId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/list?tenantId=${tenantId}`);
    }

    saveJournal(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}`, data);
    }
}
