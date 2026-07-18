import { Injectable, inject, PLATFORM_ID } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';

import { catchError, map } from 'rxjs/operators';



export interface ApiResponse<T> {

  success: boolean;

  message: string;

  data: T | null;

  timestamp?: string;

}



export interface PagedResponse<T> {

  content: T[];

  page: number;

  size: number;

  totalElements: number;

  totalPages: number;

}



export interface EnrollmentNomineePayload {

  nomineeName?: string;

  nomineeRelation?: string;

  nomineeMobile?: string;

  nomineeDob?: string | null;

}



export interface EnrollmentNomineeResponse extends EnrollmentNomineePayload {

  id?: number;

}



export interface EnrollmentResponse {

  id: number;

  memberId?: number;

  memberName?: string;

  subscriberId?: number;

  subscriberName?: string;

  chitGroupId?: number;

  chitGroupName?: string;

  ticketNo?: number;

  listNo?: number;

  enrollmentDate?: string;

  businessAgentId?: number;

  businessAgentName?: string;

  collectionAgentId?: number;

  collectionAgentName?: string;

  status?: string;

  createdAt?: string;

  enrollmentFee?: number;

  enrollmentFeePaid?: boolean;

  installmentCount?: number;

  nominee?: EnrollmentNomineeResponse | null;

  approvalStatus?: string;

  approvedAt?: string;

  approvedByName?: string;

  rejectionReason?: string;

  createdByName?: string;

  areaLocationId?: number;

  routeLocationId?: number;

  areaName?: string;

  routeName?: string;

}



export interface EnrollmentKpiSummary {

  totalEnrollments: number;

  activeEnrollments: number;

  pendingEnrollments: number;

  pendingApprovalCount: number;

  distinctChitGroups: number;

}



export interface InstallmentResponse {

  id: number;

  enrollmentId?: number;

  installmentNo: number;

  dueDate?: string;

  dueAmount?: number;

  paidAmount?: number;

  status?: string;

  lastPaymentDate?: string;

}



export interface ChitGroupEnrollmentSummary {

  chitGroupId: number;

  groupName?: string;

  maxTickets: number;

  usedTickets: number;

  availableTickets: number;

  enrollmentFee?: number;

  installmentAmount?: number;

  noOfInstallments?: number;

}



export interface EnrollmentCreatePayload {

  subscriberId: number;

  chitGroupId: number;

  ticketNo?: number | null;

  enrollmentDate?: string | null;

  businessAgentId?: number | null;

  collectionAgentId?: number | null;

  enrollmentFeePaid?: boolean;

  nominee?: EnrollmentNomineePayload | null;

  listNo?: number | null;

  areaLocationId?: number | null;

  routeLocationId?: number | null;

  areaName?: string | null;

  routeName?: string | null;

}



export interface EnrollmentUpdatePayload {

  businessAgentId?: number | null;

  collectionAgentId?: number | null;

  status?: string;

  enrollmentFeePaid?: boolean;

  nominee?: EnrollmentNomineePayload | null;

  listNo?: number | null;

  areaLocationId?: number | null;

  routeLocationId?: number | null;

  areaName?: string | null;

  routeName?: string | null;

}



export interface EnrollmentListParams {

  page?: number;

  size?: number;

  search?: string;

  status?: string;

  chitGroupId?: number | null;

  dateFrom?: string | null;

  dateTo?: string | null;

  sortBy?: string;

  sortDir?: 'asc' | 'desc';

}



export interface AgentOption {

  id: number;

  agentName: string;

}



@Injectable({

  providedIn: 'root'

})

export class EnrollmentsService {



  private platformId = inject(PLATFORM_ID);

  private apiUrl = '/chitfunds/api/v1/enrollments';

  private installmentsUrl = '/chitfunds/api/v1/installments';

  private agentsUrl = '/chitfunds/api/v1/agents';

  private subscribersUrl = '/chitfunds/api/v1/subscribers';



  constructor(private http: HttpClient) {}



  private isBrowser(): boolean {

    return isPlatformBrowser(this.platformId);

  }



  private getHeaders(): { headers: HttpHeaders } {

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (this.isBrowser()) {

      const token = localStorage.getItem('authToken')

        || localStorage.getItem('token')

        || localStorage.getItem('auth_token');

      if (token) {

        headers = headers.set('Authorization', `Bearer ${token}`);

      }

    }

    return { headers };

  }



  getEnrollments(): Observable<ApiResponse<EnrollmentResponse[]>> {

    if (!this.isBrowser()) {

      return throwError(() => new Error('Not available on server'));

    }

    return this.http.get<ApiResponse<EnrollmentResponse[]>>(this.apiUrl, this.getHeaders());

  }



  getEnrollmentsPaged(params: EnrollmentListParams = {}): Observable<PagedResponse<EnrollmentResponse>> {

    const query = new URLSearchParams();

    query.set('page', String(params.page ?? 0));

    query.set('size', String(params.size ?? 10));

    if (params.search?.trim()) {

      query.set('search', params.search.trim());

    }

    if (params.status?.trim()) {

      query.set('status', params.status.trim());

    }

    if (params.chitGroupId != null) {

      query.set('chitGroupId', String(params.chitGroupId));

    }

    if (params.dateFrom?.trim()) {

      query.set('dateFrom', params.dateFrom.trim());

    }

    if (params.dateTo?.trim()) {

      query.set('dateTo', params.dateTo.trim());

    }

    query.set('sortBy', params.sortBy ?? 'id');

    query.set('sortDir', params.sortDir ?? 'desc');



    return this.http

      .get<ApiResponse<PagedResponse<EnrollmentResponse>>>(`${this.apiUrl}/paged?${query.toString()}`, this.getHeaders())

      .pipe(

        map(res => res.data ?? { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),

        catchError(err => throwError(() => err))

      );

  }



  getChitGroupSummary(chitGroupId: number): Observable<ChitGroupEnrollmentSummary | null> {

    return this.http

      .get<ApiResponse<ChitGroupEnrollmentSummary>>(`${this.apiUrl}/chit-group/${chitGroupId}/summary`, this.getHeaders())

      .pipe(

        map(res => res.data ?? null),

        catchError(err => throwError(() => err))

      );

  }



  getKpiSummary(params: EnrollmentListParams = {}): Observable<EnrollmentKpiSummary> {

    const query = new URLSearchParams();

    if (params.status?.trim()) {

      query.set('status', params.status.trim());

    }

    if (params.chitGroupId != null) {

      query.set('chitGroupId', String(params.chitGroupId));

    }

    if (params.dateFrom?.trim()) {

      query.set('dateFrom', params.dateFrom.trim());

    }

    if (params.dateTo?.trim()) {

      query.set('dateTo', params.dateTo.trim());

    }

    const qs = query.toString();

    const url = qs ? `${this.apiUrl}/kpi?${qs}` : `${this.apiUrl}/kpi`;

    return this.http

      .get<ApiResponse<EnrollmentKpiSummary>>(url, this.getHeaders())

      .pipe(

        map(res => res.data ?? {

          totalEnrollments: 0,

          activeEnrollments: 0,

          pendingEnrollments: 0,

          pendingApprovalCount: 0,

          distinctChitGroups: 0,

        }),

        catchError(err => throwError(() => err))

      );

  }



  approveEnrollment(id: number): Observable<ApiResponse<EnrollmentResponse>> {

    return this.http.post<ApiResponse<EnrollmentResponse>>(

      `${this.apiUrl}/${id}/approve`, {}, this.getHeaders()

    );

  }



  rejectEnrollment(id: number, reason?: string): Observable<ApiResponse<EnrollmentResponse>> {

    return this.http.post<ApiResponse<EnrollmentResponse>>(

      `${this.apiUrl}/${id}/reject`, { reason: reason || null }, this.getHeaders()

    );

  }



  downloadAgreementPdf(enrollmentId: number): Observable<Blob> {

    return this.http.get(

      `${this.apiUrl}/${enrollmentId}/agreement/pdf`,

      { ...this.getHeaders(), responseType: 'blob' as 'json' }

    ) as Observable<Blob>;

  }



  getEnrollmentById(enrollmentId: number): Observable<ApiResponse<EnrollmentResponse>> {

    return this.http.get<ApiResponse<EnrollmentResponse>>(

      `${this.apiUrl}/${enrollmentId}`, this.getHeaders()

    );

  }



  getInstallmentsByEnrollmentId(enrollmentId: number): Observable<ApiResponse<InstallmentResponse[]>> {

    if (!this.isBrowser()) {

      return throwError(() => new Error('Not available on server'));

    }

    return this.http.get<ApiResponse<InstallmentResponse[]>>(

      `${this.installmentsUrl}?enrollmentId=${enrollmentId}`,

      this.getHeaders()

    );

  }



  createEnrollment(payload: EnrollmentCreatePayload): Observable<ApiResponse<EnrollmentResponse>> {

    return this.http.post<ApiResponse<EnrollmentResponse>>(

      this.apiUrl, payload, this.getHeaders()

    );

  }



  updateEnrollment(id: number, payload: EnrollmentUpdatePayload): Observable<ApiResponse<EnrollmentResponse>> {

    return this.http.put<ApiResponse<EnrollmentResponse>>(

      `${this.apiUrl}/${id}`, payload, this.getHeaders()

    );

  }



  deleteEnrollment(id: number): Observable<ApiResponse<string>> {

    return this.http.delete<ApiResponse<string>>(

      `${this.apiUrl}/${id}`, this.getHeaders()

    );

  }



  getAgents(): Observable<AgentOption[]> {

    return this.http.get<ApiResponse<AgentOption[]>>(this.agentsUrl, this.getHeaders()).pipe(

      map(res => {

        const data = res?.data ?? [];

        return Array.isArray(data) ? data : [];

      }),

      catchError(() => throwError(() => new Error('Failed to load agents')))

    );

  }



  createSubscriberForMember(memberId: number, displayName: string): Observable<ApiResponse<{ id: number }>> {

    const payload = { subscriberType: 'member', memberId, displayName };

    return this.http.post<ApiResponse<{ id: number }>>(

      this.subscribersUrl, payload, this.getHeaders()

    );

  }

}


