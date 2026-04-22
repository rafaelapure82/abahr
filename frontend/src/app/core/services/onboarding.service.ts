import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private http = inject(HttpClient);
  private onUrl = `${environment.apiUrl}/onboarding`;
  private offUrl = `${environment.apiUrl}/offboarding`;

  // ── Onboarding Templates ─────────────────────────────────
  listOnboardingTemplates(): Observable<any> {
    return this.http.get<any>(`${this.onUrl}/templates`);
  }

  getOnboardingTemplate(id: string): Observable<any> {
    return this.http.get<any>(`${this.onUrl}/templates/${id}`);
  }

  createOnboardingTemplate(body: any): Observable<any> {
    return this.http.post<any>(`${this.onUrl}/templates`, body);
  }

  // ── Onboarding Instances ──────────────────────────────────
  listOnboardings(query: { status?: string; page?: number; limit?: number } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<any>(this.onUrl, { params });
  }

  getOnboardingById(id: string): Observable<any> {
    return this.http.get<any>(`${this.onUrl}/${id}`);
  }

  initiateOnboarding(body: { employeeId: string; templateId?: string; startDate?: string }): Observable<any> {
    return this.http.post<any>(`${this.onUrl}/initiate`, body);
  }

  updateOnboardingTask(taskId: string, body: { status: string; notes?: string }): Observable<any> {
    return this.http.patch<any>(`${this.onUrl}/tasks/${taskId}`, body);
  }

  // ── Offboarding Templates ─────────────────────────────────
  listOffboardingTemplates(): Observable<any> {
    return this.http.get<any>(`${this.offUrl}/templates`);
  }

  // ── Offboarding Instances ─────────────────────────────────
  listOffboardings(query: { status?: string } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<any>(this.offUrl, { params });
  }

  getOffboardingById(id: string): Observable<any> {
    return this.http.get<any>(`${this.offUrl}/${id}`);
  }

  initiateOffboarding(body: { employeeId: string; lastWorkDay: string; exitReason?: string }): Observable<any> {
    return this.http.post<any>(`${this.offUrl}/initiate`, body);
  }

  updateOffboardingTask(taskId: string, body: { status: string; notes?: string }): Observable<any> {
    return this.http.patch<any>(`${this.offUrl}/tasks/${taskId}`, body);
  }
}
