import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
    selector: 'app-main-layout',
    imports: [RouterOutlet, SidebarComponent, NavbarComponent],
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

        <main class="flex-1 p-6 lg:p-8 relative overflow-hidden">
           <!-- Background decorations -->
           <div class="absolute top-0 right-0 w-96 h-96 bg-primary/[0.03] blur-[120px] rounded-full pointer-events-none"></div>
           <div class="absolute bottom-0 left-1/4 w-72 h-72 bg-violet-500/[0.02] blur-[100px] rounded-full pointer-events-none"></div>
           <div class="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-500/[0.02] blur-[80px] rounded-full pointer-events-none"></div>

           <div class="relative z-10">
             <router-outlet></router-outlet>
           </div>
        </main>

        <footer class="px-6 py-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground bg-card/30 backdrop-blur-sm">
          <span>&copy; 2026 ABA Talent Management. Todos los derechos reservados.</span>
          <span class="hidden sm:inline">v1.0.0 · Powered by Angular 15+</span>
        </footer>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class MainLayoutComponent {
  isCollapsed = false;
}
