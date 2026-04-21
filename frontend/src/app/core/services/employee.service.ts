import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  jobTitle: string;
  status: EmploymentStatus;
  employmentType: EmploymentType;
  email?: string;
  department?: { id: string; name: string };
  manager?: { id: string; firstName: string; lastName: string };
  hireDate: string;
  phoneNumber?: string;
  workEmail?: string;
  personalEmail?: string;
  workPhone?: string;
  personalPhone?: string;
  avatarUrl?: string;
  gender?: Gender;
  dateOfBirth?: string;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  baseSalary?: number;
  currency?: string;
  salaryFrequency?: PayrollFrequency;
  bankName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  taxId?: string;
  probationEndDate?: string;
  terminationDate?: string;
  terminationReason?: string;
  isRemote?: boolean;
  timeZone?: string;
  position?: { id: string; title: string; code: string };
  location?: { id: string; name: string; city: string };
  directReports?: { id: string; firstName: string; lastName: string; jobTitle: string }[];
  user?: {
    id: string;
    email: string;
    lastLoginAt?: string;
    roles?: { role: { name: string } }[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  onboarding: number;
  departmentsCount: number;
}

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  firstName?: string;
  lastName?: string;
  employeeCode?: string;
  departmentId?: string;
  status?: EmploymentStatus;
  type?: EmploymentType;
  managerId?: string;
  sortBy?: 'firstName' | 'lastName' | 'hireDate' | 'jobTitle' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface EmployeeHistory {
  id: string;
  action: AuditAction;
  description: string;
  oldValues?: any;
  newValues?: any;
  createdAt: string;
  user?: { email: string };
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateCount: number;
  onTimePercentage: number;
  records: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface LeaveSummary {
  totalDays: number;
  pending: number;
  approved: number;
  rejected: number;
  requests: LeaveRequest[];
}

export interface LeaveRequest {
  id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason?: string;
  reviewedAt?: string;
}

export interface PerformanceSummary {
  currentCycle?: {
    id: string;
    name: string;
    status: string;
    dueDate?: string;
  };
  reviewsCount: number;
  averageScore?: number;
  goalsCompleted: number;
  goalsTotal: number;
}

type EmploymentStatus = 'ACTIVE' | 'PROBATION' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED' | 'RETIRED';
type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'FREELANCE' | 'TEMPORARY';
type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER';
type PayrollFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ANNUALLY';
type DocumentType = 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'EMPLOYMENT_CONTRACT' | 'NDA' | 'WORK_PERMIT' | 'TAX_FORM' | 'DEGREE_CERTIFICATE' | 'PROFESSIONAL_LICENSE' | 'PERFORMANCE_REVIEW_DOC' | 'DISCIPLINARY_NOTICE' | 'RESIGNATION_LETTER' | 'OTHER';
type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'RESTORE';
type LeaveType = 'VACATION' | 'SICK' | 'PERSONAL' | 'MATERNITY' | 'PATERNITY' | 'PARENTAL' | 'BEREAVEMENT' | 'UNPAID';
type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/employees`;

  getEmployees(query: EmployeeQuery = {}): Observable<PaginatedResponse<Employee>> {
    let params = new HttpParams();
    Object.keys(query).forEach(key => {
      const value = query[key as keyof EmployeeQuery];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<Employee>>(this.apiUrl, { params });
  }

  getEmployeeById(id: string): Observable<{ data: Employee }> {
    return this.http.get<{ data: Employee }>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<EmployeeStats> {
    return this.http.get<EmployeeStats>(`${this.apiUrl}/stats`);
  }

  createEmployee(employee: Partial<Employee>): Observable<{ data: Employee }> {
    return this.http.post<{ data: Employee }>(this.apiUrl, employee);
  }

  updateEmployee(id: string, employee: Partial<Employee>): Observable<{ data: Employee }> {
    return this.http.patch<{ data: Employee }>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEmployeeTeam(id: string): Observable<{ data: Employee[] }> {
    return this.http.get<{ data: Employee[] }>(`${this.apiUrl}/${id}/team`);
  }

  getEmployeeOrgPath(id: string): Observable<{ data: Employee[] }> {
    return this.http.get<{ data: Employee[] }>(`${this.apiUrl}/${id}/org-path`);
  }

  getEmployeeHistory(id: string): Observable<{ data: EmployeeHistory[] }> {
    return this.http.get<{ data: EmployeeHistory[] }>(`${this.apiUrl}/${id}/history`);
  }

  getDepartments(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${environment.apiUrl}/departments`);
  }

  getManagers(excludeId?: string): Observable<{ data: Employee[] }> {
    let params = new HttpParams();
    if (excludeId) params = params.set('excludeId', excludeId);
    params = params.set('status', 'ACTIVE');
    return this.http.get<{ data: Employee[] }>(`${this.apiUrl}`, { params });
  }

  getPositions(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${environment.apiUrl}/positions`);
  }

  getLocations(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${environment.apiUrl}/locations`);
  }

  uploadDocument(employeeId: string, file: File, type: DocumentType): Observable<{ data: Document }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.http.post<{ data: Document }>(`${this.apiUrl}/${employeeId}/documents`, formData);
  }

  getDocuments(employeeId: string): Observable<{ data: Document[] }> {
    return this.http.get<{ data: Document[] }>(`${this.apiUrl}/${employeeId}/documents`);
  }

  deleteDocument(docId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${docId}`);
  }

  getAttendanceSummary(employeeId: string, year?: number, month?: number): Observable<{ data: AttendanceSummary }> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    if (month) params = params.set('month', String(month));
    return this.http.get<{ data: AttendanceSummary }>(`${this.apiUrl}/${employeeId}/attendance-summary`, { params });
  }

  getLeaveSummary(employeeId: string, year?: number): Observable<{ data: LeaveSummary }> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    return this.http.get<{ data: LeaveSummary }>(`${this.apiUrl}/${employeeId}/leave-summary`, { params });
  }

  getPerformanceSummary(employeeId: string): Observable<{ data: PerformanceSummary }> {
    return this.http.get<{ data: PerformanceSummary }>(`${this.apiUrl}/${employeeId}/performance-summary`);
  }
}