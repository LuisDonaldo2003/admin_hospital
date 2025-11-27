import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DepartamentMService } from '../service/departament-m.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-departament-m',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './edit-departament-m.component.html',
  styleUrl: './edit-departament-m.component.scss'
})
export class EditDepartamentMComponent {
  // Nombre del departamento a editar
  name: string = '';
  // Estado del departamento (true: activo, false: inactivo)
  state: boolean = true;
  // Indica si el formulario es inválido
  valid_form: boolean = false;
  // Indica si el formulario se guardó correctamente
  valid_form_success: boolean = false;
  // Mensaje de validación adicional
  text_validation: any = null;

  // ID del departamento a editar
  departament_id: any;

  /**
   * Inyecta el servicio de departamentos, la ruta activa y el servicio de traducción
   */
  constructor(
    public departamentService: DepartamentMService,
    public activedRoute: ActivatedRoute,
    private translate: TranslateService
    ,
    private router: Router
  ) {}

  /**
   * Inicializa el componente y obtiene el ID del departamento desde la ruta
   */
  ngOnInit(): void {
    this.activedRoute.params.subscribe((resp: any) => {
      this.departament_id = resp.id;
    })
    this.showDepartament();
  }

  /**
   * Obtiene los datos del departamento a editar desde el backend
   */
  showDepartament() {
    this.departamentService.showDepartament(this.departament_id).subscribe((resp: any) => {
      this.name = resp.name;
      // Convertir el estado numérico (1 o 2) a boolean (true o false)
      this.state = resp.state === 1;
    })
  }

  /**
   * Guarda los cambios realizados en el departamento
   */
  save() {
    this.valid_form = false;
    if (!this.name) {
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
      state: this.state,
    };
    this.valid_form_success = false;
    this.text_validation = null;
    this.departamentService.editDepartament(data, this.departament_id).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.text_validation = resp.message_text;
        return;
      }
      this.valid_form_success = true;
      setTimeout(() => {
        this.router.navigateByUrl('/departaments-m/list-departament');
      }, 2000);
    })
  }
}
