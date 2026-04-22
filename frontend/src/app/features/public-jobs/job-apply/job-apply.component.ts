import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RecruitmentService } from '../../../core/services/recruitment.service';
import { LucideAngularModule } from 'lucide-angular';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-job-apply',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, LucideAngularModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent],
  template: `
    <div class="min-h-screen bg-muted/30 pb-12 pt-8">
      <div class="max-w-2xl mx-auto px-6">
        <app-button variant="ghost" routerLink="/jobs" class="mb-6">
          <lucide-icon name="arrow-left" size="16" class="mr-2"></lucide-icon> Volver a vacantes
        </app-button>

        <div *ngIf="loadingJob" class="text-center p-12 bg-card rounded-2xl border border-border">
           <div class="animate-spin h-8 w-8 rounded-full border-b-2 border-primary mx-auto"></div>
           <p class="mt-4 text-muted-foreground">Cargando detalles del puesto...</p>
        </div>

        <div *ngIf="!loadingJob && job" class="space-y-6">
           <!-- Job Header -->
           <div class="bg-card border border-border rounded-2xl p-8">
              <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary mb-3 inline-block">
                 {{ job.department?.name || 'General' }}
              </span>
              <h1 class="text-3xl font-extrabold tracking-tight">{{ job.title }}</h1>
              <div class="flex gap-4 mt-4 text-muted-foreground text-sm">
                 <span class="flex items-center gap-1.5"><lucide-icon name="map-pin" size="14"></lucide-icon> {{ job.location }}</span>
                 <span class="flex items-center gap-1.5"><lucide-icon name="clock" size="14"></lucide-icon> {{ job.employmentType }}</span>
              </div>
           </div>

           <!-- Application Form -->
           <app-card>
              <app-card-header>
                 <app-card-title>Tu Postulación</app-card-title>
              </app-card-header>
              <app-card-content>
                 <form [formGroup]="applyForm" (ngSubmit)="onSubmit()" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div class="space-y-2">
                          <label class="text-sm font-medium">Nombre</label>
                          <input type="text" formControlName="firstName" placeholder="Juan" class="w-full h-11 bg-muted/30 border border-border rounded-lg px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                       </div>
                       <div class="space-y-2">
                          <label class="text-sm font-medium">Apellido</label>
                          <input type="text" formControlName="lastName" placeholder="Pérez" class="w-full h-11 bg-muted/30 border border-border rounded-lg px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                       </div>
                    </div>

                    <div class="space-y-2">
                       <label class="text-sm font-medium">Correo Electrónico</label>
                       <input type="email" formControlName="email" placeholder="juan@ejemplo.com" class="w-full h-11 bg-muted/30 border border-border rounded-lg px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    </div>

                    <div class="space-y-2">
                       <label class="text-sm font-medium">Teléfono</label>
                       <input type="tel" formControlName="phone" placeholder="+123456789" class="w-full h-11 bg-muted/30 border border-border rounded-lg px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    </div>

                    <div class="space-y-2">
                       <label class="text-sm font-medium">Carta de Presentación (Opcional)</label>
                       <textarea formControlName="coverLetter" rows="4" placeholder="Cuéntanos por qué eres el candidato ideal..." class="w-full bg-muted/30 border border-border rounded-lg p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
                    </div>

                    <div class="space-y-2">
                       <label class="text-sm font-medium">CV / Hoja de Vida (PDF)</label>
                       <div class="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer relative">
                          <lucide-icon name="upload-cloud" size="32" class="mx-auto text-muted-foreground/40 mb-2"></lucide-icon>
                          <p class="text-sm text-muted-foreground">Arrastra tu archivo aquí o haz clic para subir</p>
                          <input type="file" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx" class="absolute inset-0 opacity-0 cursor-pointer">
                       </div>
                       <div *ngIf="selectedFile" class="flex items-center gap-2 p-2 bg-primary/5 rounded border border-primary/20 text-xs text-primary">
                          <lucide-icon name="file-text" size="14"></lucide-icon>
                          {{ selectedFile.name }}
                       </div>
                    </div>

                    <div *ngIf="success" class="p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-sm flex items-center gap-3">
                       <lucide-icon name="check-circle" size="18"></lucide-icon>
                       ¡Postulación enviada con éxito! Te contactaremos pronto.
                    </div>

                    <div *ngIf="error" class="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm">
                       {{ error }}
                    </div>

                    <app-button type="submit" variant="primary" class="w-full h-12" [disabled]="submitting || !applyForm.valid">
                       {{ submitting ? 'Enviando...' : 'Enviar Postulación' }}
                    </app-button>
                 </form>
              </app-card-content>
           </app-card>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobApplyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private recruitmentService = inject(RecruitmentService);

  jobId = this.route.snapshot.params['id'];
  job: any;
  loadingJob = true;
  submitting = false;
  success = false;
  error: string | null = null;
  selectedFile: File | null = null;

  applyForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    coverLetter: ['']
  });

  ngOnInit() {
    this.recruitmentService.getJobById(this.jobId).subscribe({
      next: (res) => {
        this.job = res;
        this.loadingJob = false;
      },
      error: () => {
        this.loadingJob = false;
        this.error = 'No se pudo cargar la información del puesto.';
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.applyForm.invalid) return;

    this.submitting = true;
    this.error = null;

    const dto = {
      jobId: this.jobId,
      candidate: {
        firstName: this.applyForm.value.firstName,
        lastName: this.applyForm.value.lastName,
        email: this.applyForm.value.email,
        phone: this.applyForm.value.phone,
        source: 'CAREER_SITE'
      },
      coverLetter: this.applyForm.value.coverLetter
    };

    this.recruitmentService.applyToJob(dto).subscribe({
      next: (app) => {
        if (this.selectedFile && app.candidateId) {
          this.recruitmentService.uploadResume(app.candidateId, this.selectedFile).subscribe({
            next: () => this.handleSuccess(),
            error: () => {
              // We still consider it a success but mention the file error
              this.error = 'Postulación enviada, pero hubo un error al subir el CV.';
              this.handleSuccess();
            }
          });
        } else {
          this.handleSuccess();
        }
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Error al enviar la postulación. Inténtalo de nuevo.';
      }
    });
  }

  private handleSuccess() {
    this.submitting = false;
    this.success = true;
    this.applyForm.reset();
    this.selectedFile = null;
  }
}
