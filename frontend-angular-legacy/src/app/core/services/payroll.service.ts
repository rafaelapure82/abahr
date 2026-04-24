import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payroll`;

  generate(body: {
    departmentId?: string;
    periodStart: string;
    periodEnd: string;
    payDate: string;
    frequency?: string;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, body);
  }

  list(query: { status?: string; departmentId?: string; page?: number; limit?: number } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  approve(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/approve`, {});
  }

  getSummary(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/summary`);
  }

  downloadItemPDF(itemId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/item/${itemId}/pdf`, { responseType: 'blob' });
  }

  exportExcel(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/excel`, { responseType: 'blob' });
  }

  /** Trigger browser download from a Blob */
  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
