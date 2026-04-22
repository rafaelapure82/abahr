import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService, DashboardData, KpiCard, RecentActivity } from '../../core/services/dashboard.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 animate-fadeIn">

      <!-- ═══ HEADER ═══ -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Panel de Comando
          </h2>
          <p class="text-muted-foreground mt-1">Bienvenido de nuevo. Esto es lo que está pasando hoy en tu organización.</p>
        </div>
        <div class="flex items-center gap-3">
          <select
            [ngModel]="selectedPeriod()"
            (ngModelChange)="selectedPeriod.set($event); fetchDashboard()"
            class="px-3 py-2 rounded-xl border border-border bg-card/50 backdrop-blur-sm text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all"
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mes</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Año</option>
          </select>
          <a routerLink="/employees" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200">
            <lucide-icon name="users" size="16"></lucide-icon>
            Ver Empleados
          </a>
        </div>
      </div>

      @if (!loading() && data()) {

        <!-- ═══ KPI CARDS ═══ -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (kpi of kpiCards(); track $index) {
            <div
              class="group relative overflow-hidden rounded-2xl border border-border/50 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 cursor-default"
              [ngClass]="kpiBg[$index]"
            >
              <div class="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40"
                [ngClass]="kpiBlobColor[$index]"
              ></div>

              <div class="relative z-10 flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{{ kpi.label }}</p>
                  <p class="text-3xl font-bold tracking-tight">{{ kpi.value }}</p>
                  @if (kpi.change !== undefined) {
                    <div class="flex items-center gap-1 mt-2">
                      <span
                        class="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                        [ngClass]="{
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': kpi.trend === 'up',
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': kpi.trend === 'down',
                          'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400': kpi.trend === 'flat'
                        }"
                      >
                        {{ kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→' }}
                        {{ kpi.change }}%
                      </span>
                    </div>
                  }
                </div>
                <div class="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                  <lucide-icon [name]="kpi.icon || 'activity'" size="22"></lucide-icon>
                </div>
              </div>
            </div>
          }
        </div>

      @if (loading()) {
        <!-- ═══ LOADING STATE ═══ -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (_ of [1,2,3,4,5,6,7,8]; track $index) {
            <div class="rounded-2xl border border-border/50 p-5 animate-pulse">
              <div class="h-3 bg-muted rounded w-24 mb-3"></div>
              <div class="h-8 bg-muted rounded w-16 mb-2"></div>
              <div class="h-3 bg-muted rounded w-12"></div>
            </div>
          }
        </div>
      }

        <!-- ═══ CHARTS & ACTIVITY ROW ═══ -->
        <div class="grid gap-6 lg:grid-cols-7">
          <!-- Headcount by Department -->
          <div class="lg:col-span-4 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-bold">Empleados por Departamento</h3>
                <p class="text-xs text-muted-foreground mt-0.5">Distribución actual del headcount</p>
              </div>
              <lucide-icon name="bar-chart-3" size="18" class="text-muted-foreground"></lucide-icon>
            </div>
            <div class="space-y-3">
              @for (dept of data()!.headcountByDepartment; track dept.departmentName; let i = $index) {
                <div class="group">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-sm font-medium">{{ dept.departmentName }}</span>
                    <span class="text-sm font-bold text-primary">{{ dept.count }}</span>
                  </div>
                  <div class="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
                      [style.width.%]="getBarWidth(dept.count)"
                      [style.background]="getBarGradient(i)"
                    ></div>
                  </div>
                </div>
              } @empty {
                <div class="text-center text-muted-foreground text-sm py-6">
                  No hay departamentos registrados
                </div>
              }
            </div>
          </div>

          <!-- Monthly Trends -->
          <div class="lg:col-span-3 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-bold">Tendencia Mensual</h3>
                <p class="text-xs text-muted-foreground mt-0.5">Ingresos vs Salidas</p>
              </div>
              <lucide-icon name="trending-up" size="18" class="text-muted-foreground"></lucide-icon>
            </div>
            <div class="space-y-3">
              @for (trend of data()!.monthlyTrends; track trend.month) {
                <div class="flex items-center gap-4 py-2 border-b border-border/30 last:border-0">
                  <span class="text-xs font-mono text-muted-foreground w-16">{{ trend.month }}</span>
                  <div class="flex-1 flex items-center gap-2">
                    <span class="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-900/20 px-2 py-0.5 rounded-md">
                      ↑ {{ trend.hires }}
                    </span>
                    <span class="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
                      ↓ {{ trend.terminations }}
                    </span>
                  </div>
                  <span class="text-sm font-bold">{{ trend.headcount }}</span>
                </div>
              } @empty {
                <div class="text-center text-muted-foreground text-sm py-6">
                  Sin datos de tendencia para el período seleccionado
                </div>
              }
            </div>
          </div>
        </div>

        @if (!loading() && data()) {
          <!-- ═══ PAYROLL + LEAVES + ACTIVITY ═══ -->
          <div class="grid gap-6 lg:grid-cols-3">
        <!-- Payroll Summary -->
        <div routerLink="/payroll" class="cursor-pointer group rounded-2xl border border-border/50 bg-gradient-to-br from-card to-primary/[0.02] backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-primary/5 transition-all">
          <div class="flex items-center gap-3 mb-5">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <lucide-icon name="dollar-sign" size="20"></lucide-icon>
            </div>
            <div>
              <h3 class="text-lg font-bold">Resumen Nómina</h3>
              <p class="text-xs text-muted-foreground">Último período procesado</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-border/20">
              <span class="text-sm text-muted-foreground">Bruto Total</span>
              <span class="text-sm font-bold">\${{ data()!.payrollSummary.totalGross | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-border/20">
              <span class="text-sm text-muted-foreground">Deducciones</span>
              <span class="text-sm font-semibold text-red-500">-\${{ data()!.payrollSummary.totalDeductions | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-border/20">
              <span class="text-sm text-muted-foreground">Bonificaciones</span>
              <span class="text-sm font-semibold text-green-600">+\${{ data()!.payrollSummary.totalBonuses | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between items-center pt-3">
              <span class="text-sm font-semibold">Neto Total</span>
              <span class="text-lg font-bold text-primary">\${{ data()!.payrollSummary.totalNet | number:'1.2-2' }}</span>
            </div>
            <div class="text-xs text-muted-foreground text-center mt-2">{{ data()!.payrollSummary.employeeCount }} empleados • {{ data()!.payrollSummary.currency }}</div>
          </div>
        </div>

        <!-- Leave Overview -->
        <div routerLink="/leaves" class="cursor-pointer group rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-primary/5 transition-all">
          <div class="flex items-center gap-3 mb-5">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <lucide-icon name="calendar-days" size="20"></lucide-icon>
            </div>
            <div>
              <h3 class="text-lg font-bold">Gestión de Ausencias</h3>
              <p class="text-xs text-muted-foreground">Solicitudes pendientes</p>
            </div>
          </div>
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200/50 dark:border-yellow-800/30">
                <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ data()!.leaveOverview.pending }}</p>
                <p class="text-xs text-muted-foreground mt-1">Pendientes</p>
              </div>
              <div class="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200/50 dark:border-green-800/30">
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ data()!.leaveOverview.approved }}</p>
                <p class="text-xs text-muted-foreground mt-1">Aprobados</p>
              </div>
              <div class="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30">
                <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ data()!.leaveOverview.rejected }}</p>
                <p class="text-xs text-muted-foreground mt-1">Rechazados</p>
              </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div routerLink="/notifications" class="cursor-pointer group rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-primary/5 transition-all">
          <div class="flex items-center gap-3 mb-5">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <lucide-icon name="bell" size="20"></lucide-icon>
            </div>
            <div>
              <h3 class="text-lg font-bold">Actividad Reciente</h3>
              <p class="text-xs text-muted-foreground">Últimas actualizaciones</p>
            </div>
          </div>
          <div class="space-y-3 max-h-[230px] overflow-y-auto pr-1">
            @for (activity of data()!.recentActivity; track activity.timestamp) {
              <div class="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                <div class="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                  [class.bg-blue-500]="activity.severity === 'info'"
                  [class.bg-yellow-500]="activity.severity === 'warning'"
                  [class.bg-red-500]="activity.severity === 'error'"
                  [class.bg-green-500]="activity.severity === 'success'"
                ></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ activity.title }}</p>
                  <p class="text-xs text-muted-foreground truncate">{{ activity.description }}</p>
                </div>
                <span class="text-xs text-muted-foreground whitespace-nowrap">{{ getTimeAgo(activity.timestamp) }}</span>
              </div>
            } @empty {
              <div class="text-center text-muted-foreground text-sm py-4">
                Sin actividad reciente
              </div>
            }
          </div>
        </div>
      </div>

        @if (data()!.upcomingBirthdays.length > 0) {
          <!-- ═══ UPCOMING BIRTHDAYS ═══ -->
          <div class="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
            <div class="flex items-center gap-3 mb-5">
              <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 text-pink-600 dark:text-pink-400">
                <lucide-icon name="cake" size="20"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold">Próximos Cumpleaños 🎂</h3>
                <p class="text-xs text-muted-foreground">En los próximos 30 días</p>
              </div>
            </div>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              @for (bday of data()!.upcomingBirthdays; track bday.name) {
                <div class="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-900/10 dark:to-rose-900/10 border border-pink-200/30 dark:border-pink-800/20">
                  <div class="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 text-sm">
                    <lucide-icon name="user" size="14"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold truncate">{{ bday.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ bday.date }} • {{ bday.departmentName }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dashboardService = inject(DashboardService);
 
  data = signal<DashboardData | null>(null);
  loading = signal(true);
  selectedPeriod = signal('week');

  // Gradient backgrounds for KPI cards
  kpiBg = [
    'bg-card/80 backdrop-blur-sm',
    'bg-card/80 backdrop-blur-sm',
    'bg-card/80 backdrop-blur-sm',
    'bg-card/80 backdrop-blur-sm',
    'bg-card/80 backdrop-blur-sm',
    'bg-card/80 backdrop-blur-sm',
    'bg-card/80 backdrop-blur-sm',
    'bg-card/80 backdrop-blur-sm',
  ];

  kpiBlobColor = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-orange-500',
    'bg-teal-500',
  ];

  kpiCards = computed(() => {
    const d = this.data();
    if (!d?.kpis) return [];
    return [
      d.kpis.totalEmployees,
      d.kpis.activeEmployees,
      d.kpis.departmentsCount,
      d.kpis.pendingLeaves,
      d.kpis.turnoverRate,
      d.kpis.avgPerformance,
      d.kpis.absenteeismRate,
      d.kpis.payrollCost,
    ];
  });

  private barColors = [
    'linear-gradient(90deg, #10b981, #34d399)',
    'linear-gradient(90deg, #3b82f6, #60a5fa)',
    'linear-gradient(90deg, #8b5cf6, #a78bfa)',
    'linear-gradient(90deg, #f59e0b, #fbbf24)',
    'linear-gradient(90deg, #ef4444, #f87171)',
    'linear-gradient(90deg, #06b6d4, #22d3ee)',
    'linear-gradient(90deg, #ec4899, #f472b6)',
    'linear-gradient(90deg, #14b8a6, #2dd4bf)',
  ];

  ngOnInit() {
    // Use pre-fetched data from resolver
    const resolvedData = (this.route.snapshot.data as any)['stats'];
    if (resolvedData) {
      this.data.set(resolvedData.data);
      this.loading.set(false);
    } else {
      this.fetchDashboard();
    }
  }

  fetchDashboard() {
    this.loading.set(true);

    this.dashboardService.getDashboard(this.selectedPeriod()).subscribe({
      next: (res) => {
        this.data.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }


  getBarWidth(count: number): number {
    const d = this.data();
    if (!d?.headcountByDepartment.length) return 0;
    const max = Math.max(...d.headcountByDepartment.map(d => d.count));
    return max > 0 ? (count / max) * 100 : 0;
  }

  getBarGradient(index: number): string {
    return this.barColors[index % this.barColors.length];
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `hace ${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `hace ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `hace ${diffD}d`;
    return date.toLocaleDateString('es', { month: 'short', day: 'numeric' });
  }
}



