import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = '/chitfunds/api/admin/creditors-debtors-closing';

export interface ClosingMemberDto {
  subscriberId: number;
  enrollmentId?: number;
  name: string;
  groupName: string;
  ticketNo: string;
  mobile?: string;
  status?: string;
  payable?: number;
  paid?: number;
  balance?: number;
}

export interface ClosingRequestDto {
  id?: string | number;
  subscriberId?: number;
  groupName: string;
  ticketNumber: string;
  member: string;
  closingBalance: number;
  closingDate: string;
  debtorCreditorType: 'Debtor' | 'Creditor' | string;
  authorizedBy: string;
  remarks?: string;
  payable?: number;
  paidAmount?: number;
  balance?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CreditorDebtorClosingService {
  constructor(private http: HttpClient) {}

  getMembers(tenantId: number = 1, groupName?: string): Observable<ClosingMemberDto[]> {
    let params = new HttpParams().set('tenantId', String(tenantId));
    if (groupName?.trim()) {
      params = params.set('groupName', groupName.trim());
    }
    return this.http.get<ClosingMemberDto[]>(`${BASE_URL}/members`, { params });
  }

  getHistory(tenantId: number = 1): Observable<ClosingRequestDto[]> {
    const params = new HttpParams().set('tenantId', String(tenantId));
    return this.http.get<ClosingRequestDto[]>(`${BASE_URL}/history`, { params });
  }

  saveClosing(tenantId: number, body: ClosingRequestDto): Observable<string> {
    const params = new HttpParams().set('tenantId', String(tenantId));
    return this.http.post(`${BASE_URL}/save`, body, { params, responseType: 'text' });
  }

  deleteClosing(tenantId: number, id: string | number): Observable<string> {
    const params = new HttpParams().set('tenantId', String(tenantId));
    return this.http.delete(`${BASE_URL}/delete/${id}`, { params, responseType: 'text' });
  }
}
