import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ONBOARDING' | 'OFFBOARDING';
  email?: string;
  department?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  hireDate: string;
  phoneNumber?: string;
  // Add other fields as needed from the backend response
}

export interface EmployeeStats {
  total: number;
  active: number;
  onboarding: number;
  departmentsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/employees`;

  getEmployees(query: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(query).forEach(key => {
      if (query[key]) {
        params = params.set(key, query[key]);
      }
    });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getEmployeeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<EmployeeStats> {
    return this.http.get<EmployeeStats>(`${this.apiUrl}/stats`);
  }

  createEmployee(employee: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, employee);
  }

  updateEmployee(id: string, employee: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getEmployeeTeam(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/team`);
  }

  getEmployeeOrgPath(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/org-path`);
  }

  getEmployeeHistory(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/history`);
  }
}
