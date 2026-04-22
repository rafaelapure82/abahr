import { Component, Input, ChangeDetectionStrategy } from '@angular/core';


@Component({
    selector: 'app-card',
    imports: [],
    template: `
    <div [class]="'rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300 ' + className">
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
