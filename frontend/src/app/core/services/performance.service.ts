import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/performance`;

  // Templates
  getTemplates(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/templates`);
  }

  createTemplate(template: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/templates`, template);
  }

  // Cycles & Reviews
  createCycle(cycle: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cycles`, cycle);
  }

  getReviews(query: any = {}): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reviews`, { params: query });
  }

  getReviewById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reviews/${id}`);
  }

  submitSelfEvaluation(reviewId: string, evaluation: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reviews/${reviewId}/submit-self`, evaluation);
  }

  submitManagerEvaluation(reviewId: string, evaluation: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reviews/${reviewId}/submit-manager`, evaluation);
  }

  shareReview(reviewId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reviews/${reviewId}/share`, {});
  }

  // 360 Feedback
  request360Feedback(reviewId: string, feedbackRequest: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reviews/${reviewId}/request-feedback`, feedbackRequest);
  }

  submit360Feedback(feedbackId: string, feedback: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/feedback/${feedbackId}/submit`, feedback);
  }

  // Reports
  getPerformanceReport(employeeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/${employeeId}`);
  }

  // Goals
  getGoals(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/goals`);
  }

  upsertGoal(goal: any): Observable<any> {
    if (goal.id) {
      return this.http.put<any>(`${this.apiUrl}/goals/${goal.id}`, goal);
    }
    return this.http.post<any>(`${this.apiUrl}/goals`, goal);
  }
}
