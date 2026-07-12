import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../enviornment/enviornment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  let headers = req.headers;

  // 1. Add Authorization header from localStorage if missing
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('auth_token');
    if (token && !headers.has('Authorization')) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // 2. Map localhost to production API URL in production
  let newUrl = req.url;
  if (req.url.startsWith('http://localhost:8080')) {
    const envUrl = environment.apiUrl; // e.g. http://13.205.211.107/chitfunds/api/v1
    try {
      const urlObj = new URL(envUrl);
      const targetBase = `${urlObj.protocol}//${urlObj.host}`; // e.g. http://13.205.211.107
      newUrl = req.url.replace('http://localhost:8080', targetBase);
    } catch (e) {
      console.error('Failed to parse environment.apiUrl:', envUrl, e);
    }
  }

  const clonedReq = req.clone({
    url: newUrl,
    headers: headers
  });

  return next(clonedReq);
};
