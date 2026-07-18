import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const BASE_URL = '/chitfunds/api/v1/chit-groups';
// const BASE_URL = 'http://3.108.194.139:8080/chitfunds/api/v1/chit-groups';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ChitGroupListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ChitGroupsService {
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken')
        || localStorage.getItem('token')
        || localStorage.getItem('auth_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return { headers };
  }

  private cachedChitGroups: any[] | null = null;

  getChitGroupsPaged(params: ChitGroupListParams = {}): Observable<PagedResponse<any>> {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 10));
    if (params.search?.trim()) {
      query.set('search', params.search.trim());
    }
    if (params.status?.trim()) {
      query.set('status', params.status.trim());
    }
    query.set('sortBy', params.sortBy ?? 'id');
    query.set('sortDir', params.sortDir ?? 'desc');

    return this.http
      .get<ApiResponse<PagedResponse<any>>>(`${BASE_URL}/paged?${query.toString()}`, this.getHeaders())
      .pipe(
        map(response => response.data ?? { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
        catchError(err => {
          console.error('Error fetching paged chit groups', err);
          if (err?.status === 403) {
            return throwError(() => ({
              ...err,
              error: {
                ...(err.error ?? {}),
                message: err.error?.message || 'Access denied. You do not have permission to view chit groups.',
              },
            }));
          }
          return of({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
        })
      );
  }

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

  getChitGroupById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${BASE_URL}/${id}`, this.getHeaders());
  }

  createChitGroup(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(BASE_URL, payload, this.getHeaders()).pipe(
      tap(res => {
        if (res && res.success) {
          this.cachedChitGroups = null;
        }
      })
    );
  }

  updateChitGroup(id: number, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${BASE_URL}/${id}`, payload, this.getHeaders()).pipe(
      tap(res => {
        if (res && res.success) {
          this.cachedChitGroups = null;
        }
      })
    );
  }

  deleteChitGroup(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${BASE_URL}/${id}`, this.getHeaders()).pipe(
      tap(res => {
        if (res && res.success) {
          this.cachedChitGroups = null;
        }
      })
    );
  }
}
