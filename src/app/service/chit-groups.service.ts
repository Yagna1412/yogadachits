import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  constructor(private http: HttpClient) {}

  getChitGroups(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(BASE_URL).pipe(
      catchError(err => {
        console.error('Error fetching groups', err);
        return of({ success: false, message: 'Server Error', data: [] });
      })
    );
  }

  createChitGroup(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(BASE_URL, payload).pipe(
      catchError(err => {
        console.error('Error creating group', err);
        return of({ success: false, message: 'Server Error', data: null });
      })
    );
  }
}