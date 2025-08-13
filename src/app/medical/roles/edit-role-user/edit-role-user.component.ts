// Importación de módulos y servicios necesarios para el componente de edición de rol de usuario
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolesService } from '../service/roles.service';
import { DataService } from 'src/app/shared/data/data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


/**
 * Componente para editar un rol de usuario y sus permisos.
 * Incluye validación, cambio de idioma y gestión de permisos.
 */
@Component({
  selector: 'app-edit-role-user',
  standalone: true,
  imports: [FormsModule,CommonModule,TranslateModule],
  templateUrl: './edit-role-user.component.html',
  styleUrl: './edit-role-user.component.scss'
})
export class EditRoleUserComponent {
  /**
   * Menú lateral con las secciones y permisos disponibles
   */
  sideBar:any = [];
  /**
   * Nombre del rol a editar
   */
  name:string = '';
  /**
   * Permisos seleccionados para el rol
   */
  permissions:any = [];
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
  text_validation:any = null;
  /**
   * Idioma seleccionado actualmente
   */
  public selectedLang: string;

  /**
   * Identificador del rol a editar
   */
  role_id:any;

  /**
   * Constructor que inyecta los servicios de datos, roles, ruta activa y traducción
   */
  constructor(
    public DataService: DataService ,
    public RoleService: RolesService,
    public activedRoute: ActivatedRoute,
    private translate: TranslateService

  ) {
    // Establece el idioma inicial
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Traduce dinámicamente el menú lateral y obtiene el id del rol desde la ruta
   */
  ngOnInit(): void {
    this.sideBar = this.DataService.sideBar[0].menu.map((section: any) => {
      // Traduce la sección si existe la clave
      const sectionKey = section.menuValue;
      const sectionTranslated = this.translate.instant(sectionKey);
      section.menuValueTranslated = sectionTranslated !== sectionKey ? sectionTranslated : sectionKey;

      // Traduce cada permiso si existe la clave
      if (Array.isArray(section.subMenus)) {
        section.subMenus = section.subMenus.map((subMenu: any) => {
          const permKey = subMenu.menuValue;
          const permTranslated = this.translate.instant(permKey);
          subMenu.menuValueTranslated = permTranslated !== permKey ? permTranslated : permKey;
          return subMenu;
        });
      }
      return section;
    });

    this.activedRoute.params.subscribe((resp: any) => {
      this.role_id = resp.id;
    });
    this.showRole();
  }

  /**
   * Alterna el idioma entre español e inglés y actualiza las traducciones dinámicas
   */
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);

    // Actualiza traducciones dinámicas al cambiar idioma
    this.sideBar = this.DataService.sideBar[0].menu.map((section: any) => {
      const sectionKey = section.menuValue;
      const sectionTranslated = this.translate.instant(sectionKey);
      section.menuValueTranslated = sectionTranslated !== sectionKey ? sectionTranslated : sectionKey;

      if (Array.isArray(section.subMenus)) {
        section.subMenus = section.subMenus.map((subMenu: any) => {
          const permKey = subMenu.menuValue;
          const permTranslated = this.translate.instant(permKey);
          subMenu.menuValueTranslated = permTranslated !== permKey ? permTranslated : permKey;
          return subMenu;
        });
      }
      return section;
    });
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
  addPermission(subMenu:any){
    if(subMenu.permision){
      let INDEX = this.permissions.findIndex((item:any) => item == subMenu.permision);
      if(INDEX != -1){
        this.permissions.splice(INDEX,1);
      }else{
        this.permissions.push(subMenu.permision);
      }
    }
  }

  /**
   * Guarda los cambios del rol y sus permisos si el formulario es válido
   * Muestra mensajes de error, éxito o advertencia según la respuesta
   */
  save(){
    this.valid_form = false;
    if(!this.name  || this.permissions.length == 0){
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
      permissions:this.permissions,
    };
    this.valid_form_success = false;
    this.text_validation = null;
    this.RoleService.editRoles(data,this.role_id).subscribe((resp:any) => {
      if(resp.message == 403){
        this.text_validation = resp.message_text;
        return ;
      }
      this.valid_form_success = true;
    })
  }
}
