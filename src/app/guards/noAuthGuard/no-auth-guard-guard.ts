// guards/no-auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../../servicios/auth/auth';
import { NotificationService } from '../../servicios/notification/notification';

export const noAuthGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const notification = inject(NotificationService);

  const isAuthenticated = await auth.isAuthenticated();
  if (isAuthenticated) {
    notification.showAlert(
      'Ya tienes una sesión activa', 
      'info', 
      3000
    );
    return false;
  } else {
    return true;
  }
};