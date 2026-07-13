import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { environment } from '../../enviornment/enviornment';
export interface AccountGroupRecord {
  accountGroupId: number;
  groupName: string;
  groupType: string;
}

export interface AccountGroupCreateRequest {
  groupName: string;
  groupType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountGroupService {
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl + "/account-groups";

  constructor(private http: HttpClient) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Id': '1'
    });
    if (this.isBrowser()) {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return { headers };
  }

  getGroups(searchTerm?: string): Observable<AccountGroupRecord[]> {
    if (!this.isBrowser()) {
      return of([]);
    }
    let params = new HttpParams();
    if (searchTerm?.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }
    return this.http.get<AccountGroupRecord[]>(this.apiUrl, { ...this.getHeaders(), params });
  }

  getGroupTypes(): Observable<string[]> {
    if (!this.isBrowser()) {
      return of([]);
    }
    return this.http.get<string[]>(`${this.apiUrl}/group-types`, this.getHeaders());
  }

  createGroup(data: AccountGroupCreateRequest): Observable<AccountGroupRecord> {
    if (!this.isBrowser()) {
      return of({} as AccountGroupRecord);
    }
    return this.http.post<AccountGroupRecord>(this.apiUrl, data, this.getHeaders());
  }
}
