import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
          Configuración del Sistema
        </h1>
        <p class="text-muted-foreground mt-1">Personaliza tu experiencia y gestiona las preferencias de tu cuenta.</p>
      </div>

      <div class="grid gap-6">
        <!-- Appearance Section -->
        <section class="p-6 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-xl bg-primary/10 text-primary">
              <lucide-icon name="palette" size="20"></lucide-icon>
            </div>
            <div>
              <h2 class="text-lg font-bold">Apariencia</h2>
              <p class="text-xs text-muted-foreground">Personaliza el aspecto visual de la plataforma.</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/20">
              <div>
                <p class="text-sm font-semibold">Modo Oscuro</p>
                <p class="text-xs text-muted-foreground">Alternar entre el tema claro y oscuro.</p>
              </div>
              <button class="w-12 h-6 rounded-full bg-primary relative transition-all duration-300">
                <div class="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm"></div>
              </button>
            </div>

            <div class="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/20">
              <div>
                <p class="text-sm font-semibold">Intensidad Glassmorphism</p>
                <p class="text-xs text-muted-foreground">Ajusta el nivel de desenfoque de los paneles.</p>
              </div>
              <input type="range" class="w-32 accent-primary" min="0" max="100" value="70">
            </div>
          </div>
        </section>

        <!-- Notifications Section -->
        <section class="p-6 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <lucide-icon name="bell" size="20"></lucide-icon>
            </div>
            <div>
              <h2 class="text-lg font-bold">Notificaciones</h2>
              <p class="text-xs text-muted-foreground">Gestiona cómo y cuándo recibes alertas.</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-3">
              <p class="text-sm font-medium">Correos de nómina procesada</p>
              <input type="checkbox" checked class="w-5 h-5 rounded-md accent-primary">
            </div>
            <div class="flex items-center justify-between p-3">
              <p class="text-sm font-medium">Alertas de cumpleaños</p>
              <input type="checkbox" checked class="w-5 h-5 rounded-md accent-primary">
            </div>
            <div class="flex items-center justify-between p-3">
              <p class="text-sm font-medium">Solicitudes de permisos pendientes</p>
              <input type="checkbox" class="w-5 h-5 rounded-md accent-primary">
            </div>
          </div>
        </section>

        <!-- Security Section -->
        <section class="p-6 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <lucide-icon name="shield-check" size="20"></lucide-icon>
            </div>
            <div>
              <h2 class="text-lg font-bold">Seguridad</h2>
              <p class="text-xs text-muted-foreground">Protege tu cuenta con medidas adicionales.</p>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/20">
            <div>
              <p class="text-sm font-semibold">Autenticación de Dos Factores (2FA)</p>
              <p class="text-xs text-muted-foreground">Añade una capa extra de seguridad usando TOTP.</p>
            </div>
            <button class="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-bold hover:bg-rose-500/20 transition-all">
              Configurar
            </button>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {}
