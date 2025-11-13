import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JsonServerService } from '../services/json-server'; // Import correct

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const jsonServerService = inject(JsonServerService);
  
  const user = jsonServerService.getCurrentUser();

  if (user) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};