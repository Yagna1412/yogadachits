import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../enviornment/environment';
import { AuthService } from './auth';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type AuctionReportRow = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class AuctionReportService {
  private readonly apiUrl = `${environment.apiUrl}/auctions/reports`;

  static readonly MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ] as const;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  monthToNumber(month: string | number | null | undefined): number {
    if (month == null || month === '') {
      return 0;
    }
    if (typeof month === 'number') {
      return month;
    }
    const byName = AuctionReportService.MONTHS.findIndex(
      (name) => name.toLowerCase() === String(month).toLowerCase()
    );
    if (byName >= 0) {
      return byName + 1;
    }
    const parsed = Number(month);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  auctionChart(params: {
    groupType: string;
    auctionDate: string;
    chitGroupId?: number | null;
  }): Observable<AuctionReportRow[]> {
    let httpParams = new HttpParams()
      .set('groupType', params.groupType)
      .set('auctionDate', params.auctionDate);
    if (params.chitGroupId != null) {
      httpParams = httpParams.set('chitGroupId', String(params.chitGroupId));
    }
    return this.getRows('/chart', httpParams);
  }

  gstReport(params: {
    order?: string | null;
    month: number;
    year: number;
  }): Observable<AuctionReportRow[]> {
    let httpParams = new HttpParams()
      .set('month', String(params.month))
      .set('year', String(params.year));
    if (params.order) {
      httpParams = httpParams.set('order', params.order);
    }
    return this.getRows('/gst', httpParams);
  }

  gstSummary(params: {
    chitGroupId?: number | null;
    fromDate: string;
    toDate: string;
    gstPercent?: number | string | null;
    charge?: string | null;
  }): Observable<AuctionReportRow[]> {
    let httpParams = new HttpParams()
      .set('fromDate', params.fromDate)
      .set('toDate', params.toDate);
    if (params.chitGroupId != null) {
      httpParams = httpParams.set('chitGroupId', String(params.chitGroupId));
    }
    if (params.gstPercent != null && params.gstPercent !== '') {
      httpParams = httpParams.set('gstPercent', String(params.gstPercent));
    }
    if (params.charge) {
      httpParams = httpParams.set('charge', params.charge);
    }
    return this.getRows('/gst-summary', httpParams);
  }

  gstBalance(params: {
    chitGroupId?: number | null;
    reportDate: string;
  }): Observable<AuctionReportRow[]> {
    let httpParams = new HttpParams().set('reportDate', params.reportDate);
    if (params.chitGroupId != null) {
      httpParams = httpParams.set('chitGroupId', String(params.chitGroupId));
    }
    return this.getRows('/gst-balance', httpParams);
  }

  turnoverStatement(month: number, year: number): Observable<AuctionReportRow[]> {
    const httpParams = new HttpParams()
      .set('month', String(month))
      .set('year', String(year));
    return this.getRows('/turnover-statement', httpParams);
  }

  bidsRegister(params: {
    reportOrder?: string | number | null;
    month: number;
    year: number;
  }): Observable<AuctionReportRow[]> {
    let httpParams = new HttpParams()
      .set('month', String(params.month))
      .set('year', String(params.year));
    if (params.reportOrder != null && params.reportOrder !== '') {
      httpParams = httpParams.set('reportOrder', String(params.reportOrder));
    }
    return this.getRows('/bids-register', httpParams);
  }

  groupWiseSuccessfulBidders(params: {
    groupName?: string | null;
    groupStatus?: string | null;
    fromDate: string;
    toDate: string;
  }): Observable<AuctionReportRow[]> {
    let httpParams = new HttpParams()
      .set('fromDate', params.fromDate)
      .set('toDate', params.toDate)
      .set('groupStatus', params.groupStatus || 'Both');
    if (params.groupName?.trim()) {
      httpParams = httpParams.set('groupName', params.groupName.trim());
    }
    return this.getRows('/group-wise-successful-bidders', httpParams);
  }

  dividendListMonth(params: {
    reportOrder?: string | number | null;
    month: number;
    year: number;
  }): Observable<AuctionReportRow[]> {
    let httpParams = new HttpParams()
      .set('month', String(params.month))
      .set('year', String(params.year));
    if (params.reportOrder != null && params.reportOrder !== '') {
      httpParams = httpParams.set('reportOrder', String(params.reportOrder));
    }
    return this.getRows('/dividend-list-month', httpParams);
  }

  dividendListForMonth(params: {
    order?: string | null;
    month: number;
    year: number;
  }): Observable<AuctionReportRow[]> {
    let httpParams = new HttpParams()
      .set('month', String(params.month))
      .set('year', String(params.year));
    if (params.order) {
      httpParams = httpParams.set('order', params.order);
    }
    return this.getRows('/dividend-list-for-month', httpParams);
  }

  successfulBidders(month: number, year: number): Observable<AuctionReportRow[]> {
    const httpParams = new HttpParams()
      .set('month', String(month))
      .set('year', String(year));
    return this.getRows('/successful-bidders', httpParams);
  }

  companyInvestment(month: number, year: number): Observable<AuctionReportRow[]> {
    const httpParams = new HttpParams()
      .set('month', String(month))
      .set('year', String(year));
    return this.getRows('/company-investment', httpParams);
  }

  minutesFilingRegister(params: {
    groupName?: string | null;
    fromDate: string;
    toDate: string;
  }): Observable<AuctionReportRow[]> {
    let httpParams = new HttpParams()
      .set('fromDate', params.fromDate)
      .set('toDate', params.toDate);
    if (params.groupName?.trim()) {
      httpParams = httpParams.set('groupName', params.groupName.trim());
    }
    return this.getRows('/minutes-filing-register', httpParams);
  }

  intimationCard(params: {
    chitGroupId: number;
    ticketFrom?: number | null;
    ticketTo?: number | null;
    noticeDate: string;
  }): Observable<AuctionReportRow[]> {
    let httpParams = new HttpParams()
      .set('chitGroupId', String(params.chitGroupId))
      .set('noticeDate', params.noticeDate);
    if (params.ticketFrom != null) {
      httpParams = httpParams.set('ticketFrom', String(params.ticketFrom));
    }
    if (params.ticketTo != null) {
      httpParams = httpParams.set('ticketTo', String(params.ticketTo));
    }
    return this.getRows('/intimation-card', httpParams);
  }

  private getRows(path: string, params: HttpParams): Observable<AuctionReportRow[]> {
    return this.http
      .get<ApiResponse<AuctionReportRow[]>>(`${this.apiUrl}${path}`, {
        ...this.getHeaders(),
        params
      })
      .pipe(map((res) => res.data || []));
  }

  private getHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      headers = headers.set('X-Tenant-Id', tenantId);
    }
    return { headers };
  }
}
