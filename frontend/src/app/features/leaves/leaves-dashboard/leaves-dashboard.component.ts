import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeavesService } from '../../../core/services/leaves.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';

const LEAVE_TYPES = ['VACATION', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'UNPAID', 'STUDY', 'OTHER'];

@Component({
    selector: 'app-leaves-dashboard',
    imports: [CommonModule, FormsModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, LucideAngularModule],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Mis Ausencias</h2>
          <p class="text-muted-foreground">Solicita tiempo libre y haz seguimiento de tu saldo de vacaciones.</p>
        </div>
        <app-button variant="primary" (click)="showForm = !showForm">
          <lucide-icon name="plus" size="16" class="mr-2"></lucide-icon>
          Solicitar Ausencia
        </app-button>
      </div>

      <!-- Leave Request Form -->
      <app-card *ngIf="showForm" class="border-primary/30">
        <app-card-header>
          <app-card-title>Nueva Solicitud de Ausencia</app-card-title>
        </app-card-header>
        <app-card-content class="p-6">
          <div class="grid md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium">Tipo de Ausencia</label>
              <select [(ngModel)]="form.leaveType"
                class="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Seleccionar tipo...</option>
                <option *ngFor="let t of leaveTypes" [value]="t">{{ translateLeaveType(t) }}</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium">Fecha de Inicio</label>
              <input type="date" [(ngModel)]="form.startDate" (change)="calcDays()"
                class="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium">Fecha de Fin</label>
              <input type="date" [(ngModel)]="form.endDate" (change)="calcDays()"
                class="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium">Días Solicitados</label>
              <input type="number" [(ngModel)]="form.daysRequested" [readonly]="true"
                class="h-10 rounded-md border border-border bg-muted px-3 py-2 text-sm">
            </div>
            <div class="flex flex-col gap-1 md:col-span-2">
              <label class="text-sm font-medium">Motivo <span class="text-muted-foreground">(opcional)</span></label>
              <textarea [(ngModel)]="form.reason" rows="3" placeholder="Añade un motivo..."
                class="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none">
              </textarea>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <app-button variant="primary" (click)="submitRequest()" [disabled]="submitting">
              <lucide-icon *ngIf="submitting" name="loader-2" size="16" class="mr-2 animate-spin"></lucide-icon>
              Enviar Solicitud
            </app-button>
            <app-button variant="outline" (click)="showForm = false">Cancelar</app-button>
          </div>
          <div *ngIf="successMsg" class="mt-3 p-3 rounded-md bg-green-500/10 text-green-600 text-sm border border-green-500/30">
            ✅ {{ successMsg }}
          </div>
        </app-card-content>
      </app-card>

      <!-- My Leave History -->
      <app-card>
        <app-card-header>
          <app-card-title>Mis Solicitudes de Ausencia</app-card-title>
        </app-card-header>
        <app-card-content class="p-0">
          <div *ngIf="loading" class="p-8 text-center">
            <div class="animate-spin h-6 w-6 rounded-full border-b-2 border-primary mx-auto"></div>
          </div>
          <div *ngIf="!loading && leaves.length === 0" class="p-8 text-center text-muted-foreground italic">
            Aún no tienes solicitudes de ausencia.
          </div>
          <div *ngFor="let leave of leaves" class="p-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" [ngClass]="leaveTypeColor(leave.leaveType).bg">
                  <lucide-icon name="calendar" size="18" [ngClass]="leaveTypeColor(leave.leaveType).text"></lucide-icon>
                </div>
                <div>
                  <p class="font-semibold text-sm">{{ translateLeaveType(leave.leaveType) }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ leave.startDate | date:'MMM d' }} – {{ leave.endDate | date:'MMM d, y' }}
                    • {{ leave.daysRequested }} {{ leave.daysRequested !== 1 ? 'días' : 'día' }}
                  </p>
                </div>
              </div>
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    [ngClass]="statusClass(leave.status)">
                {{ leave.status }}
              </span>
            </div>
            <p *ngIf="leave.reason" class="text-xs text-muted-foreground mt-2 ml-13 pl-13">{{ leave.reason }}</p>
          </div>
        </app-card-content>
      </app-card>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeavesDashboardComponent implements OnInit {
  private leavesService = inject(LeavesService);
  private cdr = inject(ChangeDetectorRef);

  leaves: any[] = [];
  loading = true;
  showForm = false;
  submitting = false;
  successMsg = '';
  leaveTypes = LEAVE_TYPES;

  form = {
    leaveType: '',
    startDate: '',
    endDate: '',
    daysRequested: 0,
    reason: ''
  };

  ngOnInit() { this.loadMyLeaves(); }

  loadMyLeaves() {
    this.loading = true;
    this.leavesService.getMyLeaves().subscribe({
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

  calcDays() {
    if (this.form.startDate && this.form.endDate) {
      const diff = new Date(this.form.endDate).getTime() - new Date(this.form.startDate).getTime();
      this.form.daysRequested = Math.max(1, Math.round(diff / 86400000) + 1);
    }
  }

  submitRequest() {
    if (!this.form.leaveType || !this.form.startDate || !this.form.endDate) return;
    this.submitting = true;
    this.leavesService.requestLeave(this.form).subscribe({
      next: () => {
        this.submitting = false;
        this.successMsg = '¡Solicitud de ausencia enviada con éxito!';
        this.loadMyLeaves();
        setTimeout(() => {
          this.showForm = false;
          this.successMsg = '';
          this.cdr.markForCheck();
        }, 2000);
        this.form = { leaveType: '', startDate: '', endDate: '', daysRequested: 0, reason: '' };
        this.cdr.markForCheck();
      },
      error: () => {
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  leaveTypeColor(type: string): { bg: string; text: string } {
    const map: Record<string, { bg: string; text: string }> = {
      VACATION: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      SICK: { bg: 'bg-red-500/10', text: 'text-red-500' },
      PERSONAL: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
      MATERNITY: { bg: 'bg-pink-500/10', text: 'text-pink-500' },
      PATERNITY: { bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
      BEREAVEMENT: { bg: 'bg-gray-500/10', text: 'text-gray-500' },
      UNPAID: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
    };
    return map[type] || { bg: 'bg-muted', text: 'text-muted-foreground' };
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      REJECTED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-600',
      HR_REVIEW: 'bg-blue-100 text-blue-700',
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
