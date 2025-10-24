// guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../../servicios/auth/auth';
import { NotificationService } from '../../servicios/notification/notification';

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const notification = inject(NotificationService);

  const user = await auth.getUser();
  
  if (!user) {
    notification.showAlert(
      'Debes iniciar sesión para acceder a esta sección', 
      'warning', 
      4000
    );
    return false;
  }

  const isAdmin = await auth.esAdministrador(user.id);
  
  if (isAdmin) {
    return true;
  } else {
    notification.showAlert(
      'No tienes permisos de administrador para acceder a esta sección', 
      'error', 
      5000
    );
    return false; // Solo bloquea el acceso, no redirige
  }
};