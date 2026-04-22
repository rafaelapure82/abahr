import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DepartmentService } from '../../../core/services/department.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, Building2, Plus, Users, ChevronRight, Pencil, Trash2, MapPin } from 'lucide-angular';

@Component({
    selector: 'app-department-list',
    imports: [CommonModule, RouterLink, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, LucideAngularModule],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Departamentos</h2>
          <p class="text-muted-foreground">Gestiona la estructura organizacional y los cargos.</p>
        </div>
        <div class="flex gap-2">
          <app-button variant="outline" routerLink="/departments/org-chart">
            <lucide-icon name="building-2" size="16" class="mr-2"></lucide-icon> Organigrama
          </app-button>
          <app-button variant="primary">
            <lucide-icon name="plus" size="16" class="mr-2"></lucide-icon> Nuevo Departamento
          </app-button>
        </div>
      </div>
    
      <!-- Stats -->
      <div class="grid gap-4 md:grid-cols-3">
        <app-card>
          <app-card-content class="flex items-center gap-4 p-6">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <lucide-icon name="building-2" size="24" class="text-blue-500"></lucide-icon>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total Departamentos</p>
              <p class="text-2xl font-bold">{{ departments.length }}</p>
            </div>
          </app-card-content>
        </app-card>
        <app-card>
          <app-card-content class="flex items-center gap-4 p-6">
            <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <lucide-icon name="users" size="24" class="text-green-500"></lucide-icon>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total Empleados</p>
              <p class="text-2xl font-bold">{{ totalEmployees }}</p>
            </div>
          </app-card-content>
        </app-card>
        <app-card>
          <app-card-content class="flex items-center gap-4 p-6">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <lucide-icon name="map-pin" size="24" class="text-purple-500"></lucide-icon>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Cargos Definidos</p>
              <p class="text-2xl font-bold">{{ positions.length }}</p>
            </div>
          </app-card-content>
        </app-card>
      </div>
    
      <!-- Departments Table -->
      <app-card>
        <app-card-header>
          <app-card-title>Todos los Departamentos</app-card-title>
        </app-card-header>
        <app-card-content class="p-0">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/30">
                <th class="p-4 text-left font-medium text-muted-foreground">Departamento</th>
                <th class="p-4 text-left font-medium text-muted-foreground">Código</th>
                <th class="p-4 text-left font-medium text-muted-foreground">Responsable</th>
                <th class="p-4 text-left font-medium text-muted-foreground">Empleados</th>
                <th class="p-4 text-left font-medium text-muted-foreground">Estado</th>
                <th class="p-4 text-right font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @if (loading) {
                <tr class="border-b border-border">
                  <td colspan="6" class="p-8 text-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              }
              @if (!loading && departments.length === 0) {
                <tr class="border-b border-border">
                  <td colspan="6" class="p-8 text-center text-muted-foreground italic">No se encontraron departamentos.</td>
                </tr>
              }
              @for (dept of departments; track dept) {
                <tr class="border-b border-border hover:bg-muted/30 transition-colors">
                  <td class="p-4 align-middle">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        [style.background-color]="dept.color || '#6366f1'">
                        {{ dept.code?.substring(0, 2) }}
                      </div>
                      <div>
                        <p class="font-medium">{{ dept.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ dept.description }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 align-middle">
                    <code class="text-xs bg-muted px-2 py-1 rounded">{{ dept.code }}</code>
                  </td>
                  <td class="p-4 align-middle text-sm">
                    {{ dept.head ? dept.head.firstName + ' ' + dept.head.lastName : '—' }}
                  </td>
                  <td class="p-4 align-middle">
                    <span class="flex items-center gap-1">
                      <lucide-icon name="users" size="14" class="text-muted-foreground"></lucide-icon>
                      {{ dept._count?.employees || 0 }}
                    </span>
                  </td>
                  <td class="p-4 align-middle">
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      [ngClass]="dept.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'">
                      {{ dept.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="p-4 align-middle text-right">
                    <div class="flex justify-end gap-1">
                      <app-button variant="ghost" size="sm">
                        <lucide-icon name="pencil" size="14"></lucide-icon>
                      </app-button>
                      <app-button variant="ghost" size="sm">
                        <lucide-icon name="trash-2" size="14"></lucide-icon>
                      </app-button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-card-content>
      </app-card>
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentListComponent implements OnInit {
  private deptService = inject(DepartmentService);
  private cdr = inject(ChangeDetectorRef);

  departments: any[] = [];
  positions: any[] = [];
  loading = true;

  get totalEmployees(): number {
    return this.departments.reduce((sum: number, d: any) => sum + (d._count?.employees || 0), 0);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.cdr.markForCheck();
    this.deptService.getDepartments().subscribe({
      next: (res: any) => {
        this.departments = res.data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
    this.deptService.getPositions().subscribe({
      next: (res: any) => {
        this.positions = res.data || [];
        this.cdr.markForCheck();
      }
    });
  }
}
