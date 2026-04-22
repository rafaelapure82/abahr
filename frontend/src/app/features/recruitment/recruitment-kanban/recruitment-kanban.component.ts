import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecruitmentService } from '../../../core/services/recruitment.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { map } from 'rxjs/operators';

interface KanbanColumn {
  id: string;
  name: string;
  status: string[];
  items: any[];
}

@Component({
  selector: 'app-recruitment-kanban',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    LucideAngularModule,
    DragDropModule
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Tablero Kanban</h2>
          <p class="text-muted-foreground">Gestiona el flujo de candidatos visualmente.</p>
        </div>
        <div class="flex gap-2">
           <app-button variant="outline" routerLink="/recruitment">
             <lucide-icon name="layout-dashboard" size="16" class="mr-2"></lucide-icon> Vista General
           </app-button>
        </div>
      </div>

      <!-- Job Filter (Future) -->
      
      <!-- Kanban Board -->
      <div class="flex gap-6 overflow-x-auto pb-4 min-h-[600px]" cdkDropListGroup>
        <div *ngFor="let col of columns" class="flex-shrink-0 w-80 flex flex-col gap-4">
          <div class="flex items-center justify-between px-2">
             <h3 class="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{{ col.name }}</h3>
             <span class="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{{ col.items.length }}</span>
          </div>

          <div
            cdkDropList
            [cdkDropListData]="col.items"
            (cdkDropListDropped)="drop($event)"
            class="flex-1 bg-muted/30 rounded-xl p-3 border-2 border-dashed border-transparent hover:border-primary/20 transition-colors min-h-[500px] space-y-3"
          >
            <div
              *ngFor="let app of col.items"
              cdkDrag
              class="bg-card p-4 rounded-lg border border-border shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all group"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {{ app.candidate?.firstName?.[0] }}{{ app.candidate?.lastName?.[0] }}
                </div>
                <button class="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-muted-foreground transition-opacity">
                   <lucide-icon name="more-vertical" size="14"></lucide-icon>
                </button>
              </div>
              
              <h4 class="font-medium text-sm">{{ app.candidate?.firstName }} {{ app.candidate?.lastName }}</h4>
              <p class="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">{{ app.job?.title }}</p>
              
              <div class="mt-4 flex items-center justify-between">
                 <div class="flex -space-x-2">
                    <div class="w-5 h-5 rounded-full border-2 border-card bg-muted text-[8px] flex items-center justify-center">?</div>
                 </div>
                 <span class="text-[9px] text-muted-foreground flex items-center gap-1">
                    <lucide-icon name="clock" size="10"></lucide-icon>
                    {{ app.appliedAt | date:'d MMM' }}
                 </span>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="col.items.length === 0" class="flex flex-col items-center justify-center h-32 text-muted-foreground/40 italic text-xs">
               Sin candidatos
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .flex-1.cdk-drop-list-dragging .bg-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruitmentKanbanComponent implements OnInit {
  private recruitmentService = inject(RecruitmentService);
  private cdr = inject(ChangeDetectorRef);

  columns: KanbanColumn[] = [
    { id: 'col-applied', name: 'Nuevos', status: ['APPLIED'], items: [] },
    { id: 'col-screening', name: 'Preselección', status: ['SCREENING'], items: [] },
    { id: 'col-interview', name: 'Entrevistas', status: ['TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'MANAGEMENT_INTERVIEW'], items: [] },
    { id: 'col-offer', name: 'Oferta', status: ['OFFER_EXTENDED'], items: [] },
    { id: 'col-final', name: 'Hired/Accepted', status: ['OFFER_ACCEPTED', 'HIRED'], items: [] }
  ];

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    // For now, load all applications. In a real app, we filter by Job.
    this.recruitmentService.getJobs().subscribe({
      next: (res: any) => {
        const jobs = res.data || [];
        const allApps: any[] = [];
        
        // Flatten applications from all jobs
        jobs.forEach((job: any) => {
          this.recruitmentService.getJobApplications(job.id).subscribe((appRes: any) => {
            const apps = (appRes || []).map((a: any) => ({ ...a, job }));
            this.distributeApplications(apps);
            this.cdr.markForCheck();
          });
        });
      }
    });
  }

  distributeApplications(apps: any[]) {
    // Clear current items
    this.columns.forEach(col => {
      // Avoid duplicate apps if loadApplications is called multiple times
      apps.forEach(app => {
        if (col.status.includes(app.status)) {
          if (!col.items.find(i => i.id === app.id)) {
            col.items.push(app);
          }
        }
      });
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const application = event.previousContainer.data[event.previousIndex];
      const targetColumn = this.columns.find(c => c.items === event.container.data);
      
      if (targetColumn) {
        // Update on backend
        const newStatus = targetColumn.status[0]; // Take first status of column as representative
        this.recruitmentService.moveCandidate(application.id, { status: newStatus }).subscribe({
          next: () => {
            transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              event.previousIndex,
              event.currentIndex
            );
            application.status = newStatus;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error moving candidate', err);
            // Optional: toast error
          }
        });
      }
    }
  }
}
