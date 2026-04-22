import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LucideAngularModule, Bell, BellOff, CheckCircle2, Trash2, Clock, Info, AlertTriangle } from 'lucide-angular';

@Component({
    selector: 'app-notifications-page',
    imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, LucideAngularModule],
    template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-bold tracking-tight">Notificaciones</h2>
      </div>

      <app-card>
        <app-card-content>
          <div *ngIf="loading" class="p-12 text-center">Cargando...</div>
          <div *ngIf="!loading && notifications.length === 0" class="p-12 text-center">No hay notificaciones</div>
          <div *ngIf="!loading && notifications.length > 0">
            <div *ngFor="let notification of notifications" class="p-4 border-b">
              {{ notification.title }}
            </div>
          </div>
        </app-card-content>
      </app-card>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPageComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  notifications: any[] = [];
  loading = true;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.notificationService.list().subscribe({
      next: (res: any) => {
        this.notifications = res.data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  markAsRead(id: string) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        this.cdr.markForCheck();
      }
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
        this.cdr.markForCheck();
      }
    });
  }

  remove(id: string) {
    this.notificationService.remove(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.cdr.markForCheck();
      }
    });
  }

  getIconName(type: string): string {
    switch (type) {
      case 'LEAVE_APPROVED':
      case 'PAYROLL_APPROVED':
        return 'check-circle-2';
      case 'LEAVE_REJECTED':
        return 'alert-triangle';
      case 'LEAVE_REQUEST':
      case 'JOB_APPLICATION':
        return 'clock';
      case 'SYSTEM_ALERT':
        return 'alert-circle';
      default:
        return 'info';
    }
  }

  getIconContainerClass(type: string): string {
    switch (type) {
      case 'LEAVE_APPROVED':
      case 'PAYROLL_APPROVED':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'LEAVE_REJECTED':
      case 'SYSTEM_ALERT':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'LEAVE_REQUEST':
      case 'JOB_APPLICATION':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }
}
