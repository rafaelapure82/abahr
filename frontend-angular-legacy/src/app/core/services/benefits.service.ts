import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BenefitsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/benefits`;

  // Plans
  getPlans(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/plans`);
  }

  getPlanById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/plans/${id}`);
  }

  createPlan(plan: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/plans`, plan);
  }

  deletePlan(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/plans/${id}`);
  }

  // Enrollments
  enroll(enrollment: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enroll`, enrollment);
  }

  getEmployeeBenefits(employeeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employee/${employeeId}`);
  }

  updateEnrollmentStatus(enrollmentId: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/enrollments/${enrollmentId}/status`, { status });
  }
}
