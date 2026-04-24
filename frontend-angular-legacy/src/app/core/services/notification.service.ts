import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  // Reactive unread count — used by navbar badge
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  list(query: { isRead?: boolean; page?: number; limit?: number } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<any>(this.apiUrl, { params });
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.getValue() - 1)))
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  remove(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /** Fetch unread count and update the signal (call on app init) */
  refreshUnreadCount(): void {
    this.list({ isRead: false, limit: 1 }).subscribe({
      next: (res: any) => this.unreadCountSubject.next(res.meta?.total || 0)
    });
  }
}
