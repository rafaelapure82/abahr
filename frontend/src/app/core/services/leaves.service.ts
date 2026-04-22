import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LeaveRequest {
  leaveType: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason?: string;
  isHalfDay?: boolean;
}

export interface LeaveReview {
  action: 'approve' | 'reject';
  approverNotes?: string;
}

@Injectable({ providedIn: 'root' })
export class LeavesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/leaves`;

  requestLeave(body: LeaveRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, body);
  }

  getMyLeaves(query: { status?: string; leaveType?: string } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v) params = params.set(k, v); });
    return this.http.get<any>(`${this.apiUrl}/mine`, { params });
  }

  getAllLeaves(query: { status?: string; leaveType?: string; departmentId?: string; page?: number; limit?: number } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<any>(this.apiUrl, { params });
  }

  reviewLeave(id: string, body: LeaveReview): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/review`, body);
  }

  getPolicies(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/policies`);
  }

  createPolicy(policy: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/policies`, policy);
  }
}
