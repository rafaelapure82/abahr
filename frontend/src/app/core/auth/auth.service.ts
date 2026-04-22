import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  isActive: boolean;
  roles: any[];
  employee?: { id: string };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private permissionsSubject = new BehaviorSubject<string[]>([]);
  public permissions$ = this.permissionsSubject.asObservable();

  constructor() {
    this.checkSession();
  }

  private checkSession() {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      this.loadPermissions();
    }
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      map(res => res.data),
      tap(res => this.setSession(res))
    );
  }

  register(userData: any): Observable<any> {
    // Only admin can register new users
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.permissionsSubject.next([]);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return throwError(() => new Error('No refresh token available'));

    return this.http.post<ApiResponse<{ accessToken: string }>>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      map(res => res.data),
      tap(res => {
        localStorage.setItem('access_token', res.accessToken);
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  private setSession(authRes: AuthResponse) {
    localStorage.setItem('access_token', authRes.accessToken);
    localStorage.setItem('refresh_token', authRes.refreshToken);
    localStorage.setItem('user_data', JSON.stringify(authRes.user));
    
    this.currentUserSubject.next(authRes.user);
    this.isAuthenticatedSubject.next(true);
    this.loadPermissions();
  }

  private loadPermissions() {
    this.http.get<ApiResponse<{ permissions: string[] }>>(`${this.apiUrl}/me/permissions`).subscribe({
      next: (res) => this.permissionsSubject.next(res.data.permissions),
      error: () => this.permissionsSubject.next([])
    });
  }

  hasPermission(permission: string): boolean {
    return this.permissionsSubject.value.includes(permission) || 
           this.permissionsSubject.value.includes('MANAGE:ALL');
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return user.roles.some((r: any) => r.role.name === roleName || r.role.name === 'SUPER_ADMIN');
  }

  forgotPassword(email: string): Observable<any> {
    // Backend endpoint placeholder
    return of({ success: true });
  }
}
