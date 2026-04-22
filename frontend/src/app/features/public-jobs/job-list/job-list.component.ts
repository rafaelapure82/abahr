import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecruitmentService } from '../../../core/services/recruitment.service';
import { LucideAngularModule } from 'lucide-angular';
import { CardComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
    selector: 'app-job-list',
    imports: [CommonModule, RouterLink, LucideAngularModule, ButtonComponent],
    template: `
    <div class="min-h-screen bg-muted/30 pb-12">
      <!-- Hero -->
      <div class="bg-primary text-primary-foreground py-20 px-6 text-center">
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">Únete a nuestro equipo</h1>
        <p class="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          Estamos buscando personas talentosas para ayudarnos a construir el futuro de ABA Talent.
          Explora nuestras vacantes y postúlate hoy.
        </p>
      </div>
    
      <div class="max-w-5xl mx-auto px-6 -mt-10">
        <!-- Search & Filter (Static for now) -->
        <div class="bg-card rounded-xl border border-border shadow-lg p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div class="flex-1 w-full relative">
            <lucide-icon name="search" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
            <input type="text" placeholder="Buscar puestos..." class="w-full h-11 bg-muted/50 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
          </div>
          <select class="h-11 bg-muted/50 rounded-lg px-4 text-sm focus:outline-none md:w-48">
            <option value="">Todos los Deptos</option>
          </select>
          <app-button variant="primary" class="w-full md:w-auto h-11 px-8">Buscar</app-button>
        </div>
    
        <!-- Job Grid -->
        <div class="grid gap-6">
          @if (loading) {
            <div class="text-center p-12">
              <div class="animate-spin h-8 w-8 rounded-full border-b-2 border-primary mx-auto"></div>
              <p class="mt-4 text-muted-foreground">Cargando oportunidades...</p>
            </div>
          }
    
          @if (!loading && jobs.length === 0) {
            <div class="text-center p-20 bg-card rounded-2xl border border-dashed border-border">
              <lucide-icon name="briefcase" size="40" class="mx-auto text-muted-foreground/30 mb-4"></lucide-icon>
              <h3 class="text-lg font-semibold">No hay vacantes abiertas</h3>
              <p class="text-muted-foreground mt-1">Vuelve pronto para ver nuevas oportunidades.</p>
            </div>
          }
    
          @for (job of jobs; track job) {
            <div class="group bg-card hover:bg-muted/10 border border-border hover:border-primary/30 rounded-2xl p-6 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {{ job.department?.name || 'General' }}
                  </span>
                  @if (job.isRemote) {
                    <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
                      Remoto
                    </span>
                  }
                </div>
                <h3 class="text-xl font-bold group-hover:text-primary transition-colors">{{ job.title }}</h3>
                <div class="flex flex-wrap gap-4 mt-2">
                  <span class="text-sm text-muted-foreground flex items-center gap-1.5">
                    <lucide-icon name="map-pin" size="14"></lucide-icon>
                    {{ job.location || 'Remote / Online' }}
                  </span>
                  <span class="text-sm text-muted-foreground flex items-center gap-1.5">
                    <lucide-icon name="clock" size="14"></lucide-icon>
                    {{ job.employmentType }}
                  </span>
                  @if (job.salaryMin) {
                    <span class="text-sm text-muted-foreground flex items-center gap-1.5">
                      <lucide-icon name="dollar-sign" size="14"></lucide-icon>
                      {{ job.salaryMin | currency:job.currency:'symbol':'1.0-0' }} - {{ job.salaryMax | currency:job.currency:'symbol':'1.0-0' }}
                    </span>
                  }
                </div>
              </div>
              <app-button variant="outline" [routerLink]="[job.id, 'apply']" class="md:px-10 h-12 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                Postularse <lucide-icon name="arrow-right" size="16" class="ml-2"></lucide-icon>
              </app-button>
            </div>
          }
        </div>
      </div>
    
      <!-- Footer -->
      <div class="mt-20 text-center text-muted-foreground text-sm">
        <p>&copy; 2026 ABA Talent Management. Todos los derechos reservados.</p>
      </div>
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobListComponent implements OnInit {
  private recruitmentService = inject(RecruitmentService);
  
  jobs: any[] = [];
  loading = true;

  ngOnInit() {
    this.recruitmentService.getJobs().subscribe({
      next: (res: any) => {
        // Only show OPEN jobs
        this.jobs = (res.data || []).filter((j: any) => j.status === 'OPEN');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
