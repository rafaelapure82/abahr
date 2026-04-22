import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../../../core/services/department.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule, Users, ChevronRight, ChevronDown } from 'lucide-angular';

@Component({
    selector: 'app-org-chart',
    imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, LucideAngularModule],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Organigrama</h2>
          <p class="text-muted-foreground">Jerarquía organizacional de la empresa.</p>
        </div>
        <app-button variant="outline" routerLink="/departments">
          ← Volver a Departamentos
        </app-button>
      </div>
    
      <!-- Loading State -->
      @if (loading) {
        <div class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    
      <!-- Org Chart Tree -->
      @if (!loading) {
        <div class="overflow-x-auto">
          <app-card>
            <app-card-content class="p-6">
              @if (tree.length === 0) {
                <div class="text-center py-12 text-muted-foreground italic">
                  No hay datos organizacionales disponibles.
                </div>
              }
              @for (node of tree; track node) {
                <div class="mb-4">
                  <ng-container *ngTemplateOutlet="treeNode; context: { node: node, depth: 0 }"></ng-container>
                </div>
              }
            </app-card-content>
          </app-card>
        </div>
      }
    
      <!-- Node template (recursive) -->
      <ng-template #treeNode let-node="node" let-depth="depth">
        <div [style.margin-left.px]="depth * 32" class="mb-2">
          <div class="flex items-stretch">
            <!-- Connector line -->
            @if (depth > 0) {
              <div class="w-8 flex-shrink-0 relative">
                <div class="absolute left-0 top-0 bottom-0 border-l-2 border-border"></div>
                <div class="absolute left-0 top-6 w-8 border-t-2 border-border"></div>
              </div>
            }
    
            <!-- Node Card -->
            <div class="flex-1 group">
              <div class="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all duration-200 cursor-pointer"
                (click)="toggleNode(node)">
                <!-- Dept color dot -->
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  [style.background-color]="node.color || '#6366f1'">
                  {{ node.code?.substring(0, 2) || '?' }}
                </div>
    
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm truncate">{{ node.name }}</p>
                  <p class="text-xs text-muted-foreground truncate">
                    <lucide-icon name="users" size="10" class="inline mr-1"></lucide-icon>
                    {{ node._count?.employees || 0 }} empleados
                    @if (node.head) {
                      <span class="ml-2 text-primary/70">
                        Responsable: {{ node.head.firstName }} {{ node.head.lastName }}
                      </span>
                    }
                  </p>
                </div>
    
                @if (node.children?.length) {
                  <lucide-icon
                    [name]="isExpanded(node.id) ? 'chevron-down' : 'chevron-right'"
                    size="16"
                    class="text-muted-foreground flex-shrink-0">
                  </lucide-icon>
                }
              </div>
            </div>
          </div>
    
          <!-- Children -->
          @if (isExpanded(node.id) && node.children?.length) {
            <div>
              @for (child of node.children; track child) {
                <div>
                  <ng-container *ngTemplateOutlet="treeNode; context: { node: child, depth: depth + 1 }"></ng-container>
                </div>
              }
            </div>
          }
        </div>
      </ng-template>
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgChartComponent implements OnInit {
  private deptService = inject(DepartmentService);
  private cdr = inject(ChangeDetectorRef);

  tree: any[] = [];
  loading = true;
  expandedNodes = new Set<string>();

  ngOnInit() {
    this.deptService.getTree().subscribe({
      next: (res: any) => {
        const data = res.data || res || [];
        this.tree = Array.isArray(data) ? data : [data];
        // Expand first level by default
        this.tree.forEach((n: any) => this.expandedNodes.add(n.id));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleNode(node: any) {
    if (this.expandedNodes.has(node.id)) this.expandedNodes.delete(node.id);
    else this.expandedNodes.add(node.id);
    this.cdr.markForCheck();
  }

  isExpanded(id: string): boolean {
    return this.expandedNodes.has(id);
  }
}
