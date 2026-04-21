import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/recruitment`;

  // Public/Internal Job Board
  getJobs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/jobs`);
  }

  getJobById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/jobs/${id}`);
  }

  applyToJob(applicationData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apply`, applicationData);
  }

  // Admin/HR Job Management
  createJob(job: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jobs`, job);
  }

  updateJob(id: string, job: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/jobs/${id}`, job);
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/jobs/${id}`);
  }

  // Pipeline & Applications
  getJobApplications(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/jobs/${jobId}/applications`);
  }

  getApplicationDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/applications/${id}`);
  }

  moveCandidate(applicationId: string, stage: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/applications/${applicationId}/move`, { stage });
  }

  scheduleInterview(applicationId: string, interviewData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/applications/${applicationId}/interview`, interviewData);
  }

  uploadResume(candidateId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('resume', file);
    return this.http.post<any>(`${this.apiUrl}/candidates/${candidateId}/resume`, formData);
  }
}
