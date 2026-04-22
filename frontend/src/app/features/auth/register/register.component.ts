import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { LucideAngularModule, UserPlus, Mail, Lock, User, Briefcase, Building } from 'lucide-angular';

@Component({
    selector: 'app-register',
    imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    LucideAngularModule
],
    template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Create User</h2>
          <p class="text-muted-foreground">Register a new employee and system user.</p>
        </div>
      </div>

      <app-card class="max-w-4xl border-none shadow-lg">
        <app-card-header>
          <app-card-title>Account Information</app-card-title>
        </app-card-header>
        <app-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="grid gap-6 md:grid-cols-2">
            <!-- Email -->
            <div class="space-y-2">
              <label class="text-sm font-medium">Email Address</label>
              <div class="relative">
                <lucide-icon name="mail" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
                <input type="email" formControlName="email" placeholder="email@aba.com" class="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring">
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <label class="text-sm font-medium">Temporary Password</label>
              <div class="relative">
                <lucide-icon name="lock" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
                <input type="password" formControlName="password" placeholder="••••••••" class="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring">
              </div>
            </div>

            <div class="md:col-span-2 border-t border-border pt-4 mt-2">
              <h3 class="text-lg font-semibold mb-4">Employee Profile</h3>
            </div>

            <!-- First Name -->
            <div class="space-y-2">
              <label class="text-sm font-medium">First Name</label>
              <div class="relative">
                <lucide-icon name="user" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
                <input type="text" formControlName="firstName" placeholder="John" class="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring">
              </div>
            </div>

            <!-- Last Name -->
            <div class="space-y-2">
              <label class="text-sm font-medium">Last Name</label>
              <div class="relative">
                <lucide-icon name="user" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
                <input type="text" formControlName="lastName" placeholder="Doe" class="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring">
              </div>
            </div>

            <!-- Job Title -->
            <div class="space-y-2">
              <label class="text-sm font-medium">Job Title</label>
              <div class="relative">
                <lucide-icon name="briefcase" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
                <input type="text" formControlName="jobTitle" placeholder="HR Manager" class="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring">
              </div>
            </div>

            <!-- Role Selection -->
            <div class="space-y-2">
              <label class="text-sm font-medium">System Role</label>
              <select formControlName="roleName" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring">
                <option value="USER">Standard User</option>
                <option value="MANAGER">Manager</option>
                <option value="HR_ADMIN">HR Administrator</option>
              </select>
            </div>

            <div class="md:col-span-2 flex justify-end gap-4 mt-4">
              <app-button variant="outline" type="button">Cancel</app-button>
              <app-button type="submit" [loading]="loading" [disabled]="registerForm.invalid">
                <lucide-icon name="user-plus" size="18" class="mr-2"></lucide-icon> Create User
              </app-button>
            </div>
          </form>
        </app-card-content>
      </app-card>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = false;

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    jobTitle: ['', Validators.required],
    departmentId: [null], // This would normally be a dropdown from a service
    roleName: ['USER', Validators.required]
  });

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        // Reset or navigate
        this.registerForm.reset({ roleName: 'USER' });
        alert('User created successfully');
      },
      error: (err) => {
        this.loading = false;
        alert('Error creating user: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
