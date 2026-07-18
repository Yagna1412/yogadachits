import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth';

const API_PATH = '/chitfunds/';

function readTenantId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return '1';
  }
  return localStorage.getItem('tenantId') || '1';
}

/** Attaches JWT + tenant header to all backend API calls. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiCall =
    req.url.includes(API_PATH) || req.url.includes('/api/v1/');

  if (!isApiCall) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const headers: Record<string, string> = {
    'X-Tenant-Id': readTenantId(),
  };

  const token = authService.getToken();
  if (token && authService.isTokenValid(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return next(
    req.clone({
      setHeaders: headers,
    })
  ).pipe(
    catchError((err) => {
      const isLoginRequest = req.url.includes('/auth/login');
      if (err.status === 401 && !isLoginRequest) {
        authService.logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          router.navigate(['/login']);
        }
      }
      return throwError(() => err);
    })
  );
};
