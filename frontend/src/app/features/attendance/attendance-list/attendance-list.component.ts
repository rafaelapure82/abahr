import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Registros de Asistencia</h2>
        <p class="text-muted-foreground">Vista administrativa de la asistencia de todos los empleados.</p>
      </div>

      <!-- Filters -->
      <app-card>
        <app-card-content class="p-4">
          <div class="flex flex-wrap gap-3 items-end">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground">Fecha</label>
              <input type="date" [(ngModel)]="filterDate" (change)="load()"
                class="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-muted-foreground">Estado</label>
              <select [(ngModel)]="filterStatus" (change)="load()"
                class="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Todos</option>
                <option value="PRESENT">Presente</option>
                <option value="ABSENT">Ausente</option>
                <option value="LATE">Tarde</option>
                <option value="HALF_DAY">Medio Día</option>
                <option value="REMOTE">Remoto</option>
              </select>
            </div>
            <button (click)="clearFilters()" class="h-9 px-3 rounded-md border border-border text-sm hover:bg-muted transition-colors">
              Limpiar
            </button>
          </div>
        </app-card-content>
      </app-card>

      <!-- Table -->
      <app-card>
        <app-card-header>
          <app-card-title>Registros ({{ total }})</app-card-title>
        </app-card-header>
        <app-card-content class="p-0">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/30">
                <th class="p-4 text-left font-medium text-muted-foreground">Empleado</th>
                <th class="p-4 text-left font-medium text-muted-foreground">Fecha</th>
                <th class="p-4 text-left font-medium text-muted-foreground">Entrada</th>
                <th class="p-4 text-left font-medium text-muted-foreground">Salida</th>
                <th class="p-4 text-left font-medium text-muted-foreground">Horas</th>
                <th class="p-4 text-left font-medium text-muted-foreground">Estado</th>
                <th class="p-4 text-left font-medium text-muted-foreground">Remoto</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading" class="border-b">
                <td colspan="7" class="p-8 text-center">
                  <div class="animate-spin h-6 w-6 rounded-full border-b-2 border-primary mx-auto"></div>
                </td>
              </tr>
              <tr *ngIf="!loading && records.length === 0">
                <td colspan="7" class="p-8 text-center text-muted-foreground italic">No se encontraron registros.</td>
              </tr>
              <tr *ngFor="let r of records" class="border-b border-border hover:bg-muted/20 transition-colors">
                <td class="p-4 align-middle">
                  <div>
                    <p class="font-medium">{{ r.employee?.displayName || r.employee?.firstName + ' ' + r.employee?.lastName }}</p>
                    <p class="text-xs text-muted-foreground">{{ r.employee?.department?.name }}</p>
                  </div>
                </td>
                <td class="p-4 align-middle text-sm">{{ r.date | date:'MMM d, y' }}</td>
                <td class="p-4 align-middle font-mono text-sm">{{ r.checkIn ? (r.checkIn | date:'hh:mm a') : '—' }}</td>
                <td class="p-4 align-middle font-mono text-sm">{{ r.checkOut ? (r.checkOut | date:'hh:mm a') : '—' }}</td>
                <td class="p-4 align-middle font-medium">{{ r.hoursWorked ? r.hoursWorked + 'h' : '—' }}</td>
                <td class="p-4 align-middle">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        [ngClass]="statusClass(r.status)">
                    {{ r.status }}
                  </span>
                </td>
                <td class="p-4 align-middle">
                  <lucide-icon *ngIf="r.isRemote" name="wifi" size="16" class="text-blue-500"></lucide-icon>
                  <lucide-icon *ngIf="!r.isRemote" name="building-2" size="16" class="text-muted-foreground"></lucide-icon>
                </td>
              </tr>
            </tbody>
          </table>
        </app-card-content>
      </app-card>
    </div>
  `
})
export class AttendanceListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private attendanceService = inject(AttendanceService);
  private cdr = inject(ChangeDetectorRef);

  records: any[] = [];
  loading = true;
  total = 0;
  filterDate = '';
  filterStatus = '';

  ngOnInit() { 
    // Use pre-fetched data from resolver
    const resolvedData = (this.route.snapshot.data as any)['records'];
    if (resolvedData) {
      this.records = resolvedData.data || [];
      this.total = resolvedData.meta?.total || resolvedData.data?.length || 0;
      this.loading = false;
      this.cdr.detectChanges();
    } else {
      this.load(); 
    }
  }

  load() {
    this.loading = true;
    this.cdr.detectChanges();
    const q: any = {};
    if (this.filterDate) q.date = this.filterDate;
    if (this.filterStatus) q.status = this.filterStatus;
    this.attendanceService.getAll(q).subscribe({
      next: (res: any) => {
        this.records = res.data || [];
        this.total = res.meta?.total || res.data?.length || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearFilters() { this.filterDate = ''; this.filterStatus = ''; this.load(); }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PRESENT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      ABSENT: 'bg-red-100 text-red-700',
      LATE: 'bg-amber-100 text-amber-700',
      HALF_DAY: 'bg-blue-100 text-blue-700',
      REMOTE: 'bg-purple-100 text-purple-700',
    };
    return map[status] || 'bg-muted text-muted-foreground';
  }
}
