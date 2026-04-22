import { Routes } from '@angular/router';
import { OnboardingDashboardComponent } from './onboarding-dashboard/onboarding-dashboard.component';
import { OnboardingDetailComponent } from './onboarding-detail/onboarding-detail.component';

export const ONBOARDING_ROUTES: Routes = [
  {
    path: '',
    component: OnboardingDashboardComponent
  },
  {
    path: ':id',
    component: OnboardingDetailComponent
  }
];
