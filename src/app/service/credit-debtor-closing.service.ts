import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../enviornment/enviornment';
// Backend route: /api/admin/creditors-debtors-closing
const BASE_URL = environment.apiUrl.replace('/api/v1', '/api/admin') + '/creditors-debtors-closing';

@Injectable({
    providedIn: 'root'
})
export class CreditDebtorClosingService {

    constructor(private http: HttpClient) { }

    getAllClosings(tenantId: number = 1): Observable<any[]> {
        return this.http.get<any[]>(`${BASE_URL}?tenantId=${tenantId}`);
    }

    createClosing(payload: any): Observable<any> {
        return this.http.post<any>(BASE_URL, payload);
    }
}
