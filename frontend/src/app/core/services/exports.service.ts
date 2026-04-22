import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/exports`;

  exportEmployeesExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/employees/excel`, { responseType: 'blob' });
  }

  exportPayrollPDF(payrollId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/payroll/${payrollId}/pdf`, { responseType: 'blob' });
  }

  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
