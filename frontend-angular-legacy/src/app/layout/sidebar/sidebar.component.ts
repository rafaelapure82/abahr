import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-sidebar',
    imports: [
    RouterModule,
    LucideAngularModule
],
    template: `
    <aside
      class="fixed left-0 top-0 z-40 h-screen transition-all duration-500 bg-[#0f172a]/95 backdrop-blur-2xl border-r border-white/5"
      [class.w-72]="!isCollapsed"
      [class.w-24]="isCollapsed"
      >
      <!-- Logo Section -->
      <div class="flex items-center h-24 px-8 overflow-hidden whitespace-nowrap relative">
        <div class="flex items-center justify-center w-12 h-12 rounded-[18px] bg-indigo-600 shadow-xl shadow-indigo-600/30 text-white text-xl font-black shrink-0 relative z-10">
          A
        </div>
        @if (!isCollapsed) {
          <div class="ml-4 relative z-10">
            <span class="block font-black text-xl tracking-tight text-white leading-none">ABA Talent</span>
            <span class="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Enterprise HR</span>
          </div>
        }
        <!-- Decorative Glow -->
        <div class="absolute -top-10 -left-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>
    
      <!-- Navigation -->
      <nav class="p-4 space-y-1.5 overflow-y-auto h-[calc(100vh-12rem)] no-scrollbar">
        @for (item of navItems; track item; let i = $index) {
          <!-- Section Header -->
          @if (!isCollapsed && item.section) {
            <p class="px-4 pt-6 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {{ item.section }}
            </p>
          }
          <a
            [routerLink]="item.path"
            routerLinkActive="sidebar-active"
            [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
            class="flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative text-slate-400 hover:text-white hover:bg-white/5"
            [class.justify-center]="isCollapsed"
            [title]="isCollapsed ? item.label : ''"
            >
            <!-- Active Indicator Dot -->
            <div class="active-indicator absolute left-0 w-1.5 h-6 bg-indigo-500 rounded-r-full opacity-0 scale-y-0 transition-all duration-300"></div>
            <lucide-icon
              [name]="item.icon"
              size="20"
              class="icon transition-all duration-300 min-w-[20px] group-hover:scale-110"
            ></lucide-icon>
            @if (!isCollapsed) {
              <span class="ml-4 text-sm font-bold transition-all duration-300 whitespace-nowrap tracking-wide">
                {{ item.label }}
              </span>
            }
            <!-- Badge -->
            @if (!isCollapsed && item.badge) {
              <span class="ml-auto text-[9px] font-black px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-400 uppercase border border-indigo-500/20">
                {{ item.badge }}
              </span>
            }
            <!-- Tooltip for collapsed state -->
            @if (isCollapsed) {
              <div
                class="absolute left-20 px-4 py-2 rounded-xl bg-[#1e293b] text-white text-xs font-bold shadow-2xl opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none z-50 border border-white/5 whitespace-nowrap"
                >
                {{ item.label }}
              </div>
            }
          </a>
        }
      </nav>
    
      <!-- User Profile Mini Card / Collapse -->
      <div class="absolute bottom-0 w-full p-4 space-y-4">
        @if (!isCollapsed) {
          <div class="glass-panel p-4 rounded-3xl border border-white/5 bg-white/5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              JD
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white">John Doe</span>
              <span class="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Administrator</span>
            </div>
            <button class="ml-auto text-slate-500 hover:text-white transition-colors">
              <lucide-icon name="settings" size="16"></lucide-icon>
            </button>
          </div>
        }
    
        <button
          (click)="toggleCollapse()"
          class="flex items-center justify-center w-full h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-slate-500 hover:text-white"
          >
          <lucide-icon [name]="isCollapsed ? 'chevron-right' : 'chevron-left'" size="20"></lucide-icon>
          @if (!isCollapsed) {
            <span class="ml-3 text-sm font-black uppercase tracking-widest">Contraer</span>
          }
        </button>
      </div>
    </aside>
    `,
    styles: [`
    :host {
      display: block;
    }

    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    .glass-panel {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
    }

    :host ::ng-deep .sidebar-active {
      background: rgba(79, 70, 229, 0.1);
      color: white !important;
      border: 1px solid rgba(79, 70, 229, 0.2);
    }

    :host ::ng-deep .sidebar-active .icon {
      color: #818cf8;
      filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
    }

    :host ::ng-deep .sidebar-active .active-indicator {
      opacity: 1;
      scale-y: 1;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() isCollapsedChange = new EventEmitter<boolean>();

  navItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'Colaboradores', icon: 'users', path: '/employees' },
    { label: 'Estructura', icon: 'building-2', path: '/departments' },
    { section: 'Control de Tiempos', label: 'Asistencia', icon: 'clock', path: '/attendance' },
    { label: 'Permisos & Bajas', icon: 'calendar-days', path: '/leaves' },
    { section: 'Compensaciones', label: 'Gestión Nómina', icon: 'dollar-sign', path: '/payroll' },
    { label: 'Beneficios', icon: 'gift', path: '/benefits' },
    { section: 'Gestión de Talento', label: 'Recclutamiento', icon: 'briefcase', path: '/recruitment' },
    { label: 'Desempeño', icon: 'award', path: '/performance' },
    { label: 'Onboarding', icon: 'rocket', path: '/onboarding' },
    { section: 'Soporte', label: 'Notificaciones', icon: 'bell', path: '/notifications', badge: 'VIP' },
  ];

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed);
  }
}
