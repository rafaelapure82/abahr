import { Routes } from '@angular/router';

export const BENEFITS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./benefits-catalog/benefits-catalog.component').then(m => m.BenefitsCatalogComponent)
  }
];
