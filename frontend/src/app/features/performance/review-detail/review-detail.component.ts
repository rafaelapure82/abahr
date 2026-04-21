import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold">Review Details</h2>
      <p class="text-muted-foreground">Detailed view for performance review.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewDetailComponent {}
