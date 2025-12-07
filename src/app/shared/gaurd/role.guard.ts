import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { routes } from '../routes/routes';
import { RoleConfigService } from '../services/role-config.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private roleConfigService: RoleConfigService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return this.router.parseUrl(routes.login);

    const userRoles: any[] = user.roles || [];
    const allowedRoles: string[] = route.data?.['allowedRoles'] || [];

    // Usar el servicio dinámico para verificar acceso
    if (this.roleConfigService.canAccessRoute(userRoles, allowedRoles)) {
      return true;
    }

    // Si no tiene acceso, redirigir al perfil donde puede ver sus opciones disponibles
    return this.router.parseUrl(routes.profile);
  }
}
