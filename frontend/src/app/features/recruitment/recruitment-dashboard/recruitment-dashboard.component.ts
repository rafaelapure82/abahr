import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecruitmentService } from '../../../core/services/recruitment.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, Search, Plus, Briefcase, Users, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-recruitment-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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
          <h2 class="text-3xl font-bold tracking-tight">Recruitment</h2>
          <p class="text-muted-foreground">Manage job vacancies and track candidate pipelines.</p>
        </div>
        <app-button variant="primary">
          <lucide-icon name="plus" size="18" class="mr-2"></lucide-icon> New Vacancy
        </app-button>
      </div>

      <!-- Vacancy Overview -->
      <div class="grid gap-6 md:grid-cols-2">
        <app-card class="col-span-1">
          <app-card-header>
            <app-card-title class="text-lg">Open Vacancies</app-card-title>
          </app-card-header>
          <app-card-content class="p-0">
              <div class="divide-y divide-border">
                <div *ngIf="loading" class="p-8 text-center text-muted-foreground italic text-sm">Loading vacancies...</div>
                <div *ngIf="!loading && vacancies.length === 0" class="p-8 text-center text-muted-foreground italic text-sm">No active vacancies.</div>
                <div *ngFor="let job of vacancies" class="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded bg-muted flex items-center justify-center">
                       <lucide-icon name="briefcase" size="18" class="text-muted-foreground"></lucide-icon>
                    </div>
                    <div>
                      <p class="font-medium text-sm">{{ job.title }}</p>
                      <p class="text-xs text-muted-foreground">{{ job.department?.name || 'General' }} &bull; {{ job._count?.applications || 0 }} Candidates</p>
                    </div>
                  </div>
                  <span 
                    class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
                    [ngClass]="{
                      'border-green-500 text-green-500': job.status === 'OPEN',
                      'border-yellow-500 text-yellow-500': job.status === 'DRAFT',
                      'border-red-500 text-red-500': job.status === 'CLOSED'
                    }"
                  >
                    {{ job.status }}
                  </span>
                </div>
              </div>
          </app-card-content>
        </app-card>

        <!-- Pipeline Stats -->
        <app-card>
          <app-card-header>
            <app-card-title class="text-lg">Candidate Pipeline</app-card-title>
          </app-card-header>
          <app-card-content>
             <div class="grid grid-cols-2 gap-4">
                <div class="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p class="text-xs text-muted-foreground font-medium uppercase">Screening</p>
                  <p class="text-2xl font-bold mt-1">42</p>
                </div>
                <div class="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <p class="text-xs text-muted-foreground font-medium uppercase">Interview</p>
                  <p class="text-2xl font-bold mt-1">18</p>
                </div>
                <div class="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <p class="text-xs text-muted-foreground font-medium uppercase">Offer</p>
                  <p class="text-2xl font-bold mt-1">5</p>
                </div>
                <div class="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                  <p class="text-xs text-muted-foreground font-medium uppercase">Hired</p>
                  <p class="text-2xl font-bold mt-1">12</p>
                </div>
             </div>
          </app-card-content>
        </app-card>
      </div>

      <!-- Recent Applicants -->
      <app-card>
        <app-card-header>
          <app-card-title class="text-lg">Recent Applicants</app-card-title>
        </app-card-header>
        <app-card-content class="p-0">
           <table class="w-full text-sm">
              <tr *ngFor="let candidate of recentCandidates" class="border-b border-border hover:bg-muted/30 transition-colors">
                 <td class="p-4 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{{ candidate.name[0] }}</div>
                    <div>
                      <p class="font-medium">{{ candidate.name }}</p>
                      <p class="text-xs text-muted-foreground">{{ candidate.role }}</p>
                    </div>
                 </td>
                 <td class="p-4 text-muted-foreground text-xs">{{ candidate.date }}</td>
                 <td class="p-4 text-right">
                    <app-button variant="ghost" size="sm">Review</app-button>
                 </td>
              </tr>
           </table>
        </app-card-content>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruitmentDashboardComponent implements OnInit {
  private recruitmentService = inject(RecruitmentService);

  vacancies: any[] = [];
  recentCandidates: any[] = [];
  loading = true;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    this.recruitmentService.getJobs().subscribe({
      next: (res: any) => {
        this.vacancies = res.data || [];
        // For recent candidates, we would ideally have a separate endpoint or flatten from jobs
        // This is a simplified integration for now
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
