import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-login',
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
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <!-- Background Decorations -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-blob"></div>
        <div class="absolute bottom-[-20%] right-[-15%] w-[45%] h-[45%] bg-emerald-500/15 blur-[150px] rounded-full animate-blob animation-delay-2000"></div>
        <div class="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[120px] rounded-full animate-blob animation-delay-4000"></div>
        <!-- Grid pattern overlay -->
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMGI0NmMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDEwdjJIMzZWMzZ6TTAgMzRoMTB2MkgwVjM2ek0xOCAxN2gxMHYySDE4VjE5ek0wIDE3aDEwdjJIMFYxOXoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      </div>

      <div class="w-full max-w-md relative z-10 animate-fadeUp">
        <!-- Logo & Title -->
        <div class="flex flex-col items-center mb-8">
           <div class="w-14 h-14 bg-gradient-to-br from-primary to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/30 mb-5 ring-2 ring-white/10">
             <span class="text-xl font-black">A</span>
           </div>
           <h1 class="text-3xl font-extrabold tracking-tight text-white">ABA Talent</h1>
           <p class="text-slate-400 mt-2 text-sm">Sistema de Gestión de Capital Humano</p>
        </div>

        <!-- Login Card -->
        <div class="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-2xl shadow-black/20 p-8">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-300">Correo Electrónico</label>
              <div class="relative">
                <lucide-icon name="mail" size="17" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></lucide-icon>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="admin@abatalent.com"
                  class="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] px-10 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                >
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-slate-300">Contraseña</label>
                <a href="#" class="text-xs text-primary hover:text-primary/80 transition-colors">¿Olvidaste tu contraseña?</a>
              </div>
              <div class="relative">
                <lucide-icon name="lock" size="17" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"></lucide-icon>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] px-10 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                >
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" size="17"></lucide-icon>
                </button>
              </div>
            </div>

            <!-- Error -->
            <div *ngIf="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
              <lucide-icon name="alert-circle" size="14"></lucide-icon>
              {{ error }}
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || loading"
              class="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <lucide-icon *ngIf="loading" name="loader-2" size="18" class="animate-spin"></lucide-icon>
              <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-white/10"></div>
            <span class="text-xs text-slate-500">credenciales de prueba</span>
            <div class="flex-1 h-px bg-white/10"></div>
          </div>

          <!-- Demo Credentials -->
          <button
            type="button"
            (click)="fillDemoCredentials()"
            class="w-full py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
          >
            <lucide-icon name="zap" size="14" class="text-primary"></lucide-icon>
            admin&#64;abatalent.com / Admin&#64;123!
          </button>
        </div>

        <p class="text-center mt-6 text-sm text-slate-500">
          ¿Necesitas ayuda? <a href="#" class="text-primary font-medium hover:underline">Contacta a Soporte</a>
        </p>
      </div>
    </div>
  `,
    styles: [`
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    .animate-fadeUp {
      animation: fadeUp 0.6s ease-out forwards;
    }

    .animate-blob {
      animation: blob 8s infinite ease-in-out;
    }

    .animation-delay-2000 {
      animation-delay: 2s;
    }

    .animation-delay-4000 {
      animation-delay: 4s;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  showPassword = false;
  error: string | null = null;

  fillDemoCredentials() {
    this.loginForm.setValue({
      email: 'admin@abatalent.com',
      password: 'Admin@123!'
    });
    this.cdr.detectChanges();
  }

  onSubmit() {
    if (this.loginForm.invalid || this.loading) return;

    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 429) {
          this.error = 'Demasiados intentos. Por seguridad, por favor espera un minuto antes de intentar de nuevo.';
        } else {
          this.error = err?.error?.error?.message || 'Correo o contraseña incorrectos. Por favor, intenta de nuevo.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
