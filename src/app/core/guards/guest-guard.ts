import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; 
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 1. SSR CHECK
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // 2. CHECK LOGIN
  if (authService.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }


  return true;
};




