import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('access_token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/login') && !req.url.includes('/refresh')) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

// State for refreshing token
let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((res: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(res.accessToken);
        return next(request.clone({
          setHeaders: { Authorization: `Bearer ${res.accessToken}` }
        }));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        return next(request.clone({
          setHeaders: { Authorization: `Bearer ${jwt}` }
        }));
      })
    );
  }
}
