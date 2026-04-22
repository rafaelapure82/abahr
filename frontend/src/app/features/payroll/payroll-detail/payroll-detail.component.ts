import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PayrollService } from '../../../core/services/payroll.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-payroll-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, LucideAngularModule],
  template: `
    <div class="min-h-[80vh] bg-transparent text-slate-200 font-sans p-4 md:p-8 animate-fade-in relative">
      <!-- Background Glow -->
      <div class="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
        <div class="flex items-center gap-6">
          <app-button variant="ghost" routerLink="/payroll" class="rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 text-white">
            <lucide-icon name="arrow-left" size="20"></lucide-icon>
          </app-button>
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <h2 class="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Detalle de Nómina
              </h2>
              <div *ngIf="payroll" class="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border" [ngClass]="statusClass(payroll.status)">
                {{ payroll.status }}
              </div>
            </div>
            <p class="text-slate-400 font-medium text-lg" *ngIf="payroll">
              {{ payroll.periodStart | date:'longDate' }} — {{ payroll.periodEnd | date:'longDate' }}
            </p>
          </div>
        </div>
        
        <div class="flex gap-4" *ngIf="payroll">
          <button (click)="exportExcel()" class="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all flex items-center gap-3 shadow-xl">
            <lucide-icon name="file-spreadsheet" size="20" class="text-emerald-400"></lucide-icon>
            Exportar Auditoría
          </button>
          <button *ngIf="payroll.status === 'DRAFT' || payroll.status === 'PENDING_APPROVAL'" 
                  (click)="approve()" 
                  class="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-3 active:scale-95">
            <lucide-icon name="check-circle" size="20"></lucide-icon>
            Aprobar Nómina
          </button>
        </div>
      </div>

      <!-- Processing State Placeholder -->
      <div *ngIf="payroll?.status === 'PROCESSING'" class="glass-card p-20 rounded-[40px] text-center space-y-8 animate-pulse">
        <div class="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_50px_rgba(79,70,229,0.4)]"></div>
        <div class="space-y-4">
          <h3 class="text-3xl font-black text-white">Calculando Resultados...</h3>
          <p class="text-slate-400 text-lg max-w-md mx-auto">
            El motor de nómina está procesando los recibos en segundo plano. Los datos aparecerán automáticamente al finalizar.
          </p>
        </div>
        <button (click)="loadData()" class="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest">
          Refrescar Estado
        </button>
      </div>

      <ng-container *ngIf="payroll && payroll.status !== 'PROCESSING'">
        <!-- Financial Summary Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
          <div class="glass-card p-8 rounded-[32px] group relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <lucide-icon name="trending-up" size="48"></lucide-icon>
            </div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Total Bruto</p>
            <h4 class="text-3xl font-black text-white">{{ payroll.totalGross | currency }}</h4>
            <div class="w-full h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
              <div class="h-full bg-slate-400 w-full rounded-full"></div>
            </div>
          </div>

          <div class="glass-card p-8 rounded-[32px] group relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <lucide-icon name="arrow-down-circle" size="48"></lucide-icon>
            </div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Deducciones</p>
            <h4 class="text-3xl font-black text-rose-400">{{ payroll.totalDeductions | currency }}</h4>
            <div class="w-full h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
              <div class="h-full bg-rose-500 w-[15%] rounded-full shadow-[0_0_10px_#f43f5e]"></div>
            </div>
          </div>

          <div class="glass-card p-8 rounded-[32px] group relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <lucide-icon name="plus-circle" size="48"></lucide-icon>
            </div>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Bonificaciones</p>
            <h4 class="text-3xl font-black text-indigo-400">{{ payroll.totalBonuses | currency }}</h4>
            <div class="w-full h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
              <div class="h-full bg-indigo-500 w-[10%] rounded-full shadow-[0_0_10px_#6366f1]"></div>
            </div>
          </div>

          <div class="glass-card p-8 rounded-[32px] border-emerald-500/20 group relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <lucide-icon name="check-circle" size="48"></lucide-icon>
            </div>
            <p class="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] mb-4">Total Neto a Pagar</p>
            <h4 class="text-4xl font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">{{ payroll.totalNet | currency }}</h4>
            <div class="w-full h-1 bg-emerald-500/10 rounded-full mt-6 overflow-hidden">
              <div class="h-full bg-emerald-500 w-full rounded-full shadow-[0_0_15px_#10b981]"></div>
            </div>
          </div>
        </div>

        <!-- Receipts Table Area -->
        <div class="glass-card rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative z-10">
          <div class="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 class="text-xl font-bold flex items-center gap-3">
              <lucide-icon name="users" size="20" class="text-indigo-400"></lucide-icon>
              Recibos de Empleados
            </h3>
            <div class="flex items-center gap-4">
              <div class="relative">
                <lucide-icon name="search" size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></lucide-icon>
                <input type="text" placeholder="Filtrar empleado..." class="h-10 pl-12 pr-6 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all">
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-white/5 border-b border-white/5">
                  <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Colaborador</th>
                  <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Base</th>
                  <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Extras</th>
                  <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Bruto</th>
                  <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Deducciones</th>
                  <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Neto</th>
                  <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items" class="border-b border-white/5 group hover:bg-white/5 transition-all">
                  <td class="p-6">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {{ item.employee?.firstName[0] }}{{ item.employee?.lastName[0] }}
                      </div>
                      <div class="flex flex-col">
                        <span class="font-bold text-white group-hover:text-indigo-400 transition-colors">{{ item.employee?.firstName }} {{ item.employee?.lastName }}</span>
                        <span class="text-[10px] font-bold text-slate-500 uppercase">{{ item.employee?.department?.name || 'Staff' }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="p-6 text-right font-mono text-slate-300">{{ item.baseSalary | currency }}</td>
                  <td class="p-6 text-right font-mono text-slate-300">{{ item.overtimePay | currency }}</td>
                  <td class="p-6 text-right font-mono font-bold text-white">{{ item.grossPay | currency }}</td>
                  <td class="p-6 text-right font-mono text-rose-400">
                    -{{ getTotalDeductions(item) | currency }}
                  </td>
                  <td class="p-6 text-right font-mono font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                    {{ item.netPay | currency }}
                  </td>
                  <td class="p-6">
                    <div class="flex justify-center">
                      <button (click)="downloadPDF(item.id)" class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600 hover:border-indigo-600 transition-all text-white group/btn">
                        <lucide-icon name="file-text" size="18" class="group-hover/btn:scale-110 transition-transform"></lucide-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- Global Loading -->
      <div *ngIf="loading" class="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <div class="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-indigo-400 font-bold tracking-[0.3em] animate-pulse">CARGANDO NÓMINA</p>
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
      .animate-fade-in { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollDetailComponent implements OnInit {
  private payrollService = inject(PayrollService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  payroll: any = null;
  items: any[] = [];
  loading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading = true;
    this.cdr.markForCheck();
    
    this.payrollService.getById(id).subscribe({
      next: (res: any) => {
        this.payroll = res.data || null;
        this.items = res.data?.items || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  approve() {
    if (!confirm('¿Confirmar aprobación definitiva de este periodo?')) return;
    this.payrollService.approve(this.payroll.id).subscribe({
      next: (res: any) => {
        this.payroll = { ...this.payroll, status: res.data?.status || 'APPROVED' };
        this.cdr.markForCheck();
      }
    });
  }

  exportExcel() {
    this.payrollService.exportExcel(this.payroll.id).subscribe({
      next: blob => this.payrollService.triggerDownload(blob, `auditoria-nomina-${this.payroll.id}.xlsx`)
    });
  }

  downloadPDF(itemId: string) {
    this.payrollService.downloadItemPDF(itemId).subscribe({
      next: blob => this.payrollService.triggerDownload(blob, `recibo-pago-${itemId}.pdf`)
    });
  }

  getTotalDeductions(item: any): number {
    return (item.deductions || []).reduce((sum: number, d: any) => sum + (+d.amount || 0), 0);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'text-slate-400 border-slate-500/20 bg-slate-500/5',
      PROCESSING: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
      PENDING_APPROVAL: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      APPROVED: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      PAID: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      CANCELLED: 'text-red-400 border-red-500/20 bg-red-500/5',
      FAILED: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    };
    return map[status] || '';
  }
}
