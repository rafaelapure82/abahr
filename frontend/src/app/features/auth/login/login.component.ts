import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { LucideAngularModule, Lock, Mail, Eye, EyeOff, Briefcase } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ButtonComponent, 
    CardComponent, 
    CardHeaderComponent, 
    CardTitleComponent, 
    CardContentComponent,
    LucideAngularModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
      </div>

      <div class="w-full max-w-md relative z-10">
        <div class="flex flex-col items-center mb-8">
           <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 mb-4">
              <lucide-icon name="briefcase" size="24"></lucide-icon>
           </div>
           <h1 class="text-3xl font-extrabold tracking-tight">ABA Talent</h1>
           <p class="text-muted-foreground mt-2">Sign in to your HR account</p>
        </div>

        <app-card class="border-none shadow-2xl bg-card/80 backdrop-blur-sm">
          <app-card-content class="pt-8">
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Email -->
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Address</label>
                <div class="relative">
                  <lucide-icon name="mail" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
                  <input 
                    type="email" 
                    formControlName="email"
                    placeholder="name@company.com" 
                    class="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                </div>
              </div>

              <!-- Password -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium leading-none">Password</label>
                  <a href="#" class="text-xs text-primary hover:underline">Forgot password?</a>
                </div>
                <div class="relative">
                  <lucide-icon name="lock" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
                  <input 
                    [type]="showPassword ? 'text' : 'password'" 
                    formControlName="password"
                    placeholder="••••••••" 
                    class="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                  <button 
                    type="button"
                    (click)="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" size="18"></lucide-icon>
                  </button>
                </div>
              </div>

              <div *ngIf="error" class="p-3 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
                {{ error }}
              </div>

              <app-button 
                type="submit" 
                className="w-full mt-2"
                [loading]="loading"
                [disabled]="loginForm.invalid"
              >
                Sign In
              </app-button>
            </form>
          </app-card-content>
        </app-card>

        <p class="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account? <a href="#" class="text-primary font-medium hover:underline">Contact IT Support</a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  showPassword = false;
  error: string | null = null;

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = null;
    
    // For demo/mock purposes, if backend is not ready
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Invalid email or password. Please try again.';
        console.error(err);
      }
    });
  }
}
