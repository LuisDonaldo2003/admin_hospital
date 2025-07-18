import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolesService } from '../service/roles.service';
import { DataService } from 'src/app/shared/data/data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-edit-role-user',
  standalone: true,
  imports: [FormsModule,CommonModule,TranslateModule],
  templateUrl: './edit-role-user.component.html',
  styleUrl: './edit-role-user.component.scss'
})
export class EditRoleUserComponent {

  sideBar:any = [];
  name:string = '';
  permissions:any = [];
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation:any = null;
  
  public selectedLang: string;


  role_id:any;
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

  showRole() {
    this.RoleService.showRoles(this.role_id).subscribe((resp: any) => {
      console.log(resp);
      this.name = resp.name;
      this.permissions = Array.isArray(resp.permission_pluck) ? resp.permission_pluck : [];
    });
  }


  addPermission(subMenu:any){
    if(subMenu.permision){
      let INDEX = this.permissions.findIndex((item:any) => item == subMenu.permision);
      if(INDEX != -1){
        this.permissions.splice(INDEX,1);
      }else{
        this.permissions.push(subMenu.permision);
      }
      console.log(this.permissions);
    }
  }

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
      console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
        return ;
      }
      this.valid_form_success = true;
    })
  }

}
