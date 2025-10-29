import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';

/**
 * Directiva estructural para verificar si el usuario tiene un permiso específico
 * Uso: *appHasPermission="'edit_rol'" o *appHasPermission="['edit_rol', 'delete_rol']"
 * 
 * Ejemplo en template:
 * <button *appHasPermission="'edit_rol'">Editar</button>
 * <div *appHasPermission="['edit_rol', 'delete_rol']">Contenido con múltiples permisos</div>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  private permissions: string[] = [];
  private user: any = null;

  /**
   * Recibe el/los permisos requeridos para mostrar el elemento
   */
  @Input() set appHasPermission(value: string | string[]) {
    this.permissions = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {
    // Obtener el usuario desde localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      this.user = JSON.parse(userString);
    }
    this.updateView();
  }

  /**
   * Actualiza la vista mostrando u ocultando el elemento según los permisos
   */
  private updateView() {
    if (this.hasPermission()) {
      // Mostrar el elemento
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // Ocultar el elemento
      this.viewContainer.clear();
    }
  }

  /**
   * Verifica si el usuario tiene los permisos requeridos
   */
  private hasPermission(): boolean {
    if (!this.user || !this.permissions.length) {
      return false;
    }

    // Obtener los roles del usuario
    const userRoles = this.user.roles || [];
    
    // Verificar si es un rol privilegiado (acceso total)
    const privilegedRoles = ['Director General', 'Subdirector General', 'Developer'];
    const hasPrivilegedRole = userRoles.some((role: any) => {
      const roleName = typeof role === 'string' ? role : role.name;
      return privilegedRoles.includes(roleName);
    });

    // Si tiene rol privilegiado, permitir todo
    if (hasPrivilegedRole) {
      return true;
    }

    // Obtener permisos del usuario (pueden venir de diferentes fuentes)
    const userPermissions = this.getUserPermissions();

    // Verificar si tiene al menos uno de los permisos requeridos
    return this.permissions.some(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * Obtiene todos los permisos del usuario
   */
  private getUserPermissions(): string[] {
    const permissions: string[] = [];

    // Permisos directos del usuario
    if (this.user.permissions) {
      if (Array.isArray(this.user.permissions)) {
        permissions.push(...this.user.permissions);
      }
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

    // Eliminar duplicados
    return [...new Set(permissions)];
  }
}
