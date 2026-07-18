import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviornment/enviornment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient) { }

  getToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return (
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token')
    );
  }

  /** Clears invalid or expired tokens before the first route guard runs. */
  initSession(): void {
    const token = this.getToken();
    if (token && !this.isTokenValid(token)) {
      this.logout();
    }
  }

  getHomeRoute(): string {
    return this.isMemberPortalUser() ? '/user/dashboard' : '/admin/dashboard';
  }

  isMemberPortalUser(): boolean {
    const backendRole = this.getBackendRole();
    if (backendRole) {
      const role = this.normalizeBackendRole(backendRole);
      if (role === 'MEMBER') {
        return true;
      }
      if (role === 'ADMIN' || role === 'AGENT') {
        return false;
      }
    }
    return this.getUserRole() === 'User';
  }

  isAdminPortalUser(): boolean {
    return !this.isMemberPortalUser();
  }

  setUserSession(user: any): void {
    if (typeof window === 'undefined' || !window.localStorage || !user) {
      return;
    }
    if (user.id != null) {
      localStorage.setItem('userId', String(user.id));
    }
    if (user.fullName) {
      localStorage.setItem('userFullName', user.fullName);
    }
    if (user.memberId != null) {
      localStorage.setItem('memberId', String(user.memberId));
    }
    if (user.userCode) {
      localStorage.setItem('userCode', user.userCode);
    }
    this.setBackendRole(user.role);

    const role = user.role ? String(user.role).trim().toUpperCase() : '';
    if (role === 'MEMBER') {
      localStorage.setItem('userRole', 'User');
    } else if (role === 'ADMIN' || role === 'AGENT') {
      localStorage.setItem('userRole', 'Admin');
    }
  }

  /** Returns false and clears storage when the JWT is missing, malformed, or expired. */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    if (!this.isTokenValid(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  isTokenValid(token: string): boolean {
    const payload = this.parseJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') {
      return false;
    }
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp > nowSec;
  }

  private parseJwtPayload(token: string): { exp?: number } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  getUserRole(): 'Admin' | 'User' {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'Admin';
    }
    const role = localStorage.getItem('userRole');
    return role === 'User' ? 'User' : 'Admin';
  }

  getBackendRole(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return localStorage.getItem('backendUserRole');
  }

  setBackendRole(role: string | null | undefined): void {
    if (typeof window === 'undefined' || !window.localStorage || !role) {
      return;
    }
    localStorage.setItem('backendUserRole', role);
  }

  canManageChitGroups(): boolean {
    const role = this.normalizeBackendRole(this.getBackendRole());
    return role === 'ADMIN';
  }

  /** Strips optional ROLE_ prefix and uppercases for consistent role checks. */
  private normalizeBackendRole(role: string | null | undefined): string {
    const raw = (role || 'ADMIN').trim().toUpperCase();
    return raw.startsWith('ROLE_') ? raw.slice(5) : raw;
  }

  canReadEnrollments(): boolean {
    return this.isAuthenticated();
  }

  canManageEnrollments(): boolean {
    const role = this.normalizeBackendRole(this.getBackendRole());
    return role === 'ADMIN' || role === 'AGENT';
  }

  canApproveEnrollments(): boolean {
    const role = this.normalizeBackendRole(this.getBackendRole());
    return role === 'ADMIN';
  }

  canManageAuctions(): boolean {
    const role = (this.getBackendRole() || 'ADMIN').toUpperCase();
    return role === 'ADMIN' || role === 'AGENT';
  }

  canConfirmAuctionWinner(): boolean {
    const role = (this.getBackendRole() || 'ADMIN').toUpperCase();
    return role === 'ADMIN';
  }

  logout(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('backendUserRole');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('userId');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('memberId');
    localStorage.removeItem('userCode');
  }

  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Tenant-Id': '1',
    });
    return this.http.post(this.apiUrl, credentials, { headers });
  }
}
