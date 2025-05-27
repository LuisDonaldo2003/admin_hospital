import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🔹 Importar FormsModule
import { DataService } from 'src/app/shared/data/data.service';
import { RolesService } from '../service/roles.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-add-role-user',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './add-role-user.component.html',
  styleUrls: ['./add-role-user.component.scss']
})
export class AddRoleUserComponent implements OnInit {
  sideBar: any = [];
  name: string = '';
  permission: any = [];
  valid_form: boolean = false;
  valid_form_succes: boolean = false;
  text_validation:any = null;
  
  public selectedLang: string;


  constructor(
    public DataService: DataService,
    public RoleService: RolesService,
    private translate: TranslateService

  ) {
    // Establece el idioma inicial
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit(): void {
    if (this.DataService.sideBar && this.DataService.sideBar.length > 0) {
      this.sideBar = this.DataService.sideBar[0].menu;
    }
  }

  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  addPermission(subMenu: any) {
    if (subMenu.permision) {
      let INDEX = this.permission.findIndex((item: any) => item === subMenu.permision);
      if (INDEX !== -1) {
        this.permission.splice(INDEX, 1);
      } else {
        this.permission.push(subMenu.permision);
      }
      console.log(this.permission);
    }
  }

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
        console.log(resp);

        if (resp.message  == 403) {
          this.text_validation = resp.message_text; // Asigna el mensaje de error a la variable
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
        console.error("Error en la petición:", err);
        if (err.status === 403) {
          this.text_validation = err.error.message_text || "EL NOMBRE DEL ROL YA EXISTE";
        } else {
          this.text_validation = "Error desconocido. Intente de nuevo.";
        }
      }
    });
  }

}
