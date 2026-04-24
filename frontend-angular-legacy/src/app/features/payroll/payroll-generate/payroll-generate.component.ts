import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PayrollService } from '../../../core/services/payroll.service';
import { DepartmentService } from '../../../core/services/department.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-payroll-generate',
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in relative">
      <!-- Decorative Background elements -->
      <div class="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
    
      <div class="w-full max-w-2xl relative z-10">
        <!-- Header -->
        <div class="text-center mb-10 space-y-4">
          <div class="w-20 h-20 bg-indigo-600/20 rounded-[32px] flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
            <lucide-icon name="zap" size="32" class="text-indigo-400"></lucide-icon>
          </div>
          <h2 class="text-4xl font-black tracking-tight text-white">Iniciar Periodo de Nómina</h2>
          <p class="text-slate-400 text-lg">Configure los parámetros para la ejecución automatizada.</p>
        </div>
    
        <!-- Form Glass Card -->
        <div class="glass-card p-10 rounded-[40px] border border-white/10 shadow-2xl space-y-8">
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Period Start -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <lucide-icon name="calendar" size="12"></lucide-icon> Inicio del Periodo
              </label>
              <input type="date" [(ngModel)]="form.periodStart"
                class="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white/10 transition-all font-medium">
              </div>
    
              <!-- Period End -->
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <lucide-icon name="calendar-check" size="12"></lucide-icon> Fin del Periodo
                </label>
                <input type="date" [(ngModel)]="form.periodEnd"
                  class="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white/10 transition-all font-medium">
                </div>
    
                <!-- Pay Date -->
                <div class="space-y-2">
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <lucide-icon name="dollar-sign" size="12"></lucide-icon> Fecha Programada de Pago
                  </label>
                  <input type="date" [(ngModel)]="form.payDate"
                    class="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white/10 transition-all font-medium">
                  </div>
    
                  <!-- Frequency -->
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <lucide-icon name="refresh-cw" size="12"></lucide-icon> Frecuencia de Ejecución
                    </label>
                    <select [(ngModel)]="form.frequency"
                      class="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white/10 transition-all font-medium appearance-none">
                      <option value="MONTHLY">Mensual</option>
                      <option value="BIWEEKLY">Quincenal</option>
                      <option value="WEEKLY">Semanal</option>
                      <option value="SEMI_MONTHLY">Semimensual</option>
                    </select>
                  </div>
    
                  <!-- Department Selector -->
                  <div class="space-y-2 md:col-span-2">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <lucide-icon name="users" size="12"></lucide-icon> Segmentación (Departamento)
                    </label>
                    <select [(ngModel)]="form.departmentId"
                      class="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white/10 transition-all font-medium appearance-none">
                      <option value="">Ejecución Global (Toda la empresa)</option>
                      @for (dept of departments$ | async; track dept) {
                        <option [value]="dept.id">
                          {{ dept.name }}
                        </option>
                      }
                    </select>
                  </div>
                </div>
    
                <!-- Error Feedback -->
                @if (errorMsg) {
                  <div class="p-6 rounded-[24px] bg-red-600/10 border border-red-600/30 flex items-center gap-4 text-red-400 animate-shake">
                    <lucide-icon name="alert-circle" size="24"></lucide-icon>
                    <p class="font-bold">{{ errorMsg }}</p>
                  </div>
                }
    
                <!-- Actions -->
                <div class="flex flex-col md:flex-row gap-4 pt-4">
                  <button (click)="submit()" [disabled]="submitting"
                    class="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95">
                    @if (submitting) {
                      <lucide-icon name="loader-2" size="24" class="animate-spin"></lucide-icon>
                    }
                    @if (!submitting) {
                      <lucide-icon name="rocket" size="24"></lucide-icon>
                    }
                    {{ submitting ? 'INICIANDO PROCESO...' : 'LANZAR EJECUCIÓN' }}
                  </button>
                  <button routerLink="/payroll" class="h-16 px-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
    
          <style>
            .glass-card {
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .animate-fade-in { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
    </style>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollGenerateComponent {
  private payrollService = inject(PayrollService);
  private departmentService = inject(DepartmentService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  departments$ = this.departmentService.getDepartments().pipe(map(res => res.data || []));

  submitting = false;
  errorMsg = '';

  form = {
    periodStart: '',
    periodEnd: '',
    payDate: '',
    frequency: 'MONTHLY',
    departmentId: ''
  };

  submit() {
    if (!this.form.periodStart || !this.form.periodEnd || !this.form.payDate) {
      this.errorMsg = 'Parámetros incompletos. Todos los campos marcados son mandatorios.';
      return;
    }
    this.submitting = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.payrollService.generate(this.form).subscribe({
      next: (res: any) => {
        this.submitting = false;
        // Redirect to list where they can see the "PROCESSING" status
        this.router.navigate(['/payroll']);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMsg = err?.error?.message || 'Fallo crítico al iniciar el motor de nómina.';
        this.cdr.markForCheck();
      }
    });
  }
}
