import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RemovalPaymentService {
    // Make sure this matches your Spring Boot application port (usually 8080)
    private apiUrl = 'http://localhost:8080/chitfunds/api/removal-payment-members';

    constructor(private http: HttpClient) { }

    // Fetch all payments from DB
    getPayments(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    // Send new payment payload to DB
    createPayment(paymentData: any): Observable<any> {
        // We use responseType: 'text' because your backend returns a plain String: "Payment created successfully"
        return this.http.post(this.apiUrl, paymentData, { responseType: 'text' });
    }
}