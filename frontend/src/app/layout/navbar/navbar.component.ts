import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { LucideAngularModule, Bell, Search, User, LogOut, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header class="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <!-- Left side: Breadcrumbs or Page Title (can be dynamic) -->
      <div class="flex items-center gap-4">
        <h1 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Enterprise HR</h1>
      </div>

      <!-- Right side: Search, Notifications, User -->
      <div class="flex items-center space-x-4">
        <!-- Search Bar (Minimal) -->
        <div class="relative hidden md:block">
          <lucide-icon name="search" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></lucide-icon>
          <input 
            type="text" 
            placeholder="Search anything..." 
            class="pl-10 pr-4 py-1.5 rounded-full bg-muted border-none text-sm focus:ring-1 focus:ring-primary w-64 transition-all"
          >
        </div>

        <!-- Notifications -->
        <button class="p-2 rounded-full hover:bg-muted relative transition-colors text-muted-foreground hover:text-foreground">
          <lucide-icon name="bell" size="20"></lucide-icon>
          <span class="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
        </button>

        <div class="h-6 w-px bg-border mx-2"></div>

        <!-- User Profile Dropdown -->
        <div class="flex items-center space-x-3 group cursor-pointer relative" (click)="toggleDropdown()">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-medium leading-none">{{ (user$ | async)?.email }}</p>
            <p class="text-xs text-muted-foreground mt-1">Administrator</p>
          </div>
          <div class="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
             <span>{{ (user$ | async)?.email?.[0]?.toUpperCase() }}</span>
          </div>
          <lucide-icon name="chevron-down" size="14" class="text-muted-foreground group-hover:text-foreground transition-colors"></lucide-icon>

          <!-- Dropdown Menu (Simplified for now) -->
          <div *ngIf="isDropdownOpen" class="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
            <button class="flex items-center w-full px-4 py-2 text-sm hover:bg-muted transition-colors">
              <lucide-icon name="user" size="16" class="mr-2"></lucide-icon> Profile
            </button>
            <button (click)="logout()" class="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <lucide-icon name="log-out" size="16" class="mr-2"></lucide-icon> Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private authService = inject(AuthService);
  user$ = this.authService.currentUser$;
  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.authService.logout();
  }
}
