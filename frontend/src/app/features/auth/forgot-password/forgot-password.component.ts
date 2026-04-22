import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { LucideAngularModule, Mail, ArrowLeft, CheckCircle } from 'lucide-angular';

@Component({
    selector: 'app-forgot-password',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        ButtonComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardContentComponent,
        LucideAngularModule
    ],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div class="w-full max-w-md">
        <app-card class="border-none shadow-2xl">
          <app-card-header class="text-center">
            <div class="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
               <lucide-icon name="mail" size="24"></lucide-icon>
            </div>
            <app-card-title class="text-2xl font-bold">Forgot Password?</app-card-title>
            <p class="text-sm text-muted-foreground mt-2">
              No worries, we'll send you reset instructions.
            </p>
          </app-card-header>

          <app-card-content>
            <form *ngIf="!submitted" [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Email Address</label>
                <div class="relative">
                  <lucide-icon name="mail" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
                  <input 
                    type="email" 
                    formControlName="email"
                    placeholder="name@company.com" 
                    class="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                </div>
                <div *ngIf="forgotForm.get('email')?.touched && forgotForm.get('email')?.invalid" class="text-xs text-destructive">
                   Please enter a valid email address.
                </div>
              </div>

              <app-button type="submit" className="w-full" [loading]="loading" [disabled]="forgotForm.invalid">
                Reset Password
              </app-button>
            </form>

            <!-- Success State -->
            <div *ngIf="submitted" class="text-center py-4">
               <div class="flex flex-col items-center gap-4">
                  <lucide-icon name="check-circle" size="48" class="text-green-500"></lucide-icon>
                  <div>
                    <h3 class="font-bold">Check your email</h3>
                    <p class="text-sm text-muted-foreground">We've sent a password reset link to {{ forgotForm.value.email }}</p>
                  </div>
                  <app-button variant="outline" className="w-full mt-4" (click)="submitted = false">
                    Resend link
                  </app-button>
               </div>
            </div>

            <div class="mt-6 text-center">
              <a routerLink="/auth/login" class="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <lucide-icon name="arrow-left" size="14" class="mr-2"></lucide-icon>
                Back to log in
              </a>
            </div>
          </app-card-content>
        </app-card>
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = false;
  submitted = false;

  onSubmit() {
    if (this.forgotForm.invalid) return;
    
    this.loading = true;
    this.authService.forgotPassword(this.forgotForm.value.email!).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
      },
      error: () => {
        this.loading = false;
        // Even on error we might want to show success to prevent email enumeration
        this.submitted = true; 
      }
    });
  }
}
