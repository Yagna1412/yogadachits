import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FileUploadResponse {
    url: string;
    fileName: string;
    documentType: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({
    providedIn: 'root',
})
export class FileUploadService {
    private apiUrl = '/chitfunds/api/v1/files/members';

    constructor(private http: HttpClient) {}

    uploadMemberDocument(file: File, documentType: 'photo' | 'signature' | 'passbook'): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);

        let headers = new HttpHeaders();
        if (typeof window !== 'undefined' && window.localStorage) {
            const token = localStorage.getItem('token');
            if (token) {
                headers = headers.set('Authorization', `Bearer ${token}`);
            }
        }

        return this.http
            .post<ApiResponse<FileUploadResponse>>(this.apiUrl, formData, { headers })
            .pipe(map((response) => response.data.url));
    }
}
