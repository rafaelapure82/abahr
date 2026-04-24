import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/departments`;

  // ── Departments ────────────────────────────────────────
  getDepartments(query: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v != null) params = params.set(k, String(v)); });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getDepartmentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getTree(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tree`);
  }

  getOrgChart(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/org-chart`);
  }

  createDepartment(dept: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, dept);
  }

  updateDepartment(id: string, dept: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, dept);
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ── Positions ──────────────────────────────────────────
  getPositions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/positions/all`);
  }

  createPosition(pos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/positions`, pos);
  }

  // ── Locations ──────────────────────────────────────────
  getLocations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/locations/all`);
  }

  createLocation(loc: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/locations`, loc);
  }
}
