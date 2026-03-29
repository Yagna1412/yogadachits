import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class AuthService {
// Add /chitfunds right after the port number
private apiUrl = 'http://localhost:8080/chitfunds/api/v1/auth/login';

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post(this.apiUrl, credentials);
  }
}