import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PayrollService } from '../../../core/services/payroll.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, LucideAngularModule],
  template: `
    <div class="min-h-[80vh] bg-transparent text-slate-200 font-sans p-4 md:p-8 animate-fade-in relative">
      <!-- Background Glow -->
      <div class="absolute -top-20 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
        <div class="space-y-2">
          <h2 class="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Gestión de Nómina
          </h2>
          <p class="text-slate-400 font-medium text-lg max-w-xl">
            Control centralizado de compensaciones, auditoría financiera y procesamiento automatizado "Nivel Dios".
          </p>
        </div>
        
        <div class="flex items-center gap-4">
          <button (click)="load()" class="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white" title="Refrescar">
            <lucide-icon name="refresh-cw" size="20" [class.animate-spin]="loading"></lucide-icon>
          </button>
          <button routerLink="/payroll/generate" class="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-3 active:scale-95">
            <lucide-icon name="plus" size="20"></lucide-icon>
            Ejecutar Nueva Nómina
          </button>
        </div>
      </div>

      <!-- Status Hub (Nivel Dios Summary) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
        <div *ngFor="let s of summary" class="glass-card p-6 rounded-[32px] group hover:bg-white/5 transition-all cursor-default relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="flex items-center justify-between relative z-10">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10" [ngClass]="s.bg">
              <lucide-icon [name]="s.icon" size="24" [ngClass]="s.color"></lucide-icon>
            </div>
            <div class="text-right">
              <p class="text-3xl font-black text-white">{{ s.value }}</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{{ s.label }}</p>
            </div>
          </div>
          
          <!-- Decorative progress-like bar -->
          <div class="w-full h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-1000" [ngClass]="s.bgClass" [style.width]="'40%'"></div>
          </div>
        </div>
      </div>

      <!-- Main Content Area (Table) -->
      <div class="glass-card rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative z-10">
        <div class="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h3 class="text-xl font-bold flex items-center gap-3">
            <lucide-icon name="file-text" size="20" class="text-indigo-400"></lucide-icon>
            Historial de Periodos
          </h3>
          <div class="flex items-center gap-2">
            <div class="px-4 py-2 rounded-xl bg-[#0f172a]/40 border border-white/10 text-xs font-bold text-slate-400">
              Total Periodos: {{ payrolls.length }}
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-white/5 border-b border-white/5">
                <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identificador / Periodo</th>
                <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Departamento</th>
                <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Totales (USD)</th>
                <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                <th class="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones de Control</th>
              </tr>
            </thead>
            <tbody>
              <!-- Empty State -->
              <tr *ngIf="!loading && payrolls.length === 0">
                <td colspan="5" class="p-20 text-center">
                  <div class="space-y-4 opacity-30">
                    <lucide-icon name="clipboard-list" size="64" class="mx-auto"></lucide-icon>
                    <p class="text-xl font-bold">Sin registros de nómina</p>
                  </div>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr *ngFor="let p of payrolls" class="border-b border-white/5 last:border-0 group hover:bg-white/5 transition-all">
                <td class="p-6">
                  <div class="flex flex-col">
                    <span class="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">
                      {{ p.name || 'Nómina de Periodo' }}
                    </span>
                    <span class="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                      <lucide-icon name="calendar" size="12"></lucide-icon>
                      {{ p.startDate | date:'MMM d' }} – {{ p.endDate | date:'MMM d, y' }}
                    </span>
                  </div>
                </td>
                <td class="p-6">
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
                    <lucide-icon name="users" size="12" class="text-indigo-400"></lucide-icon>
                    {{ p.department?.name || 'Empresa General' }}
                  </div>
                </td>
                <td class="p-6 text-right">
                  <div class="flex flex-col items-end">
                    <span class="text-xl font-black text-white">{{ p.totalNet | currency:'USD' }}</span>
                    <span class="text-[10px] font-bold text-slate-500 uppercase mt-1">Neto a Pagar</span>
                  </div>
                </td>
                <td class="p-6">
                  <!-- Dynamic Status Badge -->
                  <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all"
                       [ngClass]="statusClass(p.status)">
                    <div class="w-2 h-2 rounded-full animate-pulse" [ngClass]="statusBullet(p.status)"></div>
                    {{ p.status === 'PROCESSING' ? 'Procesando...' : p.status }}
                  </div>
                </td>
                <td class="p-6 text-right">
                  <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <button [routerLink]="['/payroll', p.id]" class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600/20 hover:border-indigo-600 transition-all text-white" title="Ver Detalles">
                      <lucide-icon name="eye" size="18"></lucide-icon>
                    </button>
                    <button *ngIf="p.status === 'PENDING_APPROVAL'" (click)="approve(p.id)" class="p-3 rounded-xl bg-green-600/20 border border-green-600/40 hover:bg-green-600 transition-all text-white" title="Aprobar">
                      <lucide-icon name="check" size="18"></lucide-icon>
                    </button>
                    <button (click)="exportExcel(p.id)" class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-600/20 hover:border-emerald-600 transition-all text-white" title="Exportar Excel">
                      <lucide-icon name="file-spreadsheet" size="18"></lucide-icon>
                    </button>
                    <button class="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-600 transition-all text-red-400">
                      <lucide-icon name="trash-2" size="18"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Loading Overlay -->
        <div *ngIf="loading" class="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-20 flex items-center justify-center">
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(79,70,229,0.3)]"></div>
            <p class="text-indigo-400 font-bold animate-pulse tracking-widest">SINCRONIZANDO DATOS</p>
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
      .animate-fade-in { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    </style>
  `
})
export class PayrollListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private payrollService = inject(PayrollService);
  private cdr = inject(ChangeDetectorRef);

  payrolls: any[] = [];
  loading = true;

  summary = [
    { label: 'Procesando', value: '0', icon: 'refresh-cw', color: 'text-indigo-400', bg: 'bg-indigo-600/10', bgClass: 'bg-indigo-500' },
    { label: 'Revision', value: '0', icon: 'clock', color: 'text-amber-400', bg: 'bg-amber-600/10', bgClass: 'bg-amber-500' },
    { label: 'Listas', value: '0', icon: 'check-circle', color: 'text-blue-400', bg: 'bg-blue-600/10', bgClass: 'bg-blue-500' },
    { label: 'Pagadas', value: '0', icon: 'dollar-sign', color: 'text-emerald-400', bg: 'bg-emerald-600/10', bgClass: 'bg-emerald-500' },
  ];

  ngOnInit() { 
    // Use pre-fetched data
    const resolvedData = (this.route.snapshot.data as any)['payrolls'];
    if (resolvedData) {
      this.updateData(resolvedData.data || []);
      this.loading = false;
      this.cdr.detectChanges();
    } else {
      this.load(); 
    }
  }

  load() {
    this.loading = true;
    this.cdr.detectChanges();
    this.payrollService.list().subscribe({
      next: (res: any) => {
        this.updateData(res.data || []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateData(data: any[]) {
    this.payrolls = data;
    this.summary = [
      { label: 'Procesando', value: String(data.filter((p: any) => p.status === 'PROCESSING').length), icon: 'refresh-cw', color: 'text-indigo-400', bg: 'bg-indigo-600/10', bgClass: 'bg-indigo-500' },
      { label: 'Revisión', value: String(data.filter((p: any) => p.status === 'PENDING_APPROVAL' || p.status === 'DRAFT').length), icon: 'clock', color: 'text-amber-400', bg: 'bg-amber-600/10', bgClass: 'bg-amber-500' },
      { label: 'Listas', value: String(data.filter((p: any) => p.status === 'APPROVED').length), icon: 'check-circle', color: 'text-blue-400', bg: 'bg-blue-600/10', bgClass: 'bg-blue-500' },
      { label: 'Pagadas', value: String(data.filter((p: any) => p.status === 'PAID').length), icon: 'dollar-sign', color: 'text-emerald-400', bg: 'bg-emerald-600/10', bgClass: 'bg-emerald-500' },
    ];
  }

  approve(id: string) {
    if (!confirm('¿Está seguro de aprobar este periodo de nómina?')) return;
    this.payrollService.approve(id).subscribe({ next: () => this.load() });
  }

  exportExcel(id: string) {
    this.payrollService.exportExcel(id).subscribe({
      next: blob => this.payrollService.triggerDownload(blob, `nomina-periodo-${id}.xlsx`)
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      PROCESSING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      PENDING_APPROVAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      APPROVED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
      FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }

  statusBullet(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-500',
      PROCESSING: 'bg-indigo-500',
      PENDING_APPROVAL: 'bg-amber-500',
      APPROVED: 'bg-blue-500',
      PAID: 'bg-emerald-500',
      CANCELLED: 'bg-red-500',
      FAILED: 'bg-rose-500',
    };
    return map[status] || 'bg-slate-500';
  }
}
