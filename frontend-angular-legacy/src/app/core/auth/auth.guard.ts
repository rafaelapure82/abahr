import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs';

/**
 * Prevents unauthenticated users from accessing protected routes
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuth => {
      if (isAuth) return true;
      
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};

/**
 * Restricts access based on user roles or permissions
 * Expects 'roles' or 'permissions' array in route data
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];
  const requiredPermissions = route.data['permissions'] as string[];

  if (requiredRoles) {
    const hasRole = requiredRoles.some(role => authService.hasRole(role));
    if (hasRole) return true;
  }

  if (requiredPermissions) {
    const hasPermission = requiredPermissions.some(perm => authService.hasPermission(perm));
    if (hasPermission) return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
