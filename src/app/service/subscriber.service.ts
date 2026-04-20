import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './member.service'; 

export interface SubscriberResponse {
  id: number;
  subscriberType: string;
  memberId: number;
  displayName: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriberService {
  private apiUrl = 'http://3.108.194.139:8080/chitfunds/api/v1/subscribers';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return { headers };
  }

  // Explicit secondary sync endpoint
  syncSubscriber(memberId: number): Observable<any> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/sync/member/${memberId}`, {}, this.getAuthHeaders())
      .pipe(map(response => response));
  }

  getSubscribers(): Observable<SubscriberResponse[]> {
    return this.http.get<ApiResponse<SubscriberResponse[]>>(this.apiUrl, this.getAuthHeaders())
      .pipe(map(response => response.data));
  }
}