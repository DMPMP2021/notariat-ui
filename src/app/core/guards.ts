import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard = (role: string): CanActivateFn => () => {
  const auth = inject(AuthService);
  return auth.token && auth.hasRole(role) ? true : inject(Router).createUrlTree(['/login']);
};
