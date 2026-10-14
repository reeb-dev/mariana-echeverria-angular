import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { AuthService } from '../../data/auth.service';
import type { Permission } from '../../data/permissions';

/** Pide ingresar al panel. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user() ? true : router.createUrlTree(['/panel/ingresar']);
};

/** Pide además un permiso concreto; si no lo tiene, vuelve al listado. */
export function permissionGuard(permission: Permission): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.user()) return router.createUrlTree(['/panel/ingresar']);
    return auth.can(permission) ? true : router.createUrlTree(['/panel']);
  };
}

/** Pregunta antes de salir de un formulario si quedaron cambios sin guardar. */
export const unsavedChangesGuard: CanDeactivateFn<{ hasUnsavedChanges(): boolean }> = (component) =>
  !component.hasUnsavedChanges() || confirm('Tenés cambios sin guardar. ¿Salir igual?');
