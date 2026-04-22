import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-attendance-dashboard',
    imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, ButtonComponent, LucideAngularModule],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Attendance</h2>
          <p class="text-muted-foreground">Track your working hours and team attendance.</p>
        </div>
        <div class="text-right text-sm text-muted-foreground">
          <p class="font-semibold text-lg text-foreground">{{ currentTime }}</p>
          <p>{{ today | date:'EEEE, MMMM d, y' }}</p>
        </div>
      </div>

      <!-- Clock Card -->
      <app-card>
        <app-card-content class="p-8">
          <div class="flex flex-col items-center gap-6">
            <!-- Status Ring -->
            <div class="relative">
              <div class="w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-500"
                   [ngClass]="{
                     'border-green-500 bg-green-500/10': isCheckedIn && !isCheckedOut,
                     'border-blue-500 bg-blue-500/10': isCheckedOut,
                     'border-border bg-muted': !isCheckedIn
                   }">
                <div class="text-center">
                  <lucide-icon
                    [name]="isCheckedIn && !isCheckedOut ? 'check-circle-2' : isCheckedOut ? 'moon' : 'clock'"
                    size="40"
                    [ngClass]="{
                      'text-green-500': isCheckedIn && !isCheckedOut,
                      'text-blue-500': isCheckedOut,
                      'text-muted-foreground': !isCheckedIn
                    }">
                  </lucide-icon>
                  <p class="text-xs font-semibold mt-1"
                     [ngClass]="{
                       'text-green-600': isCheckedIn && !isCheckedOut,
                       'text-blue-600': isCheckedOut,
                       'text-muted-foreground': !isCheckedIn
                     }">
                    {{ statusLabel }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Timer -->
            <div *ngIf="isCheckedIn && !isCheckedOut" class="text-center">
              <p class="text-4xl font-mono font-bold tracking-widest text-green-600">{{ elapsedTime }}</p>
              <p class="text-xs text-muted-foreground mt-1">Time worked today</p>
            </div>

            <!-- Check-in / Check-out info -->
            <div class="flex gap-8 text-center">
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider">Check In</p>
                <p class="font-semibold text-sm mt-1">{{ todayRecord?.checkIn | date:'hh:mm a' || '—' }}</p>
              </div>
              <div class="w-px bg-border"></div>
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider">Check Out</p>
                <p class="font-semibold text-sm mt-1">{{ todayRecord?.checkOut | date:'hh:mm a' || '—' }}</p>
              </div>
              <div class="w-px bg-border"></div>
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider">Hours</p>
                <p class="font-semibold text-sm mt-1">{{ todayRecord?.hoursWorked || '0.00' }}h</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4" *ngIf="!loadingAction">
              <app-button
                *ngIf="!isCheckedIn"
                variant="primary"
                (click)="doCheckIn()"
                class="px-8 py-3 text-lg">
                <lucide-icon name="log-in" size="20" class="mr-2"></lucide-icon>
                Check In
              </app-button>
              <app-button
                *ngIf="isCheckedIn && !isCheckedOut"
                variant="destructive"
                (click)="doCheckOut()"
                class="px-8 py-3 text-lg">
                <lucide-icon name="log-out" size="20" class="mr-2"></lucide-icon>
                Check Out
              </app-button>
            </div>
            <div *ngIf="loadingAction" class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </app-card-content>
      </app-card>

      <!-- Stats -->
      <div class="grid gap-4 md:grid-cols-4">
        <app-card *ngFor="let stat of stats">
          <app-card-content class="flex items-center gap-4 p-6">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" [ngClass]="stat.bg">
              <lucide-icon [name]="stat.icon" size="20" [ngClass]="stat.color"></lucide-icon>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
              <p class="text-xl font-bold">{{ stat.value }}</p>
            </div>
          </app-card-content>
        </app-card>
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceDashboardComponent implements OnInit, OnDestroy {
  private attendanceService = inject(AttendanceService);
  private cdr = inject(ChangeDetectorRef);

  today = new Date();
  todayRecord: any = null;
  loadingAction = false;
  currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  elapsedTime = '00:00:00';

  private clockInterval: any;

  stats: any[] = [
    { label: 'Present This Month', value: '—', icon: 'check-circle', color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Absent', value: '—', icon: 'x-circle', color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Remote Days', value: '—', icon: 'wifi', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Overtime Hours', value: '—', icon: 'timer', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  get isCheckedIn() { return !!this.todayRecord?.checkIn; }
  get isCheckedOut() { return !!this.todayRecord?.checkOut; }

  get statusLabel() {
    if (this.isCheckedOut) return 'CHECKED OUT';
    if (this.isCheckedIn) return 'WORKING';
    return 'NOT STARTED';
  }

  ngOnInit() {
    this.loadToday();
    this.loadStats();
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.updateElapsed();
      this.cdr.markForCheck();
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.clockInterval);
  }

  private updateElapsed() {
    const record = this.todayRecord;
    if (!record?.checkIn || record?.checkOut) return;
    const diff = Date.now() - new Date(record.checkIn).getTime();
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    this.elapsedTime = `${h}:${m}:${s}`;
  }

  loadToday() {
    this.attendanceService.getMyToday().subscribe({
      next: (res: any) => {
        this.todayRecord = res.data || null;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadStats() {
    this.attendanceService.getStats().subscribe({
      next: (res: any) => {
        const d = res.data || {};
        this.stats = [
          { label: 'Present This Month', value: d.present ?? '—', icon: 'check-circle', color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Absent', value: d.absent ?? '—', icon: 'x-circle', color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Remote Days', value: d.remote ?? '—', icon: 'wifi', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Overtime Hours', value: d.totalOvertime ? `${d.totalOvertime}h` : '—', icon: 'timer', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ];
        this.cdr.markForCheck();
      }
    });
  }

  doCheckIn() {
    this.loadingAction = true;
    this.attendanceService.checkIn({ isRemote: false }).subscribe({
      next: (res: any) => {
        this.todayRecord = res.data || null;
        this.loadingAction = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingAction = false;
        this.cdr.markForCheck();
      }
    });
  }

  doCheckOut() {
    this.loadingAction = true;
    this.attendanceService.checkOut().subscribe({
      next: (res: any) => {
        this.todayRecord = res.data || null;
        this.loadingAction = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingAction = false;
        this.cdr.markForCheck();
      }
    });
  }
}
