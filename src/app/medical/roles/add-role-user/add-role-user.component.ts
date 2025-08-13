// Importación de módulos y servicios necesarios para el componente de agregar rol de usuario
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './add-role-user.component.html',
  styleUrls: ['./add-role-user.component.scss']
})
export class AddRoleUserComponent implements OnInit {
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
   * Mensaje de validación personalizado
   */
  text_validation:any = null;
  /**
   * Idioma seleccionado actualmente
   */
  public selectedLang: string;

  /**
   * Constructor que inyecta los servicios de datos, roles y traducción
   */
  constructor(
    public DataService: DataService,
    public RoleService: RolesService,
    private translate: TranslateService
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
    }
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

    this.valid_form_succes = false;
    this.text_validation = null;
    this.RoleService.storeRoles(data).subscribe({
      next: (resp: any) => {
        if (resp.message  == 403) {
          this.text_validation = resp.message_text;
        } else {
          this.name = '';
          this.permission = [];
          this.valid_form_succes = true;

          let SIDE_BAR = this.sideBar;
          this.sideBar = [];
          setTimeout(() => {
            this.sideBar = SIDE_BAR;
          }, 50);
        }
      },
      error: (err: any) => {
        if (err.status === 403) {
          this.text_validation = err.error.message_text || "EL NOMBRE DEL ROL YA EXISTE";
        } else {
          this.text_validation = "Error desconocido. Intente de nuevo.";
        }
      }
    });
  }
}
