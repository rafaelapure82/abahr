import { Component, inject, signal, computed, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { EmployeeService, Employee, EmployeeQuery, PaginatedResponse } from '../../../core/services/employee.service';
import { ExportsService } from '../../../core/services/exports.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@Component({
    selector: 'app-employee-list',
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        CardComponent,
        CardContentComponent,
        ButtonComponent,
        LucideAngularModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule
    ],
    styles: [`
    :host ::ng-deep {
      .mat-mdc-table, .mat-table { @apply bg-transparent w-full !important; }
      .mat-mdc-header-row, .mat-header-row { @apply bg-slate-900/80 border-b border-slate-800 !important; }
      .mat-mdc-header-cell, .mat-header-cell { @apply text-slate-400 font-medium py-4 px-4 border-b border-slate-800 !important; }
      .mat-mdc-row, .mat-row { @apply border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors !important; }
      .mat-mdc-cell, .mat-cell { @apply text-slate-300 py-4 px-4 border-b border-slate-800/50 !important; }
      .mat-mdc-paginator, .mat-paginator { @apply bg-slate-900/50 text-slate-400 border-t border-slate-800 !important; }
    }
  `],
    template: `
    <div class="space-y-6 animate-in fade-in duration-500">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white">Empleados</h2>
          <p class="text-slate-400">Gestiona el personal de tu organización.</p>
        </div>
        <div class="flex gap-2">
          <app-button variant="outline" (click)="exportExcel()" [disabled]="exporting()">
            <lucide-icon [name]="exporting() ? 'loader-2' : 'download'" size="18" [class.animate-spin]="exporting()" class="mr-2"></lucide-icon>
            Exportar Excel
          </app-button>
          <app-button variant="primary" routerLink="/employees/new">
            <lucide-icon name="user-plus" size="18" class="mr-2"></lucide-icon> Agregar Empleado
          </app-button>
        </div>
      </div>
    
      <!-- Filters -->
      <app-card class="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <app-card-content class="p-4">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="relative flex-1">
              <lucide-icon name="search" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></lucide-icon>
              <input type="text" [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)"
                placeholder="Buscar por nombre, correo o código..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:ring-2 focus:ring-primary/50" />
            </div>

            <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)"
              class="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm">
              <option value="">Todos los Estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="PROBATION">Prueba</option>
              <option value="ON_LEAVE">De Permiso</option>
              <option value="SUSPENDED">Suspendido</option>
              <option value="TERMINATED">Retirado</option>
            </select>

            <select [ngModel]="deptFilter()" (ngModelChange)="deptFilter.set($event)"
              class="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm">
              <option value="">Todos los Departamentos</option>
              @for (dept of deptsResource.value()?.data; track dept.id) {
                <option [value]="dept.id">{{ dept.name }}</option>
              }
            </select>
          </div>
        </app-card-content>
      </app-card>

      <!-- Table -->
      <app-card class="bg-slate-900/50 border-slate-800 backdrop-blur-xl overflow-hidden relative">
        @if (loading()) {
          <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <div class="flex flex-col items-center gap-2">
              <lucide-icon name="loader-2" size="32" class="animate-spin text-primary"></lucide-icon>
              <span class="text-xs font-medium text-slate-400">Cargando empleados...</span>
            </div>
          </div>
        } @else if (employeesResource.error()) {
          <div class="p-12 text-center flex flex-col items-center gap-4">
            <lucide-icon name="alert-circle" size="48" class="text-destructive opacity-50"></lucide-icon>
            <div class="space-y-1">
              <p class="text-slate-200 font-bold">Error al cargar datos</p>
              <p class="text-xs text-slate-500">Es posible que el servidor haya limitado las peticiones o haya un problema de conexión.</p>
            </div>
            <app-button variant="outline" size="sm" (click)="employeesResource.reload()">
              Reintentar
            </app-button>
          </div>
        }

        <div class="overflow-x-auto">
          <table mat-table [dataSource]="employees()" class="w-full">
            <ng-container matColumnDef="employee">
              <th mat-header-cell *matHeaderCellDef> Empleado </th>
              <td mat-cell *matCellDef="let emp">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {{ emp.firstName[0] }}{{ emp.lastName[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-200 leading-none">{{ emp.firstName }} {{ emp.lastName }}</p>
                    <p class="text-[10px] text-slate-500 mt-1">{{ emp.workEmail || emp.email }}</p>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="jobTitle">
              <th mat-header-cell *matHeaderCellDef> Cargo </th>
              <td mat-cell *matCellDef="let emp">
                <p class="text-sm text-slate-300 font-medium">{{ emp.jobTitle }}</p>
                <p class="text-[10px] text-slate-500">{{ emp.employeeCode }}</p>
              </td>
            </ng-container>

            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef> Departamento </th>
              <td mat-cell *matCellDef="let emp" class="text-slate-400 text-sm">
                {{ emp.department?.name || '—' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Estado </th>
              <td mat-cell *matCellDef="let emp">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  [ngClass]="statusClasses(emp.status)">
                  {{ emp.status }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="hireDate">
              <th mat-header-cell *matHeaderCellDef> Ingreso </th>
              <td mat-cell *matCellDef="let emp" class="text-slate-400 text-sm">
                {{ emp.hireDate | date:'mediumDate' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right"> Acciones </th>
              <td mat-cell *matCellDef="let emp" class="text-right">
                <div class="flex justify-end gap-1">
                  <app-button variant="ghost" size="icon" (click)="viewEmployee(emp.id)" class="h-8 w-8 text-slate-400 hover:text-primary">
                    <lucide-icon name="eye" size="14"></lucide-icon>
                  </app-button>
                  <app-button variant="ghost" size="icon" (click)="editEmployee(emp.id)" class="h-8 w-8 text-slate-400 hover:text-primary">
                    <lucide-icon name="edit-2" size="14"></lucide-icon>
                  </app-button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <mat-paginator [length]="total()" [pageSize]="pageSize()" [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)" class="bg-transparent">
        </mat-paginator>
      </app-card>
    </div>
    `
})
export class EmployeeListComponent {
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private exportsService = inject(ExportsService);

  // State Signals
  searchTerm = signal('');
  
  // Debounced search term for efficiency
  private debouncedSearchTerm = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(400),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  statusFilter = signal('');
  deptFilter = signal('');
  page = signal(1);
  pageSize = signal(20);
  exporting = signal(false);

  // Queries computed
  query = computed<EmployeeQuery>(() => ({
    page: this.page(),
    limit: this.pageSize(),
    search: this.debouncedSearchTerm(),
    status: this.statusFilter() as any,
    departmentId: this.deptFilter(),
    sortBy: 'firstName',
    sortOrder: 'asc'
  }));

  // Resources
  employeesResource = resource<PaginatedResponse<Employee>, unknown>({
    loader: () => {
      const q = this.query();
      return firstValueFrom(this.employeeService.getEmployees(q));
    }
  });

  deptsResource = this.employeeService.getDepartmentsResource();

  // Data Selectors
  employees = computed(() => {
    const res = this.employeesResource.value() as PaginatedResponse<Employee> | undefined;
    return res?.data || [];
  });

  total = computed(() => {
    const res = this.employeesResource.value() as PaginatedResponse<Employee> | undefined;
    return res?.meta?.total || 0;
  });

  loading = computed(() => this.employeesResource.isLoading());

  displayedColumns = ['employee', 'jobTitle', 'department', 'status', 'hireDate', 'actions'];

  statusClasses(status: string) {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PROBATION': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'ON_LEAVE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'SUSPENDED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  }

  onPageChange(event: any) {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
  }

  viewEmployee(id: string) { this.router.navigate(['/employees', id]); }
  editEmployee(id: string) { this.router.navigate(['/employees', id, 'edit']); }

  exportExcel() {
    this.exporting.set(true);
    this.exportsService.exportEmployeesExcel().subscribe({
      next: (blob) => {
        this.exportsService.triggerDownload(blob, 'employees.xlsx');
        this.exporting.set(false);
      },
      error: () => this.exporting.set(false)
    });
  }
}