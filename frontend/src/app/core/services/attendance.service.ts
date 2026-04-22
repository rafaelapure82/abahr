import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/attendance`;

  getMyToday(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mine/today`);
  }

  checkIn(data: { latitude?: number; longitude?: number; isRemote?: boolean; locationId?: string } = {}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-in`, data);
  }

  checkOut(data: { note?: string } = {}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-out`, data);
  }

  getAll(query: { date?: string; employeeId?: string; departmentId?: string; status?: string; page?: number; limit?: number } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getStats(query: { departmentId?: string; from?: string; to?: string } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<any>(`${this.apiUrl}/stats`, { params });
  }
}
