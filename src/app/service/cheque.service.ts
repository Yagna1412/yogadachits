import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ChequeService {

    private baseUrl = 'http://localhost:8080/chitfunds/api/cheque-management';

    constructor(private http: HttpClient) { }

    getSummary() {
        return this.http.get(`${this.baseUrl}/summary`);
    }

    getPending() {
        return this.http.get(`${this.baseUrl}/cheques/status/PENDING`);
    }

    getCleared() {
        return this.http.get(`${this.baseUrl}/cheques/status/CLEARED`);
    }

    getBounced() {
        return this.http.get(`${this.baseUrl}/cheques/status/BOUNCED`);
    }

    updateStatus(id: number, status: string) {
        return this.http.put(`${this.baseUrl}/cheques/${id}/status?status=${status}`, {});
    }

}