import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SuretyService {
    // Adjust the port if your Spring Boot app runs on a different one
    private apiUrl = 'http://localhost:8080/chitfunds/api/v1/sureties';

    constructor(private http: HttpClient) { }

    getAllSureties(searchTerm?: string): Observable<any[]> {
        let params = new HttpParams();
        if (searchTerm && searchTerm.trim() !== '') {
            params = params.set('searchTerm', searchTerm.trim());
        }
        return this.http.get<any[]>(this.apiUrl, { params });
    }

    createSurety(suretyData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, suretyData);
    }
}