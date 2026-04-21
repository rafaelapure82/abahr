import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService, EmployeeStats } from '../../core/services/employee.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LucideAngularModule, Users, FileText, Calendar, TrendingUp } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
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
          <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p class="text-muted-foreground">Welcome back, here's what's happening today.</p>
        </div>
        <app-button variant="primary">
          <lucide-icon name="trending-up" size="18" class="mr-2"></lucide-icon> View Reports
        </app-button>
      </div>

      <!-- Stats Grid -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <app-card>
          <app-card-header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <app-card-title class="text-sm font-medium">Total Employees</app-card-title>
            <lucide-icon name="users" size="16" class="text-muted-foreground"></lucide-icon>
          </app-card-header>
          <app-card-content>
            <div class="text-2xl font-bold">{{ stats?.total || 0 }}</div>
            <p class="text-xs text-muted-foreground">+{{ stats?.onboarding || 0 }} onboarding</p>
          </app-card-content>
        </app-card>

        <app-card>
          <app-card-header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <app-card-title class="text-sm font-medium">Departments</app-card-title>
            <lucide-icon name="file-text" size="16" class="text-muted-foreground"></lucide-icon>
          </app-card-header>
          <app-card-content>
            <div class="text-2xl font-bold">{{ stats?.departmentsCount || 0 }}</div>
            <p class="text-xs text-muted-foreground">Active in organization</p>
          </app-card-content>
        </app-card>

        <app-card>
          <app-card-header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <app-card-title class="text-sm font-medium">Leave Requests</app-card-title>
            <lucide-icon name="calendar" size="16" class="text-muted-foreground"></lucide-icon>
          </app-card-header>
          <app-card-content>
            <div class="text-2xl font-bold">24</div>
            <p class="text-xs text-muted-foreground">8 pending approval</p>
          </app-card-content>
        </app-card>

        <app-card>
          <app-card-header class="flex flex-row items-center justify-between space-y-0 pb-2">
            <app-card-title class="text-sm font-medium">Avg. Performance</app-card-title>
            <lucide-icon name="trending-up" size="16" class="text-muted-foreground"></lucide-icon>
          </app-card-header>
          <app-card-content>
            <div class="text-2xl font-bold">4.2 / 5</div>
            <p class="text-xs text-muted-foreground">Based on Q1 reviews</p>
          </app-card-content>
        </app-card>
      </div>

      <!-- More sections can be added here (e.g. Recent Activity, Upcoming Birthdays) -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <app-card class="col-span-4">
          <app-card-header>
            <app-card-title>Overview</app-card-title>
          </app-card-header>
          <app-card-content>
            <div class="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
              Chart Placeholder (Integrate ng-charts later)
            </div>
          </app-card-content>
        </app-card>

        <app-card class="col-span-3">
          <app-card-header>
            <app-card-title>Recent Activity</app-card-title>
          </app-card-header>
          <app-card-content>
            <div class="space-y-4">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-primary rounded-full mr-3"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium">New employee joined</p>
                  <p class="text-xs text-muted-foreground">Maria Garcia joined Marketing</p>
                </div>
                <span class="text-xs text-muted-foreground">2h ago</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-destructive rounded-full mr-3"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium">Leave request rejected</p>
                  <p class="text-xs text-muted-foreground">John Doe's request for May 5th</p>
                </div>
                <span class="text-xs text-muted-foreground">5h ago</span>
              </div>
            </div>
          </app-card-content>
        </app-card>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  stats: EmployeeStats | null = null;
  loading = true;

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.loading = true;
    this.employeeService.getStats().subscribe({
      next: (res: any) => {
        // Backend returns stats
        this.stats = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
