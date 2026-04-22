import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-onboarding-dashboard',
    imports: [CommonModule, RouterLink, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, LucideAngularModule],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Onboarding</h2>
          <p class="text-muted-foreground">Seguimiento del progreso de nuevas contrataciones y tareas de ingreso.</p>
        </div>
        <div class="flex gap-2">
          <app-button variant="outline" routerLink="/onboarding/offboarding">
            <lucide-icon name="log-out" size="16" class="mr-2"></lucide-icon> Offboarding
          </app-button>
        </div>
      </div>
    
      <!-- Status Stats -->
      <div class="grid md:grid-cols-4 gap-4">
        @for (s of stats; track s) {
          <app-card>
            <app-card-content class="flex items-center gap-4 p-6">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" [ngClass]="s.bg">
                <lucide-icon [name]="s.icon" size="20" [ngClass]="s.color"></lucide-icon>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">{{ s.label }}</p>
                <p class="text-xl font-bold">{{ s.value }}</p>
              </div>
            </app-card-content>
          </app-card>
        }
      </div>
    
      <!-- Onboarding Cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        @if (loading) {
          <div class="col-span-full flex justify-center p-12">
            <div class="animate-spin h-8 w-8 rounded-full border-b-2 border-primary"></div>
          </div>
        }
        @if (!loading && onboardings.length === 0) {
          <div class="col-span-full text-center p-12 text-muted-foreground italic">
            No hay procesos de ingreso activos.
          </div>
        }
    
        @for (ob of onboardings; track ob) {
          <div
            class="group cursor-pointer" [routerLink]="['/onboarding', ob.id]">
            <app-card class="hover:border-primary/50 hover:shadow-md transition-all duration-200">
              <app-card-content class="p-5">
                <!-- Employee info -->
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {{ ob.employee?.firstName?.[0] }}{{ ob.employee?.lastName?.[0] }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold truncate">{{ ob.employee?.firstName }} {{ ob.employee?.lastName }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ ob.employee?.jobTitle }}</p>
                  </div>
                  <span class="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                    [ngClass]="statusClass(ob.status)">
                    {{ ob.status | titlecase }}
                  </span>
                </div>
                <!-- Progress Bar -->
                <div class="mb-3">
                  <div class="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progreso</span>
                    <span>{{ progress(ob) }}%</span>
                  </div>
                  <div class="h-2 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-primary transition-all duration-500 rounded-full"
                      [style.width.%]="progress(ob)">
                    </div>
                  </div>
                </div>
                <!-- Info -->
                <div class="flex justify-between text-xs text-muted-foreground">
                  <span>
                    <lucide-icon name="check-square" size="12" class="inline mr-1"></lucide-icon>
                    {{ completedTasks(ob) }}/{{ totalTasks(ob) }} tareas
                  </span>
                  @if (ob.targetDate) {
                    <span>
                      <lucide-icon name="calendar" size="12" class="inline mr-1"></lucide-icon>
                      Vence {{ ob.targetDate | date:'MMM d' }}
                    </span>
                  }
                </div>
              </app-card-content>
            </app-card>
          </div>
        }
      </div>
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingDashboardComponent implements OnInit {
  private onboardingService = inject(OnboardingService);
  private cdr = inject(ChangeDetectorRef);

  onboardings: any[] = [];
  loading = true;

  stats = [
    { label: 'No Iniciado', value: '—', icon: 'circle', color: 'text-muted-foreground', bg: 'bg-muted' },
    { label: 'En Progreso', value: '—', icon: 'loader-2', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completado', value: '—', icon: 'check-circle-2', color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Vencido', value: '—', icon: 'alert-triangle', color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.onboardingService.listOnboardings().subscribe({
      next: (res: any) => {
        const data: any[] = res.data || [];
        this.onboardings = data;
        this.stats = [
          { label: 'No Iniciado', value: String(data.filter(o => o.status === 'NOT_STARTED').length), icon: 'circle', color: 'text-muted-foreground', bg: 'bg-muted' },
          { label: 'En Progreso', value: String(data.filter(o => o.status === 'IN_PROGRESS').length), icon: 'loader-2', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Completado', value: String(data.filter(o => o.status === 'COMPLETED').length), icon: 'check-circle-2', color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Vencido', value: String(data.filter(o => o.status === 'OVERDUE').length), icon: 'alert-triangle', color: 'text-red-500', bg: 'bg-red-500/10' },
        ];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  totalTasks(ob: any): number { return ob.tasks?.length || 0; }
  completedTasks(ob: any): number { return ob.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0; }
  progress(ob: any): number {
    const total = this.totalTasks(ob);
    return total ? Math.round((this.completedTasks(ob) / total) * 100) : 0;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      NOT_STARTED: 'bg-gray-100 text-gray-600',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      OVERDUE: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-muted text-muted-foreground';
  }
}
