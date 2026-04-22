import { Component, inject, ChangeDetectionStrategy, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { take } from 'rxjs';

@Component({
    selector: 'app-navbar',
    imports: [CommonModule, RouterLink, LucideAngularModule],
    template: `
    <header class="h-16 border-b border-border/30 bg-card/70 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
      <!-- Left side: Breadcrumbs or Page Title -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <h1 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Enterprise HR</h1>
        </div>
      </div>
    
      <!-- Right side: Search, Notifications, User -->
      <div class="flex items-center space-x-3">
        <!-- Search Bar -->
        <div class="relative hidden md:block">
          <lucide-icon name="search" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60"></lucide-icon>
          <input
            type="text"
            #searchInput
            (keyup.enter)="onSearch(searchInput.value)"
            placeholder="Buscar empleados, departamentos..."
            class="pl-10 pr-4 py-2 rounded-xl bg-muted/50 border border-border/30 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:bg-card w-72 transition-all placeholder:text-muted-foreground/50"
            >
        </div>
    
        <!-- Notifications -->
        <button
          routerLink="/notifications"
          class="relative p-2.5 rounded-xl hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground group">
          <lucide-icon name="bell" size="19"></lucide-icon>
          @if ((unreadCount$ | async) ?? 0 > 0) {
            <span
              class="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-rose-500 text-[10px] font-bold text-white rounded-full border-2 border-card flex items-center justify-center shadow-sm">
              {{ ((unreadCount$ | async) ?? 0) > 99 ? '99+' : (unreadCount$ | async) }}
            </span>
          }
        </button>
    
        <div class="h-7 w-px bg-border/40 mx-1"></div>
    
        <!-- User Profile -->
        <div class="flex items-center space-x-3 group cursor-pointer relative" (click)="toggleDropdown()">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold leading-none">{{ (user$ | async)?.email }}</p>
            <p class="text-[11px] text-muted-foreground mt-0.5">Administrador</p>
          </div>
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden transition-all group-hover:shadow-md group-hover:shadow-primary/10">
            <span>{{ (user$ | async)?.email?.[0]?.toUpperCase() }}</span>
          </div>
          <lucide-icon name="chevron-down" size="14" class="text-muted-foreground group-hover:text-foreground transition-transform duration-200"
            [class.rotate-180]="isDropdownOpen"
          ></lucide-icon>
    
          <!-- Dropdown Menu -->
          @if (isDropdownOpen) {
            <div
              class="absolute right-0 top-full mt-2 w-52 bg-popover/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl py-1.5 z-50 animate-slideDown"
              >
              <div class="px-4 py-2.5 border-b border-border/30">
                <p class="text-sm font-semibold">{{ (user$ | async)?.email }}</p>
                <p class="text-[11px] text-muted-foreground">Administrador del Sistema</p>
              </div>
              <button (click)="goToProfile()" class="flex items-center w-full px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors">
                <lucide-icon name="user" size="16" class="mr-3 text-muted-foreground"></lucide-icon> Mi Perfil
              </button>
              <button routerLink="/settings" class="flex items-center w-full px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors">
                <lucide-icon name="settings" size="16" class="mr-3 text-muted-foreground"></lucide-icon> Configuración
              </button>
              <div class="border-t border-border/30 mt-1 pt-1">
                <button (click)="logout()" class="flex items-center w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-b-xl">
                  <lucide-icon name="log-out" size="16" class="mr-3"></lucide-icon> Cerrar Sesión
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
    `,
    styles: [`
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slideDown {
      animation: slideDown 0.15s ease-out forwards;
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  user$ = this.authService.currentUser$;
  unreadCount$ = this.notificationService.unreadCount$;
  isDropdownOpen = false;

  ngOnInit() {
    this.notificationService.refreshUnreadCount();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.group')) {
      this.isDropdownOpen = false;
    }
  }

  goToProfile() {
    this.user$.pipe(take(1)).subscribe(user => {
      if (user?.employee?.id) {
        this.router.navigate(['/employees', user.employee.id]);
      } else {
        // Fallback if no employee record is linked
        this.router.navigate(['/employees']);
      }
    });
  }

  onSearch(query: string) {
    if (!query.trim()) return;
    this.router.navigate(['/employees'], { queryParams: { search: query } });
  }

  logout() {
    this.authService.logout();
  }
}
