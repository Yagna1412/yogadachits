import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../enviornment/enviornment';
@Injectable({
  providedIn: 'root' // Makes the service available app-wide
})
export class AgentCommissionSetupService {
  // Update the port if your Spring Boot server runs on a port other than 8080
  private apiUrl = environment.apiUrl.replace('/api/v1', '/api/admin') + '/agent-commission-setup';

  constructor(private http: HttpClient) {}

  getAllSetups(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createSetup(setupData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, setupData);
  }
}
