// guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../../servicios/auth/auth';
import { NotificationService } from '../../servicios/notification/notification';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const notification = inject(NotificationService);

  const isAuthenticated = await auth.isAuthenticated();
  if (isAuthenticated) {
    return true; 
  } else {
    notification.showAlert(
      'Debes iniciar sesión para acceder a esta sección', 
      'warning', 
      4000
    );
    return false; // Solo bloquea el acceso, no redirige
  }
};