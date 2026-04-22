import { Component, ChangeDetectionStrategy } from '@angular/core';


@Component({
    selector: 'app-review-detail',
    imports: [],
    template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold">Review Details</h2>
      <p class="text-muted-foreground">Detailed view for performance review.</p>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewDetailComponent {}
