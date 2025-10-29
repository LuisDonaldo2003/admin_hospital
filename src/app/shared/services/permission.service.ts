import { Injectable } from '@angular/core';

/**
 * Servicio para gestionar y verificar permisos de usuario
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  
  private user: any = null;

  constructor() {
    this.loadUser();
  }

  /**
   * Carga el usuario desde localStorage
   */
  private loadUser(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      this.user = JSON.parse(userString);
    }
  }

  /**
   * Recarga el usuario desde localStorage (útil después de actualizar permisos)
   */
  public refreshUser(): void {
    this.loadUser();
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param permission Permiso a verificar
   * @returns true si tiene el permiso, false en caso contrario
   */
  public hasPermission(permission: string): boolean {
    return this.hasAnyPermission([permission]);
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   * @param permissions Array de permisos a verificar
   * @returns true si tiene al menos uno de los permisos, false en caso contrario
   */
  public hasAnyPermission(permissions: string[]): boolean {
    if (!this.user || !permissions || permissions.length === 0) {
      return false;
    }

    // Verificar si es un rol privilegiado (acceso total)
    if (this.isPrivilegedRole()) {
      return true;
    }

    // Obtener todos los permisos del usuario
    const userPermissions = this.getUserPermissions();

    // Verificar si tiene al menos uno de los permisos
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param permissions Array de permisos a verificar
   * @returns true si tiene todos los permisos, false en caso contrario
   */
  public hasAllPermissions(permissions: string[]): boolean {
    if (!this.user || !permissions || permissions.length === 0) {
      return false;
    }

    // Verificar si es un rol privilegiado (acceso total)
    if (this.isPrivilegedRole()) {
      return true;
    }

    // Obtener todos los permisos del usuario
    const userPermissions = this.getUserPermissions();

    // Verificar si tiene todos los permisos
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param roleName Nombre del rol a verificar
   * @returns true si tiene el rol, false en caso contrario
   */
  public hasRole(roleName: string): boolean {
    return this.hasAnyRole([roleName]);
  }

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   * @param roleNames Array de nombres de roles a verificar
   * @returns true si tiene al menos uno de los roles, false en caso contrario
   */
  public hasAnyRole(roleNames: string[]): boolean {
    if (!this.user || !roleNames || roleNames.length === 0) {
      return false;
    }

    const userRoles = this.getUserRoles();
    const normalizedRoleNames = roleNames.map(r => r.toLowerCase().trim());

    return userRoles.some(role => 
      normalizedRoleNames.includes(role.toLowerCase().trim())
    );
  }

  /**
   * Verifica si el usuario tiene un rol privilegiado con acceso total
   * @returns true si tiene rol privilegiado, false en caso contrario
   */
  public isPrivilegedRole(): boolean {
    const privilegedRoles = ['Director General', 'Subdirector General', 'Developer'];
    return this.hasAnyRole(privilegedRoles);
  }

  /**
   * Obtiene todos los permisos del usuario
   * @returns Array de permisos
   */
  public getUserPermissions(): string[] {
    if (!this.user) {
      return [];
    }

    const permissions: string[] = [];

    // Permisos directos del usuario
    if (this.user.permissions && Array.isArray(this.user.permissions)) {
      permissions.push(...this.user.permissions);
    }

    // Permisos desde los roles
    if (this.user.roles && Array.isArray(this.user.roles)) {
      this.user.roles.forEach((role: any) => {
        if (role.permissions && Array.isArray(role.permissions)) {
          permissions.push(...role.permissions);
        }
        // También verificar permission_pluck (usado en el backend)
        if (role.permission_pluck && Array.isArray(role.permission_pluck)) {
          permissions.push(...role.permission_pluck);
        }
      });
    }

    // Permisos desde permission_pluck directo
    if (this.user.permission_pluck && Array.isArray(this.user.permission_pluck)) {
      permissions.push(...this.user.permission_pluck);
    }

    // Eliminar duplicados y retornar
    return [...new Set(permissions)];
  }

  /**
   * Obtiene todos los roles del usuario
   * @returns Array de nombres de roles
   */
  public getUserRoles(): string[] {
    if (!this.user || !this.user.roles) {
      return [];
    }

    return this.user.roles.map((role: any) => {
      return typeof role === 'string' ? role : role.name;
    }).filter((name: string) => name);
  }

  /**
   * Obtiene el usuario actual
   * @returns Usuario actual o null
   */
  public getUser(): any {
    return this.user;
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si está autenticado, false en caso contrario
   */
  public isAuthenticated(): boolean {
    return !!this.user && !!localStorage.getItem('token');
  }
}
