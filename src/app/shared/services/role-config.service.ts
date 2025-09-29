// Servicio para manejar configuración dinámica de roles
import { Injectable } from '@angular/core';
import { routes } from '../routes/routes';

export interface RoleConfig {
  roleName: string;
  defaultDashboard: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleConfigService {

  constructor() {}

  /**
   * Obtiene la ruta de destino después del login (SIEMPRE perfil)
   * Todos los usuarios son redirigidos al perfil después del login
   */
  getPostLoginDestination(): string {
    return routes.profile;
  }

  /**
   * Obtiene el dashboard apropiado para un conjunto de roles (para navegación posterior)
   * Utiliza una lógica de prioridad para determinar el mejor dashboard
   */
  getDashboardForRoles(userRoles: string[]): string {
    const normalizedRoles = userRoles
      .map(role => (typeof role === 'string' ? role : (role as any)?.name || ''))
      .filter(Boolean)
      .map(role => role.trim().toLowerCase());

    // Roles específicos con dashboards dedicados (mayor prioridad)
    if (normalizedRoles.includes('archivo') || normalizedRoles.includes('archive')) {
      return routes.archiveDashboard;
    }
    
    if (normalizedRoles.includes('doctor')) {
      return routes.doctorDashboard;
    }
    
    if (normalizedRoles.includes('patient') || normalizedRoles.includes('paciente')) {
      return routes.patientDashboard;
    }

    // Todos los demás roles van al dashboard administrativo
    // Esto incluye: director general, subdirector, recursos humanos, developer, pruebas, etc.
    return routes.adminDashboard;
  }

  /**
   * Verifica si un rol puede acceder al dashboard administrativo
   * Por defecto, todos los roles pueden acceder excepto los que tienen dashboards específicos
   */
  canAccessAdminDashboard(userRoles: string[]): boolean {
    const normalizedRoles = userRoles
      .map(role => (typeof role === 'string' ? role : (role as any)?.name || ''))
      .filter(Boolean)
      .map(role => role.trim().toLowerCase());

    // Roles privilegiados que tienen acceso total
    const superRoles = ['director general', 'subdirector general', 'developer'];
    if (normalizedRoles.some(role => superRoles.includes(role))) {
      return true;
    }

    // Roles que NO pueden acceder al admin dashboard (tienen su propio dashboard)
    const restrictedRoles = ['doctor', 'patient', 'paciente'];
    // Solo archivo puede no acceder si no tiene permisos específicos de admin
    
    // Por defecto, la mayoría de roles administrativos pueden acceder
    return true;
  }

  /**
   * Obtiene la ruta home para los roles del usuario (para botones de navegación)
   * Mantiene la lógica de dashboards específicos para navegación desde el perfil
   */
  getHomeRouteForRoles(userRoles: string[]): string {
    return this.getDashboardForRoles(userRoles);
  }

  /**
   * Verifica si un conjunto de roles puede acceder a una ruta específica
   * Basado en una lista de roles permitidos
   */
  canAccessRoute(userRoles: string[], allowedRoles: string[]): boolean {
    if (!allowedRoles || allowedRoles.length === 0) {
      return true; // Si no se especifican restricciones, permitir acceso
    }

    const normalizedUserRoles = userRoles
      .map(role => (typeof role === 'string' ? role : (role as any)?.name || ''))
      .filter(Boolean)
      .map(role => role.trim().toLowerCase());

    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    // Roles privilegiados tienen acceso a todo
    const superRoles = ['director general', 'subdirector general', 'developer'];
    if (normalizedUserRoles.some(role => superRoles.includes(role))) {
      return true;
    }

    // Verificar si algún rol del usuario está en la lista de permitidos
    return normalizedUserRoles.some(role => normalizedAllowedRoles.includes(role));
  }

  /**
   * Obtiene el dashboard de redirección cuando un usuario no tiene acceso a una ruta
   */
  getRedirectDashboardForRoles(userRoles: string[]): string {
    return this.getDashboardForRoles(userRoles);
  }
}