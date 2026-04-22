import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeavesService } from '../../../core/services/leaves.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-leaves-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Gestión de Ausencias</h2>
        <p class="text-muted-foreground">Revisa y aprueba las solicitudes de ausencia de los empleados.</p>
      </div>

      <!-- Pending Count -->
      <div class="grid md:grid-cols-3 gap-4">
        <app-card>
          <app-card-content class="flex items-center gap-4 p-6">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <lucide-icon name="clock" size="20" class="text-amber-500"></lucide-icon>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Pendientes de Aprobación</p>
              <p class="text-2xl font-bold">{{ pendingCount }}</p>
            </div>
          </app-card-content>
        </app-card>
        <app-card>
          <app-card-content class="flex items-center gap-4 p-6">
            <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <lucide-icon name="check-circle" size="20" class="text-green-500"></lucide-icon>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Aprobadas este Mes</p>
              <p class="text-2xl font-bold">{{ approvedCount }}</p>
            </div>
          </app-card-content>
        </app-card>
        <app-card>
          <app-card-content class="flex items-center gap-4 p-6">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <lucide-icon name="calendar" size="20" class="text-blue-500"></lucide-icon>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Total de Solicitudes</p>
              <p class="text-2xl font-bold">{{ leaves.length }}</p>
            </div>
          </app-card-content>
        </app-card>
      </div>

      <!-- Filters -->
      <app-card>
        <app-card-content class="p-4">
          <div class="flex flex-wrap gap-3">
            <select [(ngModel)]="filterStatus" (change)="load()"
              class="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Todos los Estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
              <option value="HR_REVIEW">Revisión de RR.HH.</option>
            </select>
            <select [(ngModel)]="filterType" (change)="load()"
              class="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Todos los Tipos</option>
              <option value="VACATION">Vacaciones</option>
              <option value="SICK">Enfermedad</option>
              <option value="PERSONAL">Personal</option>
              <option value="MATERNITY">Maternidad</option>
              <option value="PATERNITY">Paternidad</option>
            </select>
          </div>
        </app-card-content>
      </app-card>

      <!-- Requests Table -->
      <app-card>
        <app-card-content class="p-0">
          <div *ngIf="loading" class="p-8 text-center">
            <div class="animate-spin h-6 w-6 rounded-full border-b-2 border-primary mx-auto"></div>
          </div>
          <div *ngIf="!loading && leaves.length === 0" class="p-8 text-center text-muted-foreground italic">
            No se encontraron solicitudes.
          </div>

          <div *ngFor="let leave of leaves" class="p-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {{ leave.employee?.firstName?.[0] }}{{ leave.employee?.lastName?.[0] }}
                </div>
                <div>
                  <p class="font-semibold text-sm">{{ leave.employee?.firstName }} {{ leave.employee?.lastName }}</p>
                  <p class="text-xs text-muted-foreground">{{ translateLeaveType(leave.leaveType) }} — {{ leave.daysRequested }} día(s)</p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ leave.startDate | date:'MMM d' }} → {{ leave.endDate | date:'MMM d, y' }}
                  </p>
                  <p *ngIf="leave.reason" class="text-xs text-muted-foreground italic mt-1">"{{ leave.reason }}"</p>
                </div>
              </div>

              <div class="flex flex-col items-end gap-2">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      [ngClass]="statusClass(leave.status)">
                  {{ leave.status }}
                </span>

                <div *ngIf="leave.status === 'PENDING'" class="flex gap-1.5">
                  <app-button variant="primary" size="sm" (click)="review(leave.id, 'approve')">
                    <lucide-icon name="check" size="14" class="mr-1"></lucide-icon> Aprobar
                  </app-button>
                  <app-button variant="destructive" size="sm" (click)="review(leave.id, 'reject')">
                    <lucide-icon name="x" size="14" class="mr-1"></lucide-icon> Rechazar
                  </app-button>
                </div>
              </div>
            </div>
          </div>
        </app-card-content>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeavesAdminComponent implements OnInit {
  private leavesService = inject(LeavesService);
  private cdr = inject(ChangeDetectorRef);

  leaves: any[] = [];
  loading = true;
  filterStatus = '';
  filterType = '';

  get pendingCount() { return this.leaves.filter((l: any) => l.status === 'PENDING').length; }
  get approvedCount() { return this.leaves.filter((l: any) => l.status === 'APPROVED').length; }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const q: any = {};
    if (this.filterStatus) q.status = this.filterStatus;
    if (this.filterType) q.leaveType = this.filterType;
    this.leavesService.getAllLeaves(q).subscribe({
      next: (res: any) => {
        this.leaves = res.data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  review(id: string, action: 'approve' | 'reject') {
    this.leavesService.reviewLeave(id, { action }).subscribe({
      next: () => this.load()
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      HR_REVIEW: 'bg-blue-100 text-blue-700',
      CANCELLED: 'bg-gray-100 text-gray-600',
    };
    return map[status] || 'bg-muted text-muted-foreground';
  }

  translateLeaveType(type: string): string {
    const map: Record<string, string> = {
      VACATION: 'Vacaciones', SICK: 'Enfermedad', PERSONAL: 'Personal',
      MATERNITY: 'Maternidad', PATERNITY: 'Paternidad', BEREAVEMENT: 'Duelo',
      UNPAID: 'Sin Goce de Sueldo', STUDY: 'Estudio', OTHER: 'Otro'
    };
    return map[type] || type;
  }
}
