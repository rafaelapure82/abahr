import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, Mail, Phone, MapPin, Briefcase, Calendar, ChevronLeft, Edit, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    LucideAngularModule
  ],
  template: `
    <div class="space-y-6" *ngIf="employee">
      <!-- Header / Back -->
      <div class="flex items-center justify-between">
        <a routerLink="/employees" class="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <lucide-icon name="chevron-left" size="16" class="mr-1"></lucide-icon> Back to Directory
        </a>
        <div class="flex gap-2">
          <app-button variant="outline" size="sm">
            <lucide-icon name="edit" size="16" class="mr-2"></lucide-icon> Edit Profile
          </app-button>
          <app-button variant="destructive" size="sm">
            <lucide-icon name="trash2" size="16" class="mr-2"></lucide-icon> Terminate
          </app-button>
        </div>
      </div>

      <!-- Profile Overview Card -->
      <app-card class="border-none shadow-xl overflow-hidden">
        <div class="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative"></div>
        <app-card-content class="relative -mt-12 pb-8">
           <div class="flex flex-col md:flex-row items-end gap-6 px-4">
              <div class="w-32 h-32 rounded-2xl bg-card border-4 border-card shadow-lg flex items-center justify-center text-4xl font-bold text-primary uppercase">
                {{ employee.firstName[0] }}{{ employee.lastName[0] }}
              </div>
              <div class="flex-1 mb-2">
                <h2 class="text-3xl font-bold">{{ employee.firstName }} {{ employee.lastName }}</h2>
                <div class="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                  <span class="flex items-center gap-1.5">
                    <lucide-icon name="briefcase" size="16"></lucide-icon> {{ employee.jobTitle }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <lucide-icon name="map-pin" size="16"></lucide-icon> {{ employee.department?.name || 'Unassigned' }}
                  </span>
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {{ employee.status }}
                  </span>
                </div>
              </div>
           </div>
        </app-card-content>
      </app-card>

      <div class="grid gap-6 md:grid-cols-3">
        <!-- Contact Information -->
        <app-card class="md:col-span-1">
          <app-card-header>
            <app-card-title class="text-lg">Contact Details</app-card-title>
          </app-card-header>
          <app-card-content class="space-y-4">
            <div class="flex items-center gap-3">
               <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                 <lucide-icon name="mail" size="16" class="text-muted-foreground"></lucide-icon>
               </div>
               <div>
                 <p class="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                 <p class="text-sm font-medium">{{ employee.email }}</p>
               </div>
            </div>
            <div class="flex items-center gap-3">
               <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                 <lucide-icon name="phone" size="16" class="text-muted-foreground"></lucide-icon>
               </div>
               <div>
                 <p class="text-xs text-muted-foreground uppercase font-semibold">Phone</p>
                 <p class="text-sm font-medium">{{ employee.phoneNumber || 'Not provided' }}</p>
               </div>
            </div>
          </app-card-content>
        </app-card>

        <!-- Employment Information -->
        <app-card class="md:col-span-2">
          <app-card-header>
            <app-card-title class="text-lg">Employment Information</app-card-title>
          </app-card-header>
          <app-card-content class="grid gap-6 md:grid-cols-2">
            <div>
              <p class="text-xs text-muted-foreground uppercase font-semibold">Employee ID</p>
              <p class="text-lg font-bold text-primary mt-1">{{ employee.employeeCode }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground uppercase font-semibold">Hire Date</p>
              <p class="text-sm font-medium mt-1">{{ employee.hireDate | date:'longDate' }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground uppercase font-semibold">Reporting To</p>
              <p class="text-sm font-medium mt-1">{{ employee.manager ? employee.manager.firstName + ' ' + employee.manager.lastName : 'No Manager' }}</p>
            </div>
          </app-card-content>
        </app-card>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!employee && loading" class="flex items-center justify-center min-h-[400px]">
       <div class="text-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p class="text-muted-foreground italic">Fetching profile details...</p>
       </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  
  employee: Employee | null = null;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchDetails(id);
    }
  }

  fetchDetails(id: string) {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (res) => {
        // Backend returns { data: Employee }
        this.employee = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching employee details:', err);
        this.loading = false;
      }
    });
  }
}
