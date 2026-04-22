import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';

import { PerformanceService } from '../../../core/services/performance.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, Award, Plus, ArrowUpRight, MessageSquare } from 'lucide-angular';

@Component({
    selector: 'app-performance-dashboard',
    imports: [
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    LucideAngularModule
],
    template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Desempeño</h2>
          <p class="text-muted-foreground">Monitorea y gestiona el crecimiento y retroalimentación de los empleados.</p>
        </div>
        <div class="flex gap-2">
          <app-button variant="outline">
            <lucide-icon name="plus" size="18" class="mr-2"></lucide-icon> Nueva Plantilla
          </app-button>
          <app-button variant="primary">
            <lucide-icon name="award" size="18" class="mr-2"></lucide-icon> Iniciar Ciclo de Evaluación
          </app-button>
        </div>
      </div>
    
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Active Cycles -->
        <app-card>
          <app-card-header>
            <app-card-title class="text-lg">Ciclos de Evaluación Activos</app-card-title>
          </app-card-header>
          <app-card-content>
            <div class="space-y-4">
              @for (cycle of activeCycles; track cycle) {
                <div class="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
                  <div>
                    <p class="font-semibold">{{ cycle.name }}</p>
                    <p class="text-xs text-muted-foreground">Vence: {{ cycle.dueDate }}</p>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <p class="text-sm font-medium">{{ cycle.progress }}% Completado</p>
                      <div class="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div class="h-full bg-primary" [style.width.%]="cycle.progress"></div>
                      </div>
                    </div>
                    <app-button variant="ghost" size="icon">
                      <lucide-icon name="arrow-up-right" size="16"></lucide-icon>
                    </app-button>
                  </div>
                </div>
              }
            </div>
          </app-card-content>
        </app-card>
    
        <!-- Pending 360 Feedback -->
        <app-card>
          <app-card-header>
            <app-card-title class="text-lg">Solicitudes de Retroalimentación 360</app-card-title>
          </app-card-header>
          <app-card-content>
            <div class="space-y-4">
              @for (request of feedbackRequests; track request) {
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {{ request.from[0] }}
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium">Evaluación para {{ request.from }}</p>
                    <p class="text-xs text-muted-foreground">Rol: {{ request.relationship }}</p>
                  </div>
                  <app-button variant="secondary" size="sm">
                    <lucide-icon name="message-square" size="14" class="mr-1"></lucide-icon> Dar Retroalimentación
                  </app-button>
                </div>
              }
            </div>
          </app-card-content>
        </app-card>
      </div>
    
      <!-- Recent Reviews Table -->
      <app-card>
        <app-card-header>
          <app-card-title class="text-lg">Evaluaciones Finalizadas Recientemente</app-card-title>
        </app-card-header>
        <app-card-content class="p-0">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/50">
                <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Empleado</th>
                <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Ciclo</th>
                <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Calificación</th>
                <th class="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @if (loading) {
                <tr class="border-b border-border">
                  <td colspan="4" class="p-8 text-center text-muted-foreground italic">Cargando evaluaciones...</td>
                </tr>
              }
              @if (!loading && reviews.length === 0) {
                <tr class="border-b border-border">
                  <td colspan="4" class="p-8 text-center text-muted-foreground italic">No se encontraron evaluaciones.</td>
                </tr>
              }
              @for (review of reviews; track review) {
                <tr class="border-b border-border hover:bg-muted/30 transition-colors">
                  <td class="p-4 align-middle font-medium">{{ review.employee?.firstName }} {{ review.employee?.lastName }}</td>
                  <td class="p-4 align-middle text-muted-foreground text-xs">{{ review.cycle?.name }}</td>
                  <td class="p-4 align-middle">
                    @if (review.finalScore) {
                      <div class="flex items-center gap-1">
                        <span class="font-bold text-primary">{{ review.finalScore }}</span>
                        <span class="text-muted-foreground text-xs">/ 5</span>
                      </div>
                    } @else {
                      <span class="text-xs text-muted-foreground italic">Pendiente</span>
                    }
                  </td>
                  <td class="p-4 align-middle text-right">
                    <app-button variant="ghost" size="sm">Ver Informe</app-button>
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
export class PerformanceDashboardComponent implements OnInit {
  private performanceService = inject(PerformanceService);
  
  reviews: any[] = [];
  activeCycles: any[] = [];
  feedbackRequests: any[] = [];
  loading = true;

  ngOnInit() {
    this.fetchPerformanceData();
  }

  fetchPerformanceData() {
    this.loading = true;
    this.performanceService.getReviews().subscribe({
      next: (res: any) => {
        this.reviews = res.data || [];
        // Filtering for active cycles (mock logic if backend doesn't have a separate endpoint)
        this.activeCycles = this.reviews.filter(r => r.status === 'ACTIVE' || r.status === 'SELF_EVALUATION');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
