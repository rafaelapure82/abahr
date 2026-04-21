import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'rounded-xl border border-border bg-card text-card-foreground shadow-sm ' + className">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() className = '';
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  template: `<div class="flex flex-col space-y-1.5 p-6"><ng-content></ng-content></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardHeaderComponent {}

@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `<h3 class="text-2xl font-semibold leading-none tracking-tight"><ng-content></ng-content></h3>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardTitleComponent {}

@Component({
  selector: 'app-card-content',
  standalone: true,
  template: `<div class="p-6 pt-0"><ng-content></ng-content></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardContentComponent {}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  template: `<div class="flex items-center p-6 pt-0"><ng-content></ng-content></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardFooterComponent {}
