import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';

import { BenefitsService } from '../../../core/services/benefits.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardFooterComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, Gift, Heart, Coffee, ShieldCheck } from 'lucide-angular';

@Component({
    selector: 'app-benefits-catalog',
    imports: [
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    CardFooterComponent,
    ButtonComponent,
    LucideAngularModule
],
    template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Catálogo de Beneficios</h2>
          <p class="text-muted-foreground">Explora y gestiona los beneficios y ventajas proporcionados por la empresa.</p>
        </div>
        <app-button variant="outline">
          <lucide-icon name="shield-check" size="18" class="mr-2"></lucide-icon> Mis Inscripciones
        </app-button>
      </div>
    
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        @if (loading) {
          <div class="col-span-full py-12 text-center text-muted-foreground">
            <div class="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            Cargando planes disponibles...
          </div>
        }
        @if (!loading && benefitPlans.length === 0) {
          <div class="col-span-full py-12 text-center text-muted-foreground">
            No hay planes de beneficios disponibles en este momento.
          </div>
        }
        @for (plan of benefitPlans; track plan) {
          <app-card class="flex flex-col">
            <app-card-header>
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <lucide-icon [name]="getIcon(plan.type)" size="24"></lucide-icon>
                </div>
                <span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {{ plan.type }}
                </span>
              </div>
              <app-card-title class="text-xl">{{ plan.name }}</app-card-title>
              <p class="text-sm text-muted-foreground">{{ plan.description }}</p>
            </app-card-header>
            <app-card-content class="flex-1">
              <div class="space-y-2 mt-2">
                @for (feat of (plan.coverageDetails || []); track feat) {
                  <div class="flex items-start text-sm">
                    <lucide-icon name="shield-check" size="14" class="mr-2 text-green-500 mt-0.5"></lucide-icon>
                    <span>{{ feat }}</span>
                  </div>
                }
              </div>
            </app-card-content>
            <app-card-footer class="border-t border-border mt-4 pt-4">
              <app-button variant="primary" className="w-full" (click)="enroll(plan.id)">
                Inscribirse Ahora
              </app-button>
            </app-card-footer>
          </app-card>
        }
      </div>
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BenefitsCatalogComponent implements OnInit {
  private benefitsService = inject(BenefitsService);
  
  benefitPlans: any[] = [];
  loading = true;

  ngOnInit() {
    this.fetchPlans();
  }

  fetchPlans() {
    this.loading = true;
    this.benefitsService.getPlans().subscribe({
      next: (res: any) => {
        this.benefitPlans = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'HEALTH': return 'heart';
      case 'LIFESTYLE': return 'coffee';
      case 'GROWTH': return 'award';
      default: return 'gift';
    }
  }

  enroll(planId: string) {
    // Enrollment logic here
    console.log('Enrolling in plan:', planId);
  }
}
