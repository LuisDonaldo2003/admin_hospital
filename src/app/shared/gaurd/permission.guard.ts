import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { routes } from '../routes/routes';
import { PermissionService } from '../services/permission.service';

/**
 * Guard para proteger rutas basándose en permisos específicos
 * Uso en las rutas:
 * {
 *   path: 'roles/register',
 *   component: AddRoleUserComponent,
 *   canActivate: [PermissionGuard],
 *   data: { requiredPermissions: ['register_rol'] }
 * }
 */
@Injectable({ 
  providedIn: 'root' 
})
export class PermissionGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private permissionService: PermissionService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    // Verificar si el usuario está autenticado
    if (!this.permissionService.isAuthenticated()) {
      return this.router.parseUrl(routes.login);
    }

    // Obtener los permisos requeridos de la configuración de la ruta
    const requiredPermissions: string[] = route.data?.['requiredPermissions'] || [];
    const requireAllPermissions: boolean = route.data?.['requireAllPermissions'] || false;

    // Si no se especifican permisos, permitir acceso
    if (requiredPermissions.length === 0) {
      return true;
    }

    // Verificar permisos
    const hasPermission = requireAllPermissions 
      ? this.permissionService.hasAllPermissions(requiredPermissions)
      : this.permissionService.hasAnyPermission(requiredPermissions);

    if (hasPermission) {
      return true;
    }

    // Si no tiene permisos, redirigir al perfil o dashboard
    console.log('🚫 Acceso denegado. Permisos insuficientes para acceder a esta ruta');
    return this.router.parseUrl(routes.profile);
  }
}
