import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, UserPlus, Filter, MoreHorizontal } from 'lucide-angular';

@Component({
  selector: 'app-employee-list',
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
          <h2 class="text-3xl font-bold tracking-tight">Employees</h2>
          <p class="text-muted-foreground">Manage your organization's workforce.</p>
        </div>
        <div class="flex gap-2">
           <app-button variant="outline">
            <lucide-icon name="filter" size="18" class="mr-2"></lucide-icon> Filter
          </app-button>
          <app-button variant="primary">
            <lucide-icon name="user-plus" size="18" class="mr-2"></lucide-icon> Add Employee
          </app-button>
        </div>
      </div>

      <app-card>
        <app-card-content class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/50">
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Position</th>
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
                  <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th class="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="loading" class="border-b border-border">
                  <td colspan="5" class="p-8 text-center text-muted-foreground italic">Loading employees...</td>
                </tr>
                <tr *ngIf="!loading && employees.length === 0" class="border-b border-border">
                   <td colspan="5" class="p-8 text-center text-muted-foreground italic">No employees found.</td>
                </tr>
                <tr *ngFor="let emp of employees" class="border-b border-border hover:bg-muted/30 transition-colors">
                  <td class="p-4 align-middle">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                        {{ emp.firstName[0] }}{{ emp.lastName[0] }}
                      </div>
                      <div>
                        <p class="font-medium">{{ emp.firstName }} {{ emp.lastName }}</p>
                        <p class="text-xs text-muted-foreground">{{ emp.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 align-middle">{{ emp.jobTitle }}</td>
                  <td class="p-4 align-middle">{{ emp.department?.name || 'Unassigned' }}</td>
                  <td class="p-4 align-middle">
                    <span 
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      [ngClass]="{
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': emp.status === 'ACTIVE',
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': emp.status === 'ONBOARDING'
                      }"
                    >
                      {{ emp.status }}
                    </span>
                  </td>
                  <td class="p-4 align-middle text-right">
                    <app-button variant="ghost" size="icon">
                      <lucide-icon name="more-horizontal" size="18"></lucide-icon>
                    </app-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </app-card-content>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  employees: Employee[] = [];
  loading = true;

  ngOnInit() {
    this.fetchEmployees();
  }

  fetchEmployees() {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (res) => {
        // Backend returns { data: Employee[], total, page, limit }
        this.employees = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.loading = false;
      }
    });
  }
}
