import { Component, inject, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee, EmployeeQuery } from '../../../core/services/employee.service';
import { ExportsService } from '../../../core/services/exports.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';

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
    LucideAngularModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  styles: [`
    :host ::ng-deep {
      .mat-mdc-table, .mat-table {
        @apply bg-transparent w-full !important;
      }
      .mat-mdc-header-row, .mat-header-row {
        @apply bg-slate-900/80 border-b border-slate-800 !important;
      }
      .mat-mdc-header-cell, .mat-header-cell {
        @apply text-slate-400 font-medium py-4 px-4 border-b border-slate-800 !important;
      }
      .mat-mdc-row, .mat-row {
        @apply border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors !important;
      }
      .mat-mdc-cell, .mat-cell {
        @apply text-slate-300 py-4 px-4 border-b border-slate-800/50 !important;
      }
      .mat-mdc-paginator, .mat-paginator {
        @apply bg-slate-900/50 text-slate-400 border-t border-slate-800 !important;
        .mat-mdc-paginator-container, .mat-paginator-container {
          @apply min-h-[56px] !important;
        }
      }
    }
  `],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white">Empleados</h2>
          <p class="text-slate-400">Gestiona el personal de tu organización.</p>
        </div>
        <div class="flex gap-2">
          <app-button variant="outline" (click)="exportExcel()" [disabled]="exporting">
            <lucide-icon *ngIf="exporting" name="loader-2" size="18" class="mr-2 animate-spin"></lucide-icon>
            <lucide-icon *ngIf="!exporting" name="download" size="18" class="mr-2"></lucide-icon> 
            Exportar Excel
          </app-button>
          <app-button variant="primary" routerLink="/employees/new">
            <lucide-icon name="user-plus" size="18" class="mr-2"></lucide-icon> Agregar Empleado
          </app-button>
        </div>
      </div>

      <!-- Filters Card -->
      <app-card class="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <app-card-content class="p-4">
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Search -->
            <div class="relative flex-1">
              <lucide-icon name="search" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></lucide-icon>
              <input
                type="text"
                [(ngModel)]="filters.search"
                (ngModelChange)="onSearchChange()"
                placeholder="Buscar por nombre, correo o código..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <!-- Status Filter -->
            <select
              [(ngModel)]="filters.status"
              (ngModelChange)="fetchEmployees()"
              class="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm min-w-[140px]"
            >
              <option value="">Todos los Estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="PROBATION">Prueba</option>
              <option value="ON_LEAVE">De Permiso</option>
              <option value="SUSPENDED">Suspendido</option>
              <option value="TERMINATED">Retirado</option>
            </select>

            <!-- Department Filter -->
            <select
              [(ngModel)]="filters.departmentId"
              (ngModelChange)="fetchEmployees()"
              class="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm min-w-[160px]"
            >
              <option value="">Todos los Departamentos</option>
              <option *ngFor="let dept of departments" [value]="dept.id">{{ dept.name }}</option>
            </select>
          </div>
        </app-card-content>
      </app-card>      <!-- Table Card -->
      <app-card class="bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            
            <!-- Employee Column -->
            <ng-container matColumnDef="employee">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Empleado </th>
              <td mat-cell *matCellDef="let emp">
                <div class="flex items-center gap-3">
                  <img *ngIf="emp.avatarUrl" [src]="emp.avatarUrl" [alt]="emp.firstName" class="w-8 h-8 rounded-full object-cover border border-slate-700" />
                  <div *ngIf="!emp.avatarUrl" class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[10px] uppercase border border-indigo-500/30">
                    {{ emp.firstName[0] }}{{ emp.lastName[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-200 mb-0 leading-tight">{{ emp.firstName }} {{ emp.lastName }}</p>
                    <p class="text-[10px] text-slate-500 mb-0">{{ emp.workEmail || emp.email }}</p>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Position Column -->
            <ng-container matColumnDef="jobTitle">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Cargo </th>
              <td mat-cell *matCellDef="let emp">
                <p class="font-medium text-slate-300 mb-0 leading-tight">{{ emp.jobTitle }}</p>
                <p class="text-[10px] text-slate-500 mb-0">{{ emp.employeeCode }}</p>
              </td>
            </ng-container>

            <!-- Department Column -->
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef> Departamento </th>
              <td mat-cell *matCellDef="let emp" class="text-slate-400">
                {{ emp.department?.name || 'Sin asignar' }}
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Estado </th>
              <td mat-cell *matCellDef="let emp">
                <span 
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  [ngClass]="{
                    'bg-green-500/10 text-green-400 border border-green-500/20': emp.status === 'ACTIVE',
                    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20': emp.status === 'PROBATION',
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20': emp.status === 'ON_LEAVE',
                    'bg-red-500/10 text-red-400 border border-red-500/20': emp.status === 'SUSPENDED',
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20': emp.status === 'TERMINATED'
                  }"
                >
                  {{ emp.status }}
                </span>
              </td>
            </ng-container>

            <!-- Hire Date Column -->
            <ng-container matColumnDef="hireDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Ingreso </th>
              <td mat-cell *matCellDef="let emp" class="text-slate-400">
                {{ emp.hireDate | date:'mediumDate' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-end"> Acciones </th>
              <td mat-cell *matCellDef="let emp" class="text-end">
                <div class="flex items-center justify-end gap-1">
                  <app-button variant="ghost" size="icon" (click)="viewEmployee(emp.id)" title="Ver Perfil" class="text-slate-400 hover:text-indigo-400">
                    <lucide-icon name="eye" size="16"></lucide-icon>
                  </app-button>
                  <app-button variant="ghost" size="icon" (click)="editEmployee(emp.id)" title="Editar" class="text-slate-400 hover:text-indigo-400">
                    <lucide-icon name="edit" size="16"></lucide-icon>
                  </app-button>
                  <app-button variant="ghost" size="icon" (click)="confirmDelete(emp)" title="Eliminar" class="text-slate-500 hover:text-red-400">
                    <lucide-icon name="trash2" size="16"></lucide-icon>
                  </app-button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <mat-paginator [length]="total"
                       [pageSize]="pageSize"
                       [pageSizeOptions]="[5, 10, 20, 50]"
                       (page)="onPageChange($event)"
                       class="border-t border-slate-800">
        </mat-paginator>
      </app-card>
    </div>
  `
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private employeeService = inject(EmployeeService);
  private exportsService = inject(ExportsService);
  private router = inject(Router);

  protected readonly Math = Math;

  employees: Employee[] = [];
  departments: { id: string; name: string }[] = [];
  loading = true;
  exporting = false;

  currentPage = 1;
  pageSize = 20;
  total = 0;
  get totalPages() { return Math.ceil(this.total / this.pageSize); }
  sortField: SortField = 'firstName';
  sortOrder: 'asc' | 'desc' = 'asc';

  dataSource = new MatTableDataSource<Employee>([]);
  displayedColumns: string[] = ['employee', 'jobTitle', 'department', 'status', 'hireDate', 'actions'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filters: EmployeeQuery = {
    page: 1,
    limit: 20,
    sortBy: 'firstName',
    sortOrder: 'asc'
  };

  private searchTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.loadDepartments();
    
    // Use pre-fetched data from resolver
    const resolvedData = (this.route.snapshot.data as any)['employees'];
    if (resolvedData) {
      this.employees = resolvedData.data;
      this.dataSource.data = this.employees;
      this.total = resolvedData.meta.total;
      this.currentPage = resolvedData.meta.page;
      this.pageSize = resolvedData.meta.limit;
      this.loading = false;
    } else {
      this.fetchEmployees();
    }
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe({
      next: (res) => {
        this.departments = res.data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.departments = [];
        this.cdr.detectChanges();
      }
    });
  }

  fetchEmployees() {
    this.loading = true;
    this.cdr.detectChanges();

    this.employeeService.getEmployees(this.filters).subscribe({
      next: (res) => {
        this.employees = res.data;
        this.dataSource.data = this.employees;
        this.total = res.meta.total;
        this.currentPage = res.meta.page;
        this.pageSize = res.meta.limit;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
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
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.filters.sortBy = this.sortField;
    this.filters.sortOrder = this.sortOrder;
    this.fetchEmployees();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.filters.page = page;
    this.fetchEmployees();
  }

  viewEmployee(id: string) {
    this.router.navigate(['/employees', id]);
  }

  editEmployee(id: string) {
    this.router.navigate(['/employees', id, 'edit']);
  }

  confirmDelete(employee: Employee) {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${employee.firstName} ${employee.lastName}?`)) {
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => this.fetchEmployees(),
        error: (err) => console.error('Delete failed:', err)
      });
    }
  }

  exportExcel() {
    this.exporting = true;
    this.cdr.detectChanges();

    this.exportsService.exportEmployeesExcel().subscribe({
      next: (blob) => {
        this.exportsService.triggerDownload(blob, 'employees.xlsx');
        this.exporting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.exporting = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: any) {
    this.filters.page = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.fetchEmployees();
  }

  ngOnDestroy(): void {
    // No explicit cleanup needed for mat-table
  }
}