import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-onboarding-detail',
    imports: [CommonModule, RouterLink, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, LucideAngularModule],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <app-button variant="ghost" routerLink="/onboarding">
          <lucide-icon name="arrow-left" size="16"></lucide-icon>
        </app-button>
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Lista de Verificación de Ingreso</h2>
          <p class="text-muted-foreground" *ngIf="onboarding">
            {{ onboarding.employee?.firstName }} {{ onboarding.employee?.lastName }}
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center p-12">
        <div class="animate-spin h-8 w-8 rounded-full border-b-2 border-primary"></div>
      </div>

      <ng-container *ngIf="!loading && onboarding">
        <!-- Progress -->
        <app-card>
          <app-card-content class="p-6">
            <div class="flex items-center gap-6">
              <div class="flex-1">
                <div class="flex justify-between mb-2">
                  <p class="font-semibold">Progreso General</p>
                  <span class="font-bold text-primary">{{ progress }}%</span>
                </div>
                <div class="h-3 bg-muted rounded-full overflow-hidden">
                  <div class="h-full bg-primary transition-all duration-700 rounded-full"
                       [style.width.%]="progress"></div>
                </div>
                <div class="flex gap-6 mt-3 text-sm text-muted-foreground">
                  <span>✅ {{ completedCount }} Completado</span>
                  <span>⏳ {{ pendingCount }} Pendiente</span>
                  <span *ngIf="onboarding.targetDate">
                    📅 Vence: {{ onboarding.targetDate | date:'MMM d, y' }}
                  </span>
                </div>
              </div>
              <span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
                    [ngClass]="statusClass(onboarding.status)">
                {{ onboarding.status | titlecase }}
              </span>
            </div>
          </app-card-content>
        </app-card>

        <!-- Tasks by Category -->
        <ng-container *ngFor="let category of categories">
          <app-card>
            <app-card-header>
              <app-card-title class="flex items-center gap-2">
                <lucide-icon [name]="categoryIcon(category)" size="18"></lucide-icon>
                {{ category }}
              </app-card-title>
            </app-card-header>
            <app-card-content class="p-0">
              <div *ngFor="let task of tasksByCategory(category)" class="p-4 border-b border-border last:border-0">
                <div class="flex items-start gap-3">
                  <!-- Toggle Checkbox -->
                  <button
                    class="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    [ngClass]="task.status === 'COMPLETED'
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border hover:border-primary'"
                    (click)="toggleTask(task)">
                    <lucide-icon *ngIf="task.status === 'COMPLETED'" name="check" size="12"></lucide-icon>
                  </button>

                  <div class="flex-1">
                    <p class="font-medium text-sm" [class.line-through]="task.status === 'COMPLETED'"
                       [class.text-muted-foreground]="task.status === 'COMPLETED'">
                      {{ task.title }}
                    </p>
                    <p *ngIf="task.description" class="text-xs text-muted-foreground mt-0.5">{{ task.description }}</p>
                    <div class="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span *ngIf="task.dueDate">Vence {{ task.dueDate | date:'MMM d' }}</span>
                      <span class="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs"
                            [ngClass]="taskStatusClass(task.status)">
                        {{ task.status }}
                      </span>
                    </div>
                  </div>

                  <span *ngIf="task.isRequired" class="text-xs text-red-500 font-medium flex-shrink-0">Requerido</span>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </ng-container>
      </ng-container>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingDetailComponent implements OnInit {
  private onboardingService = inject(OnboardingService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  onboarding: any = null;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.onboardingService.getOnboardingById(id).subscribe({
      next: (res: any) => {
        this.onboarding = res.data || null;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get tasks(): any[] { return this.onboarding?.tasks || []; }
  get completedCount() { return this.tasks.filter(t => t.status === 'COMPLETED').length; }
  get pendingCount() { return this.tasks.filter(t => t.status !== 'COMPLETED').length; }
  get progress() { return this.tasks.length ? Math.round((this.completedCount / this.tasks.length) * 100) : 0; }

  get categories(): string[] {
    return [...new Set(this.tasks.map((t: any) => t.category || 'OTRO'))];
  }

  tasksByCategory(cat: string): any[] {
    return this.tasks.filter((t: any) => (t.category || 'OTRO') === cat);
  }

  toggleTask(task: any) {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    this.onboardingService.updateOnboardingTask(task.id, { status: newStatus }).subscribe({
      next: () => {
        this.onboarding = {
          ...this.onboarding,
          tasks: this.onboarding.tasks.map((t: any) => t.id === task.id ? { ...t, status: newStatus } : t)
        };
        this.cdr.markForCheck();
      }
    });
  }

  categoryIcon(cat: string): string {
    const map: Record<string, string> = {
      IT_SETUP: 'monitor', DOCUMENTATION: 'file-text', TRAINING: 'graduation-cap',
      ORIENTATION: 'compass', COMPLIANCE: 'shield', EQUIPMENT: 'package',
      ACCESS: 'key', MEETING: 'users', SURVEY: 'clipboard', OTRO: 'circle'
    };
    return map[cat] || 'circle';
  }

  statusClass(s: string): string {
    const m: Record<string, string> = { NOT_STARTED: 'bg-gray-100 text-gray-600', IN_PROGRESS: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-green-100 text-green-700', OVERDUE: 'bg-red-100 text-red-700' };
    return m[s] || 'bg-muted text-muted-foreground';
  }

  taskStatusClass(s: string): string {
    const m: Record<string, string> = { COMPLETED: 'bg-green-100 text-green-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', PENDING: 'bg-amber-100 text-amber-700', BLOCKED: 'bg-red-100 text-red-700' };
    return m[s] || 'bg-muted text-muted-foreground';
  }
}
