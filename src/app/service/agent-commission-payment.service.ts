import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentCommissionPaymentService {
  // Matched to standard Spring Boot port and path
  private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/admin/agent-commission-payment';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token'); 
    return {
      headers: new HttpHeaders({
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      })
    };
  }

  getAllBills(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getAuthHeaders());
  }

  createBill(billData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, billData, this.getAuthHeaders());
  }
}
