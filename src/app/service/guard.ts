import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { Api } from './api';

export const patientOnlyGuard: CanActivateFn = (route, state) => {
  const apiService = inject(Api);
  const router = inject(Router);

  // router.navigate(['/login']) is not ideal in guards. Also, you can better use router.createUrlTree(['/login'])
  return apiService.isPatient() ? true : new RedirectCommand(router.parseUrl('/login'));
};

export const doctorOnlyGuard: CanActivateFn = (route, state) => {
  const apiService = inject(Api);
  const router = inject(Router);

  return apiService.isDoctor() ? true : new RedirectCommand(router.parseUrl('/login'));
};

export const authGuard: CanActivateFn = (route, state) => {
  const apiService = inject(Api);
  const router = inject(Router);

  return apiService.isAuthenticated() ? true : new RedirectCommand(router.parseUrl('/login'));
};
