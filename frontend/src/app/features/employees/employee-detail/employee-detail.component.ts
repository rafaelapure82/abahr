import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee, Document, AttendanceSummary, LeaveSummary, PerformanceSummary, DocumentType, EmployeeHistory } from '../../../core/services/employee.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, Mail, Phone, MapPin, Briefcase, Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Upload, FileText, File, Image, X, Eye, Download, Trash2, Clock, User, Award, FileCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-angular';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    LucideAngularModule
  ],
  template: `
    <div class="space-y-6" *ngIf="employee">
      <!-- Header / Back -->
      <div class="flex items-center justify-between">
        <a routerLink="/employees" class="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <lucide-icon name="chevron-left" size="16" class="mr-1"></lucide-icon> Back to Directory
        </a>
        <div class="flex gap-2">
          <app-button variant="outline" size="sm" (click)="editEmployee()">
            <lucide-icon name="briefcase" size="16" class="mr-2"></lucide-icon> Edit Profile
          </app-button>
          <app-button variant="destructive" size="sm">
            <lucide-icon name="trash2" size="16" class="mr-2"></lucide-icon> Terminate
          </app-button>
        </div>
      </div>

      <!-- Profile Overview Card -->
      <app-card class="border-none shadow-xl overflow-hidden">
        <div class="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative"></div>
        <app-card-content class="relative -mt-12 pb-8">
           <div class="flex flex-col md:flex-row items-end gap-6 px-4">
              <div class="w-32 h-32 rounded-2xl bg-card border-4 border-card shadow-lg flex items-center justify-center text-4xl font-bold text-primary uppercase">
                {{ employee.firstName[0] }}{{ employee.lastName[0] }}
              </div>
              <div class="flex-1 mb-2">
                <h2 class="text-3xl font-bold">{{ employee.firstName }} {{ employee.lastName }}</h2>
                <div class="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                  <span class="flex items-center gap-1.5">
                    <lucide-icon name="briefcase" size="16"></lucide-icon> {{ employee.jobTitle }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <lucide-icon name="map-pin" size="16"></lucide-icon> {{ employee.department?.name || 'Unassigned' }}
                  </span>
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        [class]="getStatusClass(employee.status)">
                    {{ employee.status }}
                  </span>
                </div>
              </div>
           </div>
        </app-card-content>
      </app-card>

      <!-- Tabs -->
      <div class="border-b border-border">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button *ngFor="let tab of tabs"
                  (click)="activeTab.set(tab.id)"
                  class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                  [class.border-primary]="activeTab() === tab.id"
                  [class.text-primary]="activeTab() === tab.id"
                  [class.border-transparent]="activeTab() !== tab.id"
                  [class.text-muted-foreground]="activeTab() !== tab.id">
            <lucide-icon [name]="tab.icon" size="16" class="inline mr-2"></lucide-icon>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="mt-6">
        <!-- Overview Tab -->
        <div *ngIf="activeTab() === 'overview'" class="grid gap-6 md:grid-cols-3">
          <app-card class="md:col-span-1">
            <app-card-header>
              <app-card-title class="text-lg">Contact Details</app-card-title>
            </app-card-header>
            <app-card-content class="space-y-4">
              <div class="flex items-center gap-3">
                 <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                   <lucide-icon name="mail" size="16" class="text-muted-foreground"></lucide-icon>
                 </div>
                 <div>
                   <p class="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                   <p class="text-sm font-medium">{{ employee.email || 'Not provided' }}</p>
                 </div>
              </div>
              <div class="flex items-center gap-3">
                 <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                   <lucide-icon name="phone" size="16" class="text-muted-foreground"></lucide-icon>
                 </div>
                 <div>
                   <p class="text-xs text-muted-foreground uppercase font-semibold">Phone</p>
                   <p class="text-sm font-medium">{{ employee.phoneNumber || 'Not provided' }}</p>
                 </div>
              </div>
              <div class="flex items-center gap-3">
                 <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                   <lucide-icon name="map-pin" size="16" class="text-muted-foreground"></lucide-icon>
                 </div>
                 <div>
                   <p class="text-xs text-muted-foreground uppercase font-semibold">Address</p>
                   <p class="text-sm font-medium">
                     {{ employee.addressLine1 || 'Not provided' }}
                     {{ employee.city ? ', ' + employee.city : '' }}
                   </p>
                 </div>
              </div>
              <div class="border-t pt-4 mt-4" *ngIf="employee.emergencyName">
                <p class="text-xs text-muted-foreground uppercase font-semibold mb-2">Emergency Contact</p>
                <p class="text-sm font-medium">{{ employee.emergencyName }}</p>
                <p class="text-sm text-muted-foreground">{{ employee.emergencyPhone }} ({{ employee.emergencyRelation }})</p>
              </div>
            </app-card-content>
          </app-card>

          <app-card class="md:col-span-2">
            <app-card-header>
              <app-card-title class="text-lg">Employment Information</app-card-title>
            </app-card-header>
            <app-card-content class="grid gap-6 md:grid-cols-2">
              <div>
                <p class="text-xs text-muted-foreground uppercase font-semibold">Employee ID</p>
                <p class="text-lg font-bold text-primary mt-1">{{ employee.employeeCode }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground uppercase font-semibold">Hire Date</p>
                <p class="text-sm font-medium mt-1">{{ employee.hireDate | date:'longDate' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground uppercase font-semibold">Reporting To</p>
                <p class="text-sm font-medium mt-1">{{ employee.manager ? employee.manager.firstName + ' ' + employee.manager.lastName : 'No Manager' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground uppercase font-semibold">Employment Type</p>
                <p class="text-sm font-medium mt-1">{{ formatEmploymentType(employee.employmentType) }}</p>
              </div>
              <div *ngIf="employee.probationEndDate">
                <p class="text-xs text-muted-foreground uppercase font-semibold">Probation End</p>
                <p class="text-sm font-medium mt-1">{{ employee.probationEndDate | date:'longDate' }}</p>
              </div>
              <div *ngIf="employee.position">
                <p class="text-xs text-muted-foreground uppercase font-semibold">Position</p>
                <p class="text-sm font-medium mt-1">{{ employee.position.title }} ({{ employee.position.code }})</p>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Documents Tab -->
        <div *ngIf="activeTab() === 'documents'">
          <app-card>
            <app-card-header class="flex flex-row items-center justify-between">
              <app-card-title>Employee Documents</app-card-title>
              <app-button size="sm" (click)="showUploadModal.set(true)">
                <lucide-icon name="upload" size="16" class="mr-2"></lucide-icon> Upload Document
              </app-button>
            </app-card-header>
            <app-card-content>
              <!-- Upload Modal -->
              <div *ngIf="showUploadModal()" class="mb-6 p-4 border-2 border-dashed border-border rounded-lg bg-muted/30">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="font-medium">Upload New Document</h4>
                  <button (click)="showUploadModal.set(false)" class="text-muted-foreground hover:text-foreground">
                    <lucide-icon name="x" size="18"></lucide-icon>
                  </button>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="text-sm font-medium block mb-1">Document Type</label>
                    <select [(ngModel)]="uploadType" class="w-full px-3 py-2 border rounded-md bg-background">
                      <option value="NATIONAL_ID">National ID</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVERS_LICENSE">Driver's License</option>
                      <option value="EMPLOYMENT_CONTRACT">Employment Contract</option>
                      <option value="NDA">NDA</option>
                      <option value="WORK_PERMIT">Work Permit</option>
                      <option value="TAX_FORM">Tax Form</option>
                      <option value="DEGREE_CERTIFICATE">Degree Certificate</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">File</label>
                    <input type="file" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                           class="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground file:cursor-pointer">
                  </div>
                  <!-- Preview -->
                  <div *ngIf="selectedFile()" class="p-3 bg-background rounded-lg border">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <lucide-icon [name]="getFileIcon()" size="20"></lucide-icon>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium">{{ selectedFile()?.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ formatFileSize(selectedFile()?.size || 0) }}</p>
                      </div>
                      <button (click)="clearSelectedFile()" class="text-muted-foreground hover:text-destructive">
                        <lucide-icon name="x" size="16"></lucide-icon>
                      </button>
                    </div>
                    <div *ngIf="isImageFile()" class="mt-3">
                      <img [src]="filePreviewUrl()" class="max-h-40 rounded border" alt="Preview">
                    </div>
                  </div>
                  <div class="flex justify-end gap-2">
                    <app-button variant="outline" size="sm" (click)="showUploadModal.set(false)">Cancel</app-button>
                    <app-button size="sm" (click)="uploadDocument()" [disabled]="!selectedFile() || uploading()">
                      <lucide-icon name="upload" size="16" class="mr-2"></lucide-icon> {{ uploading() ? 'Uploading...' : 'Upload' }}
                    </app-button>
                  </div>
                </div>
              </div>

              <!-- Documents List -->
              <div *ngIf="documents().length === 0 && !loadingDocuments()" class="text-center py-8 text-muted-foreground">
                <lucide-icon name="file-text" size="48" class="mx-auto mb-4 opacity-50"></lucide-icon>
                <p>No documents uploaded yet</p>
              </div>
              <div *ngIf="loadingDocuments()" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
              <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3" *ngIf="documents().length > 0">
                <div *ngFor="let doc of documents()" class="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <lucide-icon [name]="getDocumentIcon(doc.mimeType)" size="20" class="text-muted-foreground"></lucide-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium truncate">{{ doc.name }}</p>
                      <p class="text-xs text-muted-foreground">{{ formatDocumentType(doc.type) }}</p>
                      <p class="text-xs text-muted-foreground">{{ formatFileSize(doc.fileSize) }} • {{ doc.uploadedAt | date:'short' }}</p>
                    </div>
                    <div class="flex gap-1">
                      <button (click)="viewDocument(doc)" class="p-1 hover:bg-background rounded" title="View">
                        <lucide-icon name="eye" size="16" class="text-muted-foreground"></lucide-icon>
                      </button>
                      <a [href]="doc.fileUrl" download class="p-1 hover:bg-background rounded" title="Download">
                        <lucide-icon name="download" size="16" class="text-muted-foreground"></lucide-icon>
                      </a>
                      <button (click)="deleteDocument(doc)" class="p-1 hover:bg-background rounded" title="Delete">
                        <lucide-icon name="trash2" size="16" class="text-muted-foreground"></lucide-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Attendance Tab -->
        <div *ngIf="activeTab() === 'attendance'">
          <app-card>
            <app-card-header>
              <app-card-title>Attendance Summary</app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="grid gap-4 md:grid-cols-5 mb-6">
                <div class="p-4 bg-muted/50 rounded-lg text-center">
                  <p class="text-2xl font-bold">{{ attendanceSummary()?.totalDays || 0 }}</p>
                  <p class="text-xs text-muted-foreground uppercase">Total Days</p>
                </div>
                <div class="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                  <p class="text-2xl font-bold text-green-600">{{ attendanceSummary()?.presentDays || 0 }}</p>
                  <p class="text-xs text-muted-foreground uppercase">Present</p>
                </div>
                <div class="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg text-center">
                  <p class="text-2xl font-bold text-red-600">{{ attendanceSummary()?.absentDays || 0 }}</p>
                  <p class="text-xs text-muted-foreground uppercase">Absent</p>
                </div>
                <div class="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg text-center">
                  <p class="text-2xl font-bold text-yellow-600">{{ attendanceSummary()?.lateCount || 0 }}</p>
                  <p class="text-xs text-muted-foreground uppercase">Late</p>
                </div>
                <div class="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                  <p class="text-2xl font-bold text-blue-600">{{ attendanceSummary()?.onTimePercentage || 0 }}%</p>
                  <p class="text-xs text-muted-foreground uppercase">On Time</p>
                </div>
              </div>
              
              <div class="flex items-center gap-4 mb-4">
                <select [(ngModel)]="attendanceMonth" (ngModelChange)="loadAttendance()" class="px-3 py-2 border rounded-md bg-background">
                  <option [value]="1">January</option>
                  <option [value]="2">February</option>
                  <option [value]="3">March</option>
                  <option [value]="4">April</option>
                  <option [value]="5">May</option>
                  <option [value]="6">June</option>
                  <option [value]="7">July</option>
                  <option [value]="8">August</option>
                  <option [value]="9">September</option>
                  <option [value]="10">October</option>
                  <option [value]="11">November</option>
                  <option [value]="12">December</option>
                </select>
                <select [(ngModel)]="attendanceYear" (ngModelChange)="loadAttendance()" class="px-3 py-2 border rounded-md bg-background">
                  <option [value]="2026">2026</option>
                  <option [value]="2025">2025</option>
                  <option [value]="2024">2024</option>
                </select>
              </div>

              <div class="border rounded-lg overflow-hidden">
                <table class="w-full">
                  <thead class="bg-muted/50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Date</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Check In</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Check Out</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Hours</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let record of attendanceSummary()?.records || []" class="border-t">
                      <td class="px-4 py-3">{{ record.date | date:'mediumDate' }}</td>
                      <td class="px-4 py-3">{{ record.checkIn || '-' }}</td>
                      <td class="px-4 py-3">{{ record.checkOut || '-' }}</td>
                      <td class="px-4 py-3">{{ record.totalHours || '-' }}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                              [class]="getAttendanceStatusClass(record.status)">
                          {{ record.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Leaves Tab -->
        <div *ngIf="activeTab() === 'leaves'">
          <app-card>
            <app-card-header>
              <app-card-title>Leave Requests</app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="grid gap-4 md:grid-cols-4 mb-6">
                <div class="p-4 bg-muted/50 rounded-lg text-center">
                  <p class="text-2xl font-bold">{{ leaveSummary()?.totalDays || 0 }}</p>
                  <p class="text-xs text-muted-foreground uppercase">Total Days</p>
                </div>
                <div class="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg text-center">
                  <p class="text-2xl font-bold text-yellow-600">{{ leaveSummary()?.pending || 0 }}</p>
                  <p class="text-xs text-muted-foreground uppercase">Pending</p>
                </div>
                <div class="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                  <p class="text-2xl font-bold text-green-600">{{ leaveSummary()?.approved || 0 }}</p>
                  <p class="text-xs text-muted-foreground uppercase">Approved</p>
                </div>
                <div class="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg text-center">
                  <p class="text-2xl font-bold text-red-600">{{ leaveSummary()?.rejected || 0 }}</p>
                  <p class="text-xs text-muted-foreground uppercase">Rejected</p>
                </div>
              </div>

              <div class="border rounded-lg overflow-hidden">
                <table class="w-full">
                  <thead class="bg-muted/50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Type</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Start Date</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">End Date</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Days</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Reason</th>
                      <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let request of leaveSummary()?.requests || []" class="border-t">
                      <td class="px-4 py-3">{{ formatLeaveType(request.leaveType) }}</td>
                      <td class="px-4 py-3">{{ request.startDate | date:'mediumDate' }}</td>
                      <td class="px-4 py-3">{{ request.endDate | date:'mediumDate' }}</td>
                      <td class="px-4 py-3">{{ request.days }}</td>
                      <td class="px-4 py-3 max-w-xs truncate">{{ request.reason || '-' }}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                              [class]="getLeaveStatusClass(request.status)">
                          {{ request.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Performance Tab -->
        <div *ngIf="activeTab() === 'performance'">
          <app-card>
            <app-card-header>
              <app-card-title>Performance Summary</app-card-title>
            </app-card-header>
            <app-card-content>
              <div *ngIf="performanceSummary()" class="grid gap-6 md:grid-cols-3">
                <div class="p-4 bg-muted/50 rounded-lg">
                  <p class="text-xs text-muted-foreground uppercase font-semibold">Current Review Cycle</p>
                  <p class="text-lg font-medium mt-1">{{ performanceSummary()?.currentCycle?.name || 'No active cycle' }}</p>
                  <p class="text-sm text-muted-foreground" *ngIf="performanceSummary()?.currentCycle">
                    {{ performanceSummary()?.currentCycle?.status }} • Due: {{ performanceSummary()?.currentCycle?.dueDate | date:'mediumDate' }}
                  </p>
                </div>
                <div class="p-4 bg-muted/50 rounded-lg">
                  <p class="text-xs text-muted-foreground uppercase font-semibold">Reviews Completed</p>
                  <p class="text-2xl font-bold mt-1">{{ performanceSummary()?.reviewsCount || 0 }}</p>
                </div>
                <div class="p-4 bg-muted/50 rounded-lg">
                  <p class="text-xs text-muted-foreground uppercase font-semibold">Average Score</p>
                  <p class="text-2xl font-bold mt-1">{{ performanceSummary()?.averageScore || '-' }}</p>
                </div>
                <div class="p-4 bg-muted/50 rounded-lg md:col-span-3">
                  <p class="text-xs text-muted-foreground uppercase font-semibold">Goals Progress</p>
                  <div class="mt-2">
                    <div class="flex justify-between text-sm mb-1">
                      <span>{{ performanceSummary()?.goalsCompleted || 0 }} of {{ performanceSummary()?.goalsTotal || 0 }} goals completed</span>
                      <span>{{ performanceSummary()?.goalsTotal ? (performanceSummary()!.goalsCompleted / performanceSummary()!.goalsTotal * 100).toFixed(0) : 0 }}%</span>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2">
                      <div class="bg-primary h-2 rounded-full" 
                           [style.width.%]="performanceSummary()?.goalsTotal ? (performanceSummary()!.goalsCompleted / performanceSummary()!.goalsTotal * 100) : 0"></div>
                    </div>
                  </div>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- History Tab -->
        <div *ngIf="activeTab() === 'history'">
          <app-card>
            <app-card-header>
              <app-card-title>Employee History</app-card-title>
            </app-card-header>
            <app-card-content>
              <div *ngIf="loadingHistory()" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
              <div class="space-y-4" *ngIf="!loadingHistory() && history().length > 0">
                <div *ngFor="let entry of history()" class="flex gap-4 p-4 border rounded-lg">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                       [class]="getHistoryActionClass(entry.action)">
                    <lucide-icon [name]="getHistoryIcon(entry.action)" size="18"></lucide-icon>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium">{{ entry.description }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ entry.createdAt | date:'medium' }} • {{ entry.user?.email || 'System' }}
                    </p>
                  </div>
                </div>
              </div>
              <div *ngIf="!loadingHistory() && history().length === 0" class="text-center py-8 text-muted-foreground">
                <p>No history records found</p>
              </div>
            </app-card-content>
          </app-card>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!employee && loading" class="flex items-center justify-center min-h-[400px]">
       <div class="text-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p class="text-muted-foreground italic">Fetching profile details...</p>
       </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  
  employee: Employee | null = null;
  loading = true;
  
  activeTab = signal('overview');
  previousTab = '';

  documents = signal<Document[]>([]);
  loadingDocuments = signal(false);
  attendanceSummary = signal<AttendanceSummary | null>(null);
  leaveSummary = signal<LeaveSummary | null>(null);
  performanceSummary = signal<PerformanceSummary | null>(null);
  history = signal<EmployeeHistory[]>([]);
  loadingHistory = signal(false);
  
  showUploadModal = signal(false);
  selectedFile = signal<File | null>(null);
  filePreviewUrl = signal<string | null>(null);
  uploadType: DocumentType = 'OTHER';
  uploading = signal(false);
  
  attendanceMonth = new Date().getMonth() + 1;
  attendanceYear = new Date().getFullYear();

  tabs = [
    { id: 'overview', label: 'Overview', icon: 'user' },
    { id: 'documents', label: 'Documents', icon: 'file-text' },
    { id: 'attendance', label: 'Attendance', icon: 'clock' },
    { id: 'leaves', label: 'Leaves', icon: 'calendar' },
    { id: 'performance', label: 'Performance', icon: 'award' },
    { id: 'history', label: 'History', icon: 'file-check' }
  ];

  constructor() {
    effect(() => {
      const tab = this.activeTab();
      if (tab !== this.previousTab && this.employee) {
        this.loadTabData(tab);
        this.previousTab = tab;
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchDetails(id);
    }
  }

  fetchDetails(id: string) {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (res) => {
        this.employee = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching employee details:', err);
        this.loading = false;
      }
    });
  }

  loadTabData(tabId: string) {
    if (!this.employee) return;
    
    switch (tabId) {
      case 'documents':
        this.loadDocuments();
        break;
      case 'attendance':
        this.loadAttendance();
        break;
      case 'leaves':
        this.loadLeaves();
        break;
      case 'performance':
        this.loadPerformance();
        break;
      case 'history':
        this.loadHistory();
        break;
    }
  }

  loadDocuments() {
    if (!this.employee) return;
    this.loadingDocuments.set(true);
    this.employeeService.getDocuments(this.employee.id).subscribe({
      next: (res) => {
        this.documents.set(res.data);
        this.loadingDocuments.set(false);
      },
      error: () => this.loadingDocuments.set(false)
    });
  }

  loadAttendance() {
    if (!this.employee) return;
    this.employeeService.getAttendanceSummary(this.employee.id, this.attendanceYear, this.attendanceMonth).subscribe({
      next: (res) => this.attendanceSummary.set(res.data)
    });
  }

  loadLeaves() {
    if (!this.employee) return;
    this.employeeService.getLeaveSummary(this.employee.id, this.attendanceYear).subscribe({
      next: (res) => this.leaveSummary.set(res.data)
    });
  }

  loadPerformance() {
    if (!this.employee) return;
    this.employeeService.getPerformanceSummary(this.employee.id).subscribe({
      next: (res) => this.performanceSummary.set(res.data)
    });
  }

  loadHistory() {
    if (!this.employee) return;
    this.loadingHistory.set(true);
    this.employeeService.getEmployeeHistory(this.employee.id).subscribe({
      next: (res) => {
        this.history.set(res.data);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false)
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => this.filePreviewUrl.set(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        this.filePreviewUrl.set(null);
      }
    }
  }

  clearSelectedFile() {
    this.selectedFile.set(null);
    this.filePreviewUrl.set(null);
  }

  isImageFile(): boolean {
    const file = this.selectedFile();
    return file ? file.type.startsWith('image/') : false;
  }

  getFileIcon(): string {
    if (this.isImageFile()) return 'image';
    const file = this.selectedFile();
    if (!file) return 'file';
    if (file.type === 'application/pdf') return 'file-text';
    return 'file';
  }

  uploadDocument() {
    if (!this.employee || !this.selectedFile()) return;
    this.uploading.set(true);
    this.employeeService.uploadDocument(this.employee.id, this.selectedFile()!, this.uploadType).subscribe({
      next: () => {
        this.uploading.set(false);
        this.showUploadModal.set(false);
        this.clearSelectedFile();
        this.loadDocuments();
      },
      error: () => this.uploading.set(false)
    });
  }

  deleteDocument(doc: Document) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    this.employeeService.deleteDocument(doc.id).subscribe({
      next: () => this.loadDocuments()
    });
  }

  viewDocument(doc: Document) {
    window.open(doc.fileUrl, '_blank');
  }

  editEmployee() {
    this.router.navigate(['/employees', this.employee?.id, 'edit']);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatEmploymentType(type: string): string {
    const map: Record<string, string> = {
      'FULL_TIME': 'Full Time',
      'PART_TIME': 'Part Time',
      'CONTRACT': 'Contract',
      'INTERN': 'Intern',
      'FREELANCE': 'Freelance',
      'TEMPORARY': 'Temporary'
    };
    return map[type] || type;
  }

  formatDocumentType(type: string): string {
    const map: Record<string, string> = {
      'NATIONAL_ID': 'National ID',
      'PASSPORT': 'Passport',
      'DRIVERS_LICENSE': 'Driver\'s License',
      'EMPLOYMENT_CONTRACT': 'Employment Contract',
      'NDA': 'NDA',
      'WORK_PERMIT': 'Work Permit',
      'TAX_FORM': 'Tax Form',
      'DEGREE_CERTIFICATE': 'Degree Certificate',
      'OTHER': 'Other'
    };
    return map[type] || type;
  }

  formatLeaveType(type: string): string {
    const map: Record<string, string> = {
      'VACATION': 'Vacation',
      'SICK': 'Sick Leave',
      'PERSONAL': 'Personal',
      'MATERNITY': 'Maternity',
      'PATERNITY': 'Paternity',
      'PARENTAL': 'Parental',
      'BEREAVEMENT': 'Bereavement',
      'UNPAID': 'Unpaid Leave'
    };
    return map[type] || type;
  }

  getDocumentIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'file-text';
    return 'file';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'PROBATION': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'ON_LEAVE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'SUSPENDED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'TERMINATED': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      'RETIRED': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return classes[status] || 'bg-muted text-muted-foreground';
  }

  getAttendanceStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PRESENT': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'ABSENT': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'LATE': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return classes[status] || 'bg-muted text-muted-foreground';
  }

  getLeaveStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'APPROVED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'CANCELLED': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return classes[status] || 'bg-muted text-muted-foreground';
  }

  getHistoryActionClass(action: string): string {
    const classes: Record<string, string> = {
      'CREATE': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'UPDATE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'DELETE': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'SOFT_DELETE': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      'RESTORE': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return classes[action] || 'bg-muted text-muted-foreground';
  }

  getHistoryIcon(action: string): string {
    const icons: Record<string, string> = {
      'CREATE': 'plus-circle',
      'UPDATE': 'edit',
      'DELETE': 'trash2',
      'SOFT_DELETE': 'trash2',
      'RESTORE': 'refresh-cw'
    };
    return icons[action] || 'file';
  }
}