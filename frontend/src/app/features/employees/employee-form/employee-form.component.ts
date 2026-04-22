import { Component, inject, OnInit, ChangeDetectionStrategy, signal, computed, linkedSignal, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee, Document, DocumentType, EmployeeQuery } from '../../../core/services/employee.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-employee-form',
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
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <a routerLink="/employees" class="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <lucide-icon name="chevron-left" size="16" class="mr-1"></lucide-icon> Back to Directory
        </a>
        <h1 class="text-2xl font-bold">{{ isEditMode() ? 'Edit Employee' : 'Create New Employee' }}</h1>
        <div></div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-border">
        <nav class="flex space-x-8" aria-label="Tabs">
          @for (tab of tabs(); track tab.id) {
            <button (click)="activeTab.set(tab.id)"
                    class="py-4 px-1 border-b-2 font-medium text-sm transition-colors relative"
                    [class.border-primary]="activeTab() === tab.id"
                    [class.text-primary]="activeTab() === tab.id"
                    [class.border-transparent]="activeTab() !== tab.id"
                    [class.text-muted-foreground]="activeTab() !== tab.id">
              <lucide-icon [name]="tab.icon" size="16" class="inline mr-2"></lucide-icon>
              {{ tab.label }}
              @if (hasError(tab.id)) {
                <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              }
            </button>
          }
        </nav>
      </div>

      <!-- Form Content -->
      <form (ngSubmit)="onSubmit()">
        <app-card>
          <app-card-content class="p-6">
            @if (activeTab() === 'personal') {
              <!-- Personal Data Tab -->
              <div class="space-y-6">
                <div class="grid gap-6 md:grid-cols-2">
                  <div>
                    <label class="text-sm font-medium block mb-1">First Name *</label>
                    <input type="text" [ngModel]="formData().firstName" (ngModelChange)="updateField('firstName', $event)" name="firstName" required
                           class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                           [class.border-red-500]="errors().firstName">
                    @if (errors().firstName) {
                      <p class="text-xs text-red-500 mt-1">{{ errors().firstName }}</p>
                    }
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Last Name *</label>
                    <input type="text" [ngModel]="formData().lastName" (ngModelChange)="updateField('lastName', $event)" name="lastName" required
                           class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                           [class.border-red-500]="errors().lastName">
                    @if (errors().lastName) {
                      <p class="text-xs text-red-500 mt-1">{{ errors().lastName }}</p>
                    }
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Display Name</label>
                    <input type="text" [ngModel]="formData().displayName" (ngModelChange)="updateField('displayName', $event)" name="displayName"
                           class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Date of Birth</label>
                    <input type="date" [ngModel]="formData().dateOfBirth" (ngModelChange)="updateField('dateOfBirth', $event)" name="dateOfBirth"
                           class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Gender</label>
                    <select [ngModel]="formData().gender" (ngModelChange)="updateField('gender', $event)" name="gender"
                            class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="NON_BINARY">Non Binary</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer Not to Say</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Marital Status</label>
                    <select [ngModel]="formData().maritalStatus" (ngModelChange)="updateField('maritalStatus', $event)" name="maritalStatus"
                            class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select Status</option>
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Nationality</label>
                    <input type="text" [ngModel]="formData().nationality" (ngModelChange)="updateField('nationality', $event)" name="nationality"
                           class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  </div>
                </div>
              </div>
            }

            @if (activeTab() === 'work') {
              <!-- Work Data Tab -->
              <div class="space-y-6">
                <div class="grid gap-6 md:grid-cols-2">
                  <div>
                    <label class="text-sm font-medium block mb-1">Job Title *</label>
                    <input type="text" [ngModel]="formData().jobTitle" (ngModelChange)="updateField('jobTitle', $event)" name="jobTitle" required
                           class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                           [class.border-red-500]="errors().jobTitle">
                    @if (errors().jobTitle) {
                      <p class="text-xs text-red-500 mt-1">{{ errors().jobTitle }}</p>
                    }
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Department *</label>
                    <select [ngModel]="formData().departmentId" (ngModelChange)="updateField('departmentId', $event)" name="departmentId" required
                            class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            [class.border-red-500]="errors().departmentId">
                      <option value="">Select Department</option>
                      @for (dept of departmentsResource.value()?.data; track dept.id) {
                        <option [value]="dept.id">{{ dept.name }}</option>
                      }
                    </select>
                    @if (errors().departmentId) {
                      <p class="text-xs text-red-500 mt-1">{{ errors().departmentId }}</p>
                    }
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Manager</label>
                    <select [ngModel]="formData().managerId" (ngModelChange)="updateField('managerId', $event)" name="managerId"
                            class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">No Manager</option>
                      @for (mgr of managersResource.value()?.data; track mgr.id) {
                        <option [value]="mgr.id">{{ mgr.firstName }} {{ mgr.lastName }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Hire Date *</label>
                    <input type="date" [ngModel]="formData().hireDate" (ngModelChange)="updateField('hireDate', $event)" name="hireDate" required
                           class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                           [class.border-red-500]="errors().hireDate">
                    @if (errors().hireDate) {
                      <p class="text-xs text-red-500 mt-1">{{ errors().hireDate }}</p>
                    }
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Employment Type *</label>
                    <select [ngModel]="formData().employmentType" (ngModelChange)="updateField('employmentType', $event)" name="employmentType" required
                            class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            [class.border-red-500]="errors().employmentType">
                      <option value="">Select Type</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                      <option value="FREELANCE">Freelance</option>
                      <option value="TEMPORARY">Temporary</option>
                    </select>
                    @if (errors().employmentType) {
                      <p class="text-xs text-red-500 mt-1">{{ errors().employmentType }}</p>
                    }
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Status</label>
                    <select [ngModel]="formData().status" (ngModelChange)="updateField('status', $event)" name="status"
                            class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="ACTIVE">Active</option>
                      <option value="PROBATION">Probation</option>
                      <option value="ON_LEAVE">On Leave</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Base Salary</label>
                    <input type="number" [ngModel]="formData().baseSalary" (ngModelChange)="updateField('baseSalary', $event)" name="baseSalary"
                           class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Currency</label>
                    <select [ngModel]="formData().currency" (ngModelChange)="updateField('currency', $event)" name="currency"
                            class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="MXN">MXN</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Probation End Date</label>
                    <input type="date" [ngModel]="formData().probationEndDate" (ngModelChange)="updateField('probationEndDate', $event)" name="probationEndDate"
                           class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  </div>
                  <div>
                    <label class="text-sm font-medium block mb-1">Employee Code</label>
                    <input type="text" [ngModel]="formData().employeeCode" (ngModelChange)="updateField('employeeCode', $event)" name="employeeCode"
                           class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  </div>
                </div>
              </div>
            }

            @if (activeTab() === 'contact') {
              <!-- Contact Tab -->
              <div class="space-y-6">
                <div>
                  <h4 class="font-medium mb-4">Work Contact</h4>
                  <div class="grid gap-6 md:grid-cols-2">
                    <div>
                      <label class="text-sm font-medium block mb-1">Work Email *</label>
                      <input type="email" [ngModel]="formData().workEmail" (ngModelChange)="updateField('workEmail', $event)" name="workEmail" required
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                             [class.border-red-500]="errors().workEmail">
                      @if (errors().workEmail) {
                        <p class="text-xs text-red-500 mt-1">{{ errors().workEmail }}</p>
                      }
                    </div>
                    <div>
                      <label class="text-sm font-medium block mb-1">Work Phone</label>
                      <input type="tel" [ngModel]="formData().workPhone" (ngModelChange)="updateField('workPhone', $event)" name="workPhone"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="font-medium mb-4">Personal Contact</h4>
                  <div class="grid gap-6 md:grid-cols-2">
                    <div>
                      <label class="text-sm font-medium block mb-1">Personal Email</label>
                      <input type="email" [ngModel]="formData().personalEmail" (ngModelChange)="updateField('personalEmail', $event)" name="personalEmail"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="text-sm font-medium block mb-1">Personal Phone *</label>
                      <input type="tel" [ngModel]="formData().phoneNumber" (ngModelChange)="updateField('phoneNumber', $event)" name="phoneNumber" required
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                             [class.border-red-500]="errors().phoneNumber">
                      @if (errors().phoneNumber) {
                        <p class="text-xs text-red-500 mt-1">{{ errors().phoneNumber }}</p>
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="font-medium mb-4">Address</h4>
                  <div class="grid gap-6 md:grid-cols-2">
                    <div class="md:col-span-2">
                      <label class="text-sm font-medium block mb-1">Address Line 1</label>
                      <input type="text" [ngModel]="formData().addressLine1" (ngModelChange)="updateField('addressLine1', $event)" name="addressLine1"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div class="md:col-span-2">
                      <label class="text-sm font-medium block mb-1">Address Line 2</label>
                      <input type="text" [ngModel]="formData().addressLine2" (ngModelChange)="updateField('addressLine2', $event)" name="addressLine2"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="text-sm font-medium block mb-1">City</label>
                      <input type="text" [ngModel]="formData().city" (ngModelChange)="updateField('city', $event)" name="city"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="text-sm font-medium block mb-1">State/Province</label>
                      <input type="text" [ngModel]="formData().state" (ngModelChange)="updateField('state', $event)" name="state"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="text-sm font-medium block mb-1">Postal Code</label>
                      <input type="text" [ngModel]="formData().postalCode" (ngModelChange)="updateField('postalCode', $event)" name="postalCode"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="text-sm font-medium block mb-1">Country</label>
                      <input type="text" [ngModel]="formData().country" (ngModelChange)="updateField('country', $event)" name="country"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="font-medium mb-4">Emergency Contact</h4>
                  <div class="grid gap-6 md:grid-cols-3">
                    <div>
                      <label class="text-sm font-medium block mb-1">Name</label>
                      <input type="text" [ngModel]="formData().emergencyName" (ngModelChange)="updateField('emergencyName', $event)" name="emergencyName"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="text-sm font-medium block mb-1">Phone</label>
                      <input type="tel" [ngModel]="formData().emergencyPhone" (ngModelChange)="updateField('emergencyPhone', $event)" name="emergencyPhone"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                      <label class="text-sm font-medium block mb-1">Relationship</label>
                      <input type="text" [ngModel]="formData().emergencyRelation" (ngModelChange)="updateField('emergencyRelation', $event)" name="emergencyRelation"
                             class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (activeTab() === 'documents') {
              <!-- Documents Tab -->
              <div class="space-y-6">
                <div class="p-4 border-2 border-dashed border-border rounded-lg bg-muted/30">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-medium">Upload Documents</h4>
                  </div>
                  <div class="space-y-4">
                    <div>
                      <label class="text-sm font-medium block mb-1">Document Type</label>
                      <select [(ngModel)]="uploadType" name="uploadType"
                              class="w-full px-3 py-2 border rounded-md bg-background">
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
                    @if (selectedFile()) {
                      <div class="p-3 bg-background rounded-lg border">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <lucide-icon [name]="getFileIcon()" size="20"></lucide-icon>
                          </div>
                          <div class="flex-1">
                            <p class="text-sm font-medium">{{ selectedFile()?.name }}</p>
                            <p class="text-xs text-muted-foreground">{{ formatFileSize(selectedFile()?.size || 0) }}</p>
                          </div>
                          <button type="button" (click)="clearSelectedFile()" class="text-muted-foreground hover:text-destructive">
                            <lucide-icon name="x" size="16"></lucide-icon>
                          </button>
                        </div>
                        @if (isImageFile()) {
                          <div class="mt-3">
                            <img [src]="filePreviewUrl()" class="max-h-40 rounded border" alt="Preview">
                          </div>
                        }
                      </div>
                    }
                    <app-button type="button" variant="outline" size="sm" (click)="uploadDocument()" [disabled]="!selectedFile()">
                      <lucide-icon name="upload" size="16" class="mr-2"></lucide-icon> Add Document
                    </app-button>
                  </div>
                </div>

                @if (uploadedDocuments().length > 0) {
                  <div>
                    <h4 class="font-medium mb-4">Uploaded Documents</h4>
                    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      @for (doc of uploadedDocuments(); track doc.name) {
                        <div class="p-4 border rounded-lg">
                          <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                              <lucide-icon name="file-text" size="20" class="text-muted-foreground"></lucide-icon>
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="font-medium truncate">{{ doc.name }}</p>
                              <p class="text-xs text-muted-foreground">{{ formatDocumentType(doc.type) }}</p>
                            </div>
                            <button type="button" (click)="removeDocument(doc)" class="text-muted-foreground hover:text-destructive">
                              <lucide-icon name="x" size="16"></lucide-icon>
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </app-card-content>
        </app-card>

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between mt-6">
          @if (activeTab() !== 'personal') {
            <app-button type="button" variant="outline" (click)="previousTab()">
              <lucide-icon name="chevron-left" size="16" class="mr-2"></lucide-icon> Previous
            </app-button>
          } @else {
            <div></div>
          }
          <div class="flex gap-2">
            <app-button type="button" variant="outline" routerLink="/employees">Cancel</app-button>
            @if (activeTab() !== 'documents') {
              <app-button type="button" (click)="nextTab()">
                Next <lucide-icon name="chevron-right" size="16" class="ml-2"></lucide-icon>
              </app-button>
            } @else {
              <app-button type="submit" [disabled]="saving()">
                <lucide-icon name="save" size="16" class="mr-2"></lucide-icon> {{ saving() ? 'Saving...' : (isEditMode() ? 'Update Employee' : 'Create Employee') }}
              </app-button>
            }
          </div>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);

  activeTab = signal('personal');
  employeeId = signal<string | null>(null);
  isEditMode = computed(() => !!this.employeeId());

  // Resources for loading data
  departmentsResource = this.employeeService.getDepartmentsResource();
  managersResource = this.employeeService.getManagersResource(this.employeeId() || undefined);
  employeeResource = this.employeeService.getEmployeeResource(this.employeeId());

  // Form State using linkedSignal to auto-populate when employeeResource changes
  formData = linkedSignal<any>(() => {
    const emp = this.employeeResource.value()?.data;
    if (emp) {
      return {
        firstName: emp.firstName,
        lastName: emp.lastName,
        displayName: emp.displayName || '',
        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
        gender: emp.gender || '',
        maritalStatus: emp.maritalStatus || '',
        nationality: emp.nationality || '',
        jobTitle: emp.jobTitle,
        departmentId: emp.department?.id || '',
        managerId: emp.manager?.id || '',
        hireDate: emp.hireDate ? emp.hireDate.split('T')[0] : '',
        employmentType: emp.employmentType,
        status: emp.status,
        baseSalary: emp.baseSalary,
        currency: emp.currency || 'USD',
        probationEndDate: emp.probationEndDate ? emp.probationEndDate.split('T')[0] : '',
        employeeCode: emp.employeeCode,
        workEmail: emp.workEmail || '',
        workPhone: emp.workPhone || '',
        personalEmail: emp.personalEmail || '',
        phoneNumber: emp.phoneNumber || '',
        addressLine1: emp.addressLine1 || '',
        addressLine2: emp.addressLine2 || '',
        city: emp.city || '',
        state: emp.state || '',
        postalCode: emp.postalCode || '',
        country: emp.country || '',
        emergencyName: emp.emergencyName || '',
        emergencyPhone: emp.emergencyPhone || '',
        emergencyRelation: emp.emergencyRelation || ''
      };
    }
    return {
      firstName: '',
      lastName: '',
      displayName: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      nationality: '',
      jobTitle: '',
      departmentId: '',
      managerId: '',
      hireDate: '',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      baseSalary: null,
      currency: 'USD',
      probationEndDate: '',
      employeeCode: '',
      workEmail: '',
      workPhone: '',
      personalEmail: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelation: ''
    };
  });

  errors = computed(() => {
    const data = this.formData();
    const errs: Record<string, string> = {};
    if (!data.firstName) errs.firstName = 'First name is required';
    if (!data.lastName) errs.lastName = 'Last name is required';
    if (!data.jobTitle) errs.jobTitle = 'Job title is required';
    if (!data.departmentId) errs.departmentId = 'Department is required';
    if (!data.hireDate) errs.hireDate = 'Hire date is required';
    if (!data.employmentType) errs.employmentType = 'Employment type is required';
    if (!data.workEmail) errs.workEmail = 'Work email is required';
    if (!data.phoneNumber) errs.phoneNumber = 'Phone number is required';
    return errs;
  });

  tabs = signal<Tab[]>([
    { id: 'personal', label: 'Personal Data', icon: 'user' },
    { id: 'work', label: 'Work Data', icon: 'briefcase' },
    { id: 'contact', label: 'Contact', icon: 'phone' },
    { id: 'documents', label: 'Documents', icon: 'file-check' }
  ]);

  selectedFile = signal<File | null>(null);
  filePreviewUrl = signal<string | null>(null);
  uploadType: DocumentType = 'OTHER';
  uploadedDocuments = signal<{ file: File; type: DocumentType; name: string }[]>([]);
  saving = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.employeeId.set(id);
    }
  }

  updateField(field: string, value: any) {
    this.formData.set({ ...this.formData(), [field]: value });
  }

  hasError(tabId: string): boolean {
    const tabErrors: Record<string, string[]> = {
      personal: ['firstName', 'lastName'],
      work: ['jobTitle', 'departmentId', 'hireDate', 'employmentType'],
      contact: ['workEmail', 'phoneNumber']
    };
    return tabErrors[tabId]?.some(field => this.errors()[field]) || false;
  }

  validateTab(tabId: string): boolean {
    // With Signals/computed, we don't need manual validation as much, 
    // but this check is used for navigation.
    const tabErrors: Record<string, string[]> = {
      personal: ['firstName', 'lastName'],
      work: ['jobTitle', 'departmentId', 'hireDate', 'employmentType'],
      contact: ['workEmail', 'phoneNumber']
    };
    return !(tabErrors[tabId]?.some(field => this.errors()[field]) || false);
  }

  nextTab() {
    const tabIndex = this.tabs().findIndex(t => t.id === this.activeTab());
    if (this.validateTab(this.activeTab())) {
      this.activeTab.set(this.tabs()[tabIndex + 1].id);
    }
  }

  previousTab() {
    const tabIndex = this.tabs().findIndex(t => t.id === this.activeTab());
    if (tabIndex > 0) {
      this.activeTab.set(this.tabs()[tabIndex - 1].id);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.filePreviewUrl.set(e.target?.result as string);
        };
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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  uploadDocument() {
    const file = this.selectedFile();
    if (!file) return;
    this.uploadedDocuments.set([...this.uploadedDocuments(), { 
      file: file, 
      type: this.uploadType,
      name: file.name 
    }]);
    this.clearSelectedFile();
  }

  removeDocument(doc: { file: File; type: DocumentType; name: string }) {
    this.uploadedDocuments.set(this.uploadedDocuments().filter(d => d !== doc));
  }

  onSubmit() {
    if (!this.validateTab(this.activeTab())) return;
    
    this.saving.set(true);
    
    const formatToISO = (dateStr: string) => {
      if (!dateStr) return undefined;
      try {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
      } catch (e) {
        return undefined;
      }
    };

    const currentFormData = this.formData();
    const employeeData: any = {};
    Object.keys(currentFormData).forEach(key => {
      const value = currentFormData[key];
      if (value !== '' && value !== null && value !== undefined) {
        employeeData[key] = value;
      }
    });

    employeeData.dateOfBirth = formatToISO(currentFormData.dateOfBirth);
    employeeData.hireDate = formatToISO(currentFormData.hireDate);
    employeeData.probationEndDate = formatToISO(currentFormData.probationEndDate);
    
    if (employeeData.baseSalary) {
      employeeData.baseSalary = Number(employeeData.baseSalary);
    }
    
    if (!employeeData.departmentId) delete employeeData.departmentId;
    if (!employeeData.managerId) delete employeeData.managerId;

    const operation = this.isEditMode()
      ? this.employeeService.updateEmployee(this.employeeId()!, employeeData)
      : this.employeeService.createEmployee(employeeData);

    operation.subscribe({
      next: async (res: any) => {
        const empId = this.isEditMode() ? this.employeeId()! : res.data.id;
        
        for (const doc of this.uploadedDocuments()) {
          try {
            await inject(EmployeeService).uploadDocument(empId, doc.file, doc.type).toPromise();
          } catch (e) {
            console.error('Error uploading document', e);
          }
        }
        
        this.saving.set(false);
        this.router.navigate(['/employees', empId]);
      },
      error: (err) => {
        console.error('Error saving employee', err);
        this.saving.set(false);
      }
    });
  }
}