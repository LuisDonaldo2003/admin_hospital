// Importación de módulos y servicios necesarios para el componente de edición de rol de usuario
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesService } from '../service/roles.service';
import { DataService } from 'src/app/shared/data/data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';


/**
 * Componente para editar un rol de usuario y sus permisos.
 * Incluye validación, cambio de idioma y gestión de permisos.
 */
@Component({
  selector: 'app-edit-role-user',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './edit-role-user.component.html',
  styleUrls: ['./edit-role-user.component.scss']
})
export class EditRoleUserComponent implements OnInit {
  /**
   * Menú lateral con las secciones y permisos disponibles
   */
  sideBar: any = [];
  /**
   * Nombre del rol a editar
   */
  name: string = '';
  /**
   * Permisos seleccionados para el rol
   */
  permissions: any = [];
  /**
   * Bandera para mostrar error de formulario inválido
   */
  valid_form: boolean = false;
  /**
   * Bandera para mostrar mensaje de éxito
   */
  valid_form_success: boolean = false;
  /**
   * Mensaje de validación personalizado
   */
  text_validation: any = null;
  /**
   * Idioma seleccionado actualmente
   */
  public selectedLang: string;

  /**
   * Identificador del rol a editar
   */
  role_id: any;

  /**
   * Constructor que inyecta los servicios de datos, roles, ruta activa, router y traducción
   */
  constructor(
    public DataService: DataService,
    public RoleService: RolesService,
    public activedRoute: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private driverTourService: DriverTourService
  ) {
    // Establece el idioma inicial
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  /**
   * Inicia el tour guiado del formulario de editar rol
   */
  public startEditRoleTour(): void {
    this.driverTourService.startEditRoleTour();
  }

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Traduce dinámicamente el menú lateral y obtiene el id del rol desde la ruta
   */
  ngOnInit(): void {
    // Cargar el menú lateral tal y como hace AddRoleComponent
    if (this.DataService.sideBar && this.DataService.sideBar.length > 0) {
      this.sideBar = this.DataService.sideBar[0].menu;
    }

    this.activedRoute.params.subscribe((resp: any) => {
      this.role_id = resp.id;
      // Llamar a showRole después de obtener el id
      this.showRole();
    });
  }

  /**
   * Alterna el idioma entre español e inglés y actualiza las traducciones dinámicas
   */
  toggleLanguage(): void {
    // Simpler language toggle: translate pipe updates the template automatically
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  /**
   * Obtiene los datos del rol desde el servicio y los asigna a las propiedades
   */
  showRole() {
    this.RoleService.showRoles(this.role_id).subscribe((resp: any) => {
      this.name = resp.name;
      this.permissions = Array.isArray(resp.permission_pluck) ? resp.permission_pluck : [];
    });
  }

  /**
   * Agrega o elimina un permiso del arreglo de permisos seleccionados
   */
  addPermission(subMenu: any) {
    if (subMenu.permision) {
      let INDEX = this.permissions.findIndex((item: any) => item == subMenu.permision);
      if (INDEX != -1) {
        this.permissions.splice(INDEX, 1);
      } else {
        this.permissions.push(subMenu.permision);
      }
    }
  }

  // Helpers reused from AddRoleUserComponent to build correct translation keys
  cleanGroup(group: string): string {
    return group.replace(/^GRUPO_/, '');
  }

  getRoleLabel(roleKey: string): string {
    const match = roleKey.match(/^(SIDEBAR_\w+?)(\d+)$/);
    if (match) {
      const baseKey = match[1];
      const number = match[2];
      const baseTranslation = this.translate.instant(baseKey);
      if (baseTranslation !== baseKey) {
        return `${baseTranslation} ${number}`;
      }
      let label = baseKey.replace(/^SIDEBAR_/, '').replace(/_/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
      return `${label} ${number}`;
    }
    const translation = this.translate.instant(roleKey);
    if (translation !== roleKey) {
      return translation;
    }
    let label = roleKey.replace(/^SIDEBAR_/, '').replace(/_/g, ' ');
    label = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
    return label;
  }

  /**
   * Guarda los cambios del rol y sus permisos si el formulario es válido
   * Muestra mensajes de error, éxito o advertencia según la respuesta
   */
  save() {
    this.valid_form = false;
    if (!this.name || this.permissions.length == 0) {
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
      permissions: this.permissions,
    };
    this.valid_form_success = false;
    this.text_validation = null;

    this.RoleService.editRoles(data, this.role_id).subscribe({
      next: (resp: any) => {
        if (resp.message == 403) {
          this.text_validation = resp.message_text;
          return;
        }
        if (resp.message == 200) {
          this.valid_form_success = true;
          this.text_validation = null;
          // Redirigir al listado de roles después de 1 segundo para mostrar el mensaje de éxito
          setTimeout(() => {
            this.router.navigate(['/roles/list'], { relativeTo: this.activedRoute });
          }, 2000);
        }
      },
      error: (error: any) => {
        console.error('Error al editar rol:', error);
        if (error.status === 403) {
          this.text_validation = error.error?.message_text || 'No tienes permisos para realizar esta acción';
        } else if (error.status === 422) {
          this.text_validation = error.error?.message || 'Datos de entrada inválidos';
        } else if (error.status === 500) {
          this.text_validation = 'Error interno del servidor. Intenta nuevamente.';
        } else {
          this.text_validation = 'Error al actualizar el rol. Verifica tu conexión e intenta nuevamente.';
        }
      }
    });
  }
}
