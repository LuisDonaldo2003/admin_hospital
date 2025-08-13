// Importación de módulos y servicios necesarios para el componente de edición de staff
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StaffService } from '../service/staff.service';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

/**
 * Componente para editar los datos de un miembro del staff.
 * Permite cargar, mostrar y actualizar la información de un usuario.
 */
@Component({
  selector: 'app-edit-staff-n',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './edit-staff-n.component.html',
  styleUrl: './edit-staff-n.component.scss'
})
export class EditStaffNComponent {
  /**
   * Rol seleccionado para el staff editado
   */
  public selectedValue!: string;
  /**
   * Nombre del staff editado
   */
  public name: string = '';
  /**
   * Apellido del staff editado
   */
  public surname: string = '';
  /**
   * Correo electrónico del staff editado
   */
  public email: string = '';

  /**
   * Lista de roles disponibles para seleccionar
   */
  public roles: any = [];

  /**
   * Mensaje de éxito tras la edición
   */
  public text_success: string = '';
  /**
   * Mensaje de validación de campos
   */
  public text_validation: string = '';

  /**
   * ID del staff a editar
   */
  public staff_id: any;
  /**
   * Objeto con los datos del staff seleccionado
   */
  public staff_selected: any;

  /**
   * Constructor que inyecta el servicio de staff, ruta activa y traducción
   */
  constructor(
    public staffService: StaffService,
    public activedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los roles y los datos del usuario a editar
   */
  ngOnInit(): void {
    // Obtiene el parámetro id de la ruta
    this.activedRoute.params.subscribe((resp: any) => {
      this.staff_id = resp.id;
    });

    // Carga la lista de roles y luego los datos del usuario
    this.staffService.listConfig().subscribe((resp: any) => {
      // Convierte los ids de roles a string para el binding
      this.roles = (resp.roles ?? []).map((r: any) => ({
        ...r,
        id: r.id.toString()
      }));

      // Carga los datos del usuario seleccionado
      this.staffService.showUser(this.staff_id).subscribe((resp: any) => {
        this.staff_selected = resp.user;

        // Asigna los datos del usuario a los campos del formulario
        this.selectedValue = this.staff_selected.role?.id?.toString() ?? '';
        this.name = this.staff_selected.name ?? '';
        this.surname = this.staff_selected.surname ?? '';
        this.email = this.staff_selected.email ?? '';
      });
    });
  }

  /**
   * Guarda los cambios realizados al usuario, validando los campos y enviando los datos al backend
   */
  save() {
    this.text_validation = '';
    this.text_success = '';

    // Arreglo para campos faltantes
    const missingFields: string[] = [];

    // Validación de campos obligatorios
    if (!(`${this.name ?? ''}`.trim())) missingFields.push(this.translate.instant('NAME'));
    if (!(`${this.surname ?? ''}`.trim())) missingFields.push(this.translate.instant('SURNAME'));
    if (!(`${this.email ?? ''}`.trim())) missingFields.push(this.translate.instant('EMAIL'));
    if (!this.selectedValue) missingFields.push(this.translate.instant('ROLE'));

    // Si hay campos faltantes, muestra mensaje de validación
    if (missingFields.length > 0) {
      const plural = missingFields.length > 1;
      const campos = missingFields.join(', ');
      this.text_validation = this.translate.instant('FIELDS_MISSING', {
        plural: plural ? 'n' : '',
        sPlural: plural ? 's' : '',
        campos
      });
      return;
    }

    // Prepara los datos del formulario para enviar al backend
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('email', this.email);
    formData.append('role_id', this.selectedValue);

    // Envía la solicitud de actualización al servicio
    this.staffService.updateUser(this.staff_id, formData).subscribe((resp: any) => {
      // Si el backend responde con error de permisos
      if (resp.message === 403) {
        this.text_validation = resp.message_text;
      } else {
        // Si la edición fue exitosa, muestra mensaje y refresca los datos del usuario
        this.text_success = this.translate.instant('USER_UPDATED_SUCCESS');
        // Refresca los datos del usuario tras guardar
        this.staffService.showUser(this.staff_id).subscribe((resp: any) => {
          this.staff_selected = resp.user;
          this.selectedValue = this.staff_selected.role?.id?.toString() ?? '';
          this.name = this.staff_selected.name ?? '';
          this.surname = this.staff_selected.surname ?? '';
          this.email = this.staff_selected.email ?? '';
        });
      }
    });
  }
}
