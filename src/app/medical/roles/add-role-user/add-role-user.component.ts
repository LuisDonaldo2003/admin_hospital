// Importación de módulos y servicios necesarios para el componente de agregar rol de usuario
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { DataService } from 'src/app/shared/data/data.service';
import { RolesService } from '../service/roles.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


/**
 * Componente para agregar un nuevo rol de usuario y asignar permisos.
 * Incluye validación, cambio de idioma y gestión de permisos.
 */
@Component({
  selector: 'app-add-role-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-role-user.component.html',
  styleUrls: ['./add-role-user.component.scss']
})
export class AddRoleUserComponent implements OnInit {
  /**
   * Limpia el prefijo 'GRUPO_' del nombre del grupo para usar en traducción
   */
  cleanGroup(group: string): string {
    return group.replace(/^GRUPO_/, '');
  }
  /**
   * Menú lateral con las secciones y permisos disponibles
   */
  sideBar: any = [];
  /**
   * Nombre del rol a crear
   */
  name: string = '';
  /**
   * Permisos seleccionados para el rol
   */
  permission: any = [];
  /**
   * Bandera para mostrar error de formulario inválido
   */
  valid_form: boolean = false;
  /**
   * Bandera para mostrar mensaje de éxito
   */
  valid_form_succes: boolean = false;
  /**
   * Banderas para mostrar errores específicos
   */
  error_403: boolean = false;
  error_422: boolean = false;
  error_500: boolean = false;
  error_general: boolean = false;
  /**
   * Idioma seleccionado actualmente
   */
  public selectedLang: string;

  /**
   * Pestaña activa actualmente
   */
  activeTab: string = 'all';

  /**
   * Texto de búsqueda/filtro de permisos
   */
  searchText: string = '';

  /**
   * Permisos agrupados por categoría
   */
  groupedPermissions: any = {};

  /**
   * Constructor que inyecta los servicios de datos, roles y traducción
   */
  constructor(
    public DataService: DataService,
    public RoleService: RolesService,
    private translate: TranslateService,
    private router: Router
  ) {
    // Establece el idioma inicial
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  /**
   * Obtiene la etiqueta traducida para un rol según su clave
   */
  getRoleLabel(roleKey: string): string {
    // Si la clave es tipo SIDEBAR_ROLE2, SIDEBAR_ROLE3, etc.
    const match = roleKey.match(/^(SIDEBAR_\w+?)(\d+)$/);
    if (match) {
      const baseKey = match[1];
      const number = match[2];
      const baseTranslation = this.translate.instant(baseKey);
      if (baseTranslation !== baseKey) {
        return `${baseTranslation} ${number}`;
      }
      // Si no hay traducción, formatea el texto
      let label = baseKey.replace(/^SIDEBAR_/, '').replace(/_/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
      return `${label} ${number}`;
    }
    // Traducción normal
    const translation = this.translate.instant(roleKey);
    if (translation !== roleKey) {
      return translation;
    }
    // Si no hay traducción, formatea el texto
    let label = roleKey.replace(/^SIDEBAR_/, '').replace(/_/g, ' ');
    label = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
    return label;
  }

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga el menú lateral desde el servicio de datos
   */
  ngOnInit(): void {
    if (this.DataService.sideBar && this.DataService.sideBar.length > 0) {
      this.sideBar = this.DataService.sideBar[0].menu;
      this.groupPermissionsByCategory();
    }
  }

  /**
   * Agrupa los permisos por categoría/grupo
   */
  groupPermissionsByCategory(): void {
    this.groupedPermissions = {};

    this.sideBar.forEach((item: any) => {
      const group = this.cleanGroup(item.group);
      if (!this.groupedPermissions[group]) {
        this.groupedPermissions[group] = [];
      }
      this.groupedPermissions[group].push(item);
    });
  }

  /**
   * Obtiene las categorías de permisos
   */
  getCategories(): string[] {
    return Object.keys(this.groupedPermissions);
  }

  /**
   * Filtra los permisos según el texto de búsqueda
   */
  getFilteredPermissions(category?: string): any[] {
    let items = category ? this.groupedPermissions[category] : this.sideBar;

    if (!this.searchText) {
      return items;
    }

    const search = this.searchText.toLowerCase();
    return items.filter((item: any) => {
      const titleKey = `SIDEBAR.${this.cleanGroup(item.group)}.${item.menuValue}.TITLE`;
      const title = this.translate.instant(titleKey).toLowerCase();
      return title.includes(search) || item.menuValue.toLowerCase().includes(search);
    });
  }

  /**
   * Cambia la pestaña activa
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Selecciona o deselecciona todos los permisos de una categoría
   */
  toggleCategoryPermissions(category: string, event: any): void {
    const items = this.groupedPermissions[category];
    const isChecked = event.target.checked;

    items.forEach((item: any) => {
      if (item.subMenus && item.subMenus.length > 0) {
        item.subMenus.forEach((subMenu: any) => {
          this.setPermission(subMenu, isChecked);
        });
      } else {
        this.setPermission(item, isChecked);
      }
    });
  }

  /**
   * Establece un permiso (agregar o quitar)
   */
  setPermission(item: any, add: boolean): void {
    if (!item.permision) return;

    const index = this.permission.indexOf(item.permision);

    if (add && index === -1) {
      this.permission.push(item.permision);
    } else if (!add && index !== -1) {
      this.permission.splice(index, 1);
    }
  }

  /**
   * Verifica si todos los permisos de una categoría están seleccionados
   */
  isCategoryFullySelected(category: string): boolean {
    const items = this.groupedPermissions[category];
    let allSelected = true;

    items.forEach((item: any) => {
      if (item.subMenus && item.subMenus.length > 0) {
        item.subMenus.forEach((subMenu: any) => {
          if (!this.permission.includes(subMenu.permision)) {
            allSelected = false;
          }
        });
      } else {
        if (!this.permission.includes(item.permision)) {
          allSelected = false;
        }
      }
    });

    return allSelected;
  }

  /**
   * Verifica si un permiso está seleccionado
   */
  isPermissionSelected(permision: string): boolean {
    return this.permission.includes(permision);
  }

  /**
   * Alterna el idioma entre español e inglés y lo guarda en localStorage
   */
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  /**
   * Agrega o elimina un permiso del arreglo de permisos seleccionados
   */
  addPermission(subMenu: any) {
    if (subMenu.permision) {
      let INDEX = this.permission.findIndex((item: any) => item === subMenu.permision);
      if (INDEX !== -1) {
        this.permission.splice(INDEX, 1);
      } else {
        this.permission.push(subMenu.permision);
      }
    }
  }

  /**
   * Guarda el nuevo rol y sus permisos si el formulario es válido
   * Muestra mensajes de error, éxito o advertencia según la respuesta
   */
  save(event: Event) {
    this.valid_form = false;
    event.preventDefault();

    if (!this.name || this.permission.length === 0) {
      this.valid_form = true;
      return;
    }

    let data = {
      name: this.name,
      permissions: this.permission,
    };

    // Resetear todas las banderas de error
    this.valid_form_succes = false;
    this.error_403 = false;
    this.error_422 = false;
    this.error_500 = false;
    this.error_general = false;

    this.RoleService.storeRoles(data).subscribe({
      next: (resp: any) => {
        if (resp.message == 403) {
          this.error_403 = true;
        } else {
          this.name = '';
          this.permission = [];
          this.valid_form_succes = true;

          let SIDE_BAR = this.sideBar;
          this.sideBar = [];
          setTimeout(() => {
            this.sideBar = SIDE_BAR;
          }, 50);

          // Esperar 2 segundos antes de redirigir
          setTimeout(() => {
            this.router.navigate(['/roles/list']);
          }, 2000);
        }
      },
      error: (error: any) => {
        console.error('Error al crear rol:', error);
        if (error.status === 403) {
          this.error_403 = true;
        } else if (error.status === 422) {
          this.error_422 = true;
        } else if (error.status === 500) {
          this.error_500 = true;
        } else {
          this.error_general = true;
        }
      }
    });
  }
}
