import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee, EmployeeQuery, EmploymentStatus, EmploymentType } from '../../../core/services/employee.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, UserPlus, Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Eye, Trash2 } from 'lucide-angular';

type SortField = 'firstName' | 'lastName' | 'hireDate' | 'jobTitle' | 'createdAt';

@Component({
  selector: 'app-employee-list',
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
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Employees</h2>
          <p class="text-muted-foreground">Manage your organization's workforce.</p>
        </div>
        <div class="flex gap-2">
          <app-button variant="primary" routerLink="/employees/new">
            <lucide-icon name="user-plus" size="18" class="mr-2"></lucide-icon> Add Employee
          </app-button>
        </div>
      </div>

      <!-- Filters Card -->
      <app-card>
        <app-card-content class="p-4">
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Search -->
            <div class="relative flex-1">
              <lucide-icon name="search" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
              <input
                type="text"
                [(ngModel)]="filters.search"
                (ngModelChange)="onSearchChange()"
                placeholder="Search by name, email, or employee code..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <!-- Status Filter -->
            <select
              [(ngModel)]="filters.status"
              (ngModelChange)="fetchEmployees()"
              class="px-3 py-2 rounded-lg border border-input bg-background text-sm min-w-[140px]"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PROBATION">Probation</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TERMINATED">Terminated</option>
            </select>

            <!-- Type Filter -->
            <select
              [(ngModel)]="filters.type"
              (ngModelChange)="fetchEmployees()"
              class="px-3 py-2 rounded-lg border border-input bg-background text-sm min-w-[140px]"
            >
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
              <option value="FREELANCE">Freelance</option>
            </select>

            <!-- Department Filter -->
            <select
              [(ngModel)]="filters.departmentId"
              (ngModelChange)="fetchEmployees()"
              class="px-3 py-2 rounded-lg border border-input bg-background text-sm min-w-[160px]"
            >
              <option value="">All Departments</option>
              @for (dept of departments(); track dept.id) {
                <option [value]="dept.id">{{ dept.name }}</option>
              }
            </select>
          </div>
        </app-card-content>
      </app-card>

      <!-- Table Card -->
      <app-card>
        <app-card-content class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/50">
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/80" (click)="toggleSort('firstName')">
                    <div class="flex items-center gap-1">
                      Employee
                      @if (sortField() === 'firstName') {
                        <lucide-icon [name]="sortOrder() === 'asc' ? 'chevron-up' : 'chevron-down'" size="14"></lucide-icon>
                      }
                    </div>
                  </th>
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/80" (click)="toggleSort('jobTitle')">
                    <div class="flex items-center gap-1">
                      Position
                      @if (sortField() === 'jobTitle') {
                        <lucide-icon [name]="sortOrder() === 'asc' ? 'chevron-up' : 'chevron-down'" size="14"></lucide-icon>
                      }
                    </div>
                  </th>
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/80" (click)="toggleSort('hireDate')">
                    <div class="flex items-center gap-1">
                      Hire Date
                      @if (sortField() === 'hireDate') {
                        <lucide-icon [name]="sortOrder() === 'asc' ? 'chevron-up' : 'chevron-down'" size="14"></lucide-icon>
                      }
                    </div>
                  </th>
                  <th class="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (loading()) {
                  <tr class="border-b border-border">
                    <td colspan="6" class="p-8 text-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </td>
                  </tr>
                } @else if (employees().length === 0) {
                  <tr class="border-b border-border">
                    <td colspan="6" class="p-8 text-center text-muted-foreground">No employees found matching your filters.</td>
                  </tr>
                } @else {
                  @for (emp of employees(); track emp.id) {
                    <tr class="border-b border-border hover:bg-muted/30 transition-colors">
                      <td class="p-4 align-middle">
                        <div class="flex items-center gap-3">
                          @if (emp.avatarUrl) {
                            <img [src]="emp.avatarUrl" [alt]="emp.firstName" class="w-10 h-10 rounded-full object-cover" />
                          } @else {
                            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                              {{ emp.firstName[0] }}{{ emp.lastName[0] }}
                            </div>
                          }
                          <div>
                            <p class="font-medium">{{ emp.firstName }} {{ emp.lastName }}</p>
                            <p class="text-xs text-muted-foreground">{{ emp.email || emp.workEmail }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="p-4 align-middle">
                        <p class="font-medium">{{ emp.jobTitle }}</p>
                        <p class="text-xs text-muted-foreground">{{ emp.employeeCode }}</p>
                      </td>
                      <td class="p-4 align-middle">{{ emp.department?.name || 'Unassigned' }}</td>
                      <td class="p-4 align-middle">
                        <span 
                          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          [ngClass]="{
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': emp.status === 'ACTIVE',
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': emp.status === 'PROBATION',
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': emp.status === 'ON_LEAVE',
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': emp.status === 'SUSPENDED',
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400': emp.status === 'TERMINATED'
                          }"
                        >
                          {{ emp.status }}
                        </span>
                      </td>
                      <td class="p-4 align-middle">{{ emp.hireDate | date:'mediumDate' }}</td>
                      <td class="p-4 align-middle text-right">
                        <div class="flex items-center justify-end gap-1">
                          <app-button variant="ghost" size="icon" (click)="viewEmployee(emp.id)" title="View Profile">
                            <lucide-icon name="eye" size="16"></lucide-icon>
                          </app-button>
                          <app-button variant="ghost" size="icon" (click)="editEmployee(emp.id)" title="Edit">
                            <lucide-icon name="edit" size="16"></lucide-icon>
                          </app-button>
                          <app-button variant="ghost" size="icon" (click)="confirmDelete(emp)" title="Delete" class="text-destructive hover:text-destructive">
                            <lucide-icon name="trash2" size="16"></lucide-icon>
                          </app-button>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-4 py-3 border-t border-border">
              <p class="text-sm text-muted-foreground">
                Showing {{ (currentPage() - 1) * pageSize() + 1 }} to {{ Math.min(currentPage() * pageSize(), total()) }} of {{ total() }} employees
              </p>
              <div class="flex items-center gap-2">
                <app-button variant="outline" size="sm" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">
                  <lucide-icon name="chevron-left" size="16"></lucide-icon>
                </app-button>
                <span class="px-3 py-1 text-sm font-medium">
                  Page {{ currentPage() }} of {{ totalPages() }}
                </span>
                <app-button variant="outline" size="sm" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">
                  <lucide-icon name="chevron-right" size="16"></lucide-icon>
                </app-button>
              </div>
            </div>
          }
        </app-card-content>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent implements OnInit {
  private router = inject(Router);
  private employeeService = inject(EmployeeService);

  protected readonly LucideAngularModule = LucideAngularModule;
  protected readonly Math = Math;

  employees = signal<Employee[]>([]);
  departments = signal<{ id: string; name: string }[]>([]);
  loading = signal(true);

  currentPage = signal(1);
  pageSize = signal(20);
  total = signal(0);
  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));
  sortField = signal<SortField>('firstName');
  sortOrder = signal<'asc' | 'desc'>('asc');

  filters: EmployeeQuery = {
    page: 1,
    limit: 20,
    sortBy: 'firstName',
    sortOrder: 'asc'
  };

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadDepartments();
    this.fetchEmployees();
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe({
      next: (res) => this.departments.set(res.data),
      error: () => this.departments.set([])
    });
  }

  fetchEmployees() {
    this.loading.set(true);
    this.employeeService.getEmployees(this.filters).subscribe({
      next: (res) => {
        this.employees.set(res.data);
        this.total.set(res.total);
        this.currentPage.set(res.page);
        this.pageSize.set(res.limit);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.filters.page = 1;
      this.fetchEmployees();
    }, 300);
  }

  toggleSort(field: SortField) {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }
    this.filters.sortBy = this.sortField();
    this.filters.sortOrder = this.sortOrder();
    this.fetchEmployees();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.filters.page = page;
    this.fetchEmployees();
  }

  viewEmployee(id: string) {
    this.router.navigate(['/employees', id]);
  }

  editEmployee(id: string) {
    this.router.navigate(['/employees', id, 'edit']);
  }

  openCreateModal() {
    this.router.navigate(['/employees', 'new']);
  }

  confirmDelete(employee: Employee) {
    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => this.fetchEmployees(),
        error: (err) => console.error('Delete failed:', err)
      });
    }
  }
}