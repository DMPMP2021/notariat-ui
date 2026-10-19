import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const t = auth.token;
  const r = t ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : req;
  return next(r).pipe(catchError(e => {
    if (e.status === 401 && !req.url.includes('/auth/login')) auth.logout();
    return throwError(() => e);
  }));
};
