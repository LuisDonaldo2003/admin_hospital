import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { routes } from '../routes/routes';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return this.router.parseUrl(routes.login);

    const rawRoles: any[] = user.roles || [];
    const norm = rawRoles
      .map(r => (typeof r === 'string' ? r : (r?.name || '')))
      .filter(Boolean)
      .map(r => r.trim().toLowerCase());

    // Roles privilegiados con acceso a todo
  const superRoles = ['director general', 'subdirector general', 'developer'];
    const isSuper = norm.some(r => superRoles.includes(r));
    if (isSuper) return true;

    const allowed: string[] = (route.data?.['allowedRoles'] || []).map((r: string) => r.toLowerCase());
    if (!allowed.length) return true; // si no se especifica, permitir

    const match = norm.some(r => allowed.includes(r));
    if (match) return true;

    // Redirigir al dashboard correcto según su rol
    if (norm.includes('archivo') || norm.includes('archive')) return this.router.parseUrl(routes.archiveDashboard);
    if (norm.includes('doctor')) return this.router.parseUrl(routes.doctorDashboard);
    if (norm.includes('patient') || norm.includes('paciente')) return this.router.parseUrl(routes.patientDashboard);
    return this.router.parseUrl(routes.adminDashboard);
  }
}
