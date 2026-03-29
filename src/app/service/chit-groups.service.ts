import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

const BASE_URL = 'http://localhost:8080/chitfunds/api/v1/chit-groups';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

@Injectable({
  providedIn: 'root'
})
export class ChitGroupsService {
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return { headers };
  }

  private cachedChitGroups: any[] | null = null;

  getChitGroups(forceRefresh = false): Observable<ApiResponse<any[]>> {
    if (!forceRefresh && this.cachedChitGroups) {
      return of({
        success: true,
        message: 'Loaded from cache',
        data: this.cachedChitGroups
      });
    }
    return this.http.get<ApiResponse<any[]>>(BASE_URL, this.getHeaders()).pipe(
      tap(res => {
        if (res && res.data && Array.isArray(res.data)) {
          this.cachedChitGroups = res.data;
        }
      }),
      catchError(err => {
        console.error('Error fetching groups', err);
        return of({ success: false, message: 'Server Error', data: [] });
      })
    );
  }

  createChitGroup(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(BASE_URL, payload, this.getHeaders()).pipe(
      tap(res => {
        if (res && res.success) {
          this.cachedChitGroups = null; // Flush cache on successful mutation
        }
      }),
      catchError(err => {
        console.error('Error creating group', err);
        return of({ success: false, message: 'Server Error', data: null });
      })
    );
  }
}