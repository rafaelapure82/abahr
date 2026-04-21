import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Users, Award, Gift, Search, Settings, ChevronLeft, ChevronRight, Briefcase } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <aside 
      class="fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-border bg-card"
      [class.w-64]="!isCollapsed"
      [class.w-20]="isCollapsed"
    >
      <!-- Logo Section -->
      <div class="flex items-center h-16 px-6 border-b border-border overflow-hidden whitespace-nowrap">
        <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
          <lucide-icon name="briefcase" size="18"></lucide-icon>
        </div>
        <span 
          class="ml-3 font-bold text-xl tracking-tight transition-opacity duration-200"
          [class.opacity-0]="isCollapsed"
          [class.pointer-events-none]="isCollapsed"
        >
          ABA Talent
        </span>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
        <ng-container *ngFor="let item of navItems">
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary/10 text-primary"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            class="flex items-center px-3 py-2 rounded-lg transition-all duration-200 group relative"
            [class.justify-center]="isCollapsed"
            [title]="isCollapsed ? item.label : ''"
          >
            <lucide-icon 
              [name]="item.icon" 
              size="20" 
              class="transition-colors group-hover:text-primary"
            ></lucide-icon>
            
            <span 
              class="ml-3 font-medium transition-all duration-200 whitespace-nowrap"
              [class.opacity-0]="isCollapsed"
              [class.w-0]="isCollapsed"
              [class.ml-0]="isCollapsed"
            >
              {{ item.label }}
            </span>

            <!-- Tooltip for collapsed state (custom implementation or CSS only) -->
            <div 
              *ngIf="isCollapsed"
              class="absolute left-16 px-2 py-1 rounded bg-popover text-popover-foreground text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-border"
            >
              {{ item.label }}
            </div>
          </a>
        </ng-container>
      </nav>

      <!-- Collapse Toggle -->
      <div class="absolute bottom-4 w-full px-4">
        <button
          (click)="toggleCollapse()"
          class="flex items-center justify-center w-full h-10 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <lucide-icon [name]="isCollapsed ? 'chevron-right' : 'chevron-left'" size="20"></lucide-icon>
          <span *ngIf="!isCollapsed" class="ml-2 text-sm font-medium">Collapse</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() isCollapsedChange = new EventEmitter<boolean>();

  navItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'Employees', icon: 'users', path: '/employees' },
    { label: 'Recruitment', icon: 'search', path: '/recruitment' },
    { label: 'Performance', icon: 'award', path: '/performance' },
    { label: 'Benefits', icon: 'gift', path: '/benefits' },
    { label: 'Settings', icon: 'settings', path: '/settings' },
  ];

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed);
  }
}
