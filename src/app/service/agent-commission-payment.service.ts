import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentCommissionPaymentService {
  private apiUrl = '/chitfunds/api/admin/agent-commission-payment';

  constructor(private http: HttpClient) {}

  getAllBills(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createBill(billData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, billData);
  }
}
