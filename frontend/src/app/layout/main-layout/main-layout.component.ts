import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="min-h-screen bg-background flex">
      <!-- Sidebar -->
      <app-sidebar 
        [(isCollapsed)]="isCollapsed"
      ></app-sidebar>

      <!-- Main Content Area -->
      <div 
        class="flex-1 flex flex-col transition-all duration-300"
        [style.margin-left.px]="isCollapsed ? 80 : 256"
      >
        <app-navbar></app-navbar>
        
        <main class="flex-1 p-6 lg:p-8 relative">
           <!-- Page transition wrapper / Background decorations -->
           <div class="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
           
           <div class="relative z-10">
             <router-outlet></router-outlet>
           </div>
        </main>

        <footer class="p-6 border-t border-border text-center text-xs text-muted-foreground">
          &copy; 2026 ABA Talent Management. All rights reserved.
        </footer>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  isCollapsed = false;
}
