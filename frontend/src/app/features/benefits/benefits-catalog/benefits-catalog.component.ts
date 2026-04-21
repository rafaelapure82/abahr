import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BenefitsService } from '../../../core/services/benefits.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardFooterComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, Gift, Heart, Coffee, ShieldCheck } from 'lucide-angular';

@Component({
  selector: 'app-benefits-catalog',
  standalone: true,
  imports: [
    CommonModule,
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
          <h2 class="text-3xl font-bold tracking-tight">Benefits Catalog</h2>
          <p class="text-muted-foreground">Explore and manage company-provided benefits and perks.</p>
        </div>
        <app-button variant="outline">
          <lucide-icon name="shield-check" size="18" class="mr-2"></lucide-icon> My Enrollments
        </app-button>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div *ngIf="loading" class="col-span-full py-12 text-center text-muted-foreground">
           <div class="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
           Loading available plans...
        </div>
        <div *ngIf="!loading && benefitPlans.length === 0" class="col-span-full py-12 text-center text-muted-foreground">
           No benefit plans available at this time.
        </div>
        <app-card *ngFor="let plan of benefitPlans" class="flex flex-col">
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
               <div *ngFor="let feat of (plan.coverageDetails || [])" class="flex items-start text-sm">
                 <lucide-icon name="shield-check" size="14" class="mr-2 text-green-500 mt-0.5"></lucide-icon>
                 <span>{{ feat }}</span>
               </div>
             </div>
          </app-card-content>
          <app-card-footer class="border-t border-border mt-4 pt-4">
            <app-button variant="primary" className="w-full" (click)="enroll(plan.id)">
              Enroll Now
            </app-button>
          </app-card-footer>
        </app-card>
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
