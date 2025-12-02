// Importación de módulos y servicios necesarios para el componente de edición de staff
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StaffService } from '../service/staff.service';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

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
  /**
   * Banderas y datos para controlar las alertas desde la plantilla
   */
  public showValidation: boolean = false;
  public showSuccess: boolean = false;
  public validationType: 'missing' | 'permission' | 'none' = 'none';
  public missingFields: string[] = [];
  public backendErrorText: string = '';
  /**
   * Bandera para indicar si el formulario fue enviado
   */
  public submitted: boolean = false;

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
    private translate: TranslateService,
    private router: Router,
    private driverTourService: DriverTourService
  ) {}

  /**
   * Inicia el tour guiado del formulario de editar staff
   */
  public startEditStaffTour(): void {
    this.driverTourService.startEditStaffTour();
  }

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
        const fullName = this.staff_selected.name ?? '';
        const providedSurname = this.staff_selected.surname ?? '';

        // Si el backend no separó apellido (apellido vacío) y el nombre contiene espacios,
        // inferimos: primera palabra => nombre, resto => apellido.
        if ((!providedSurname || String(providedSurname).trim() === '') && fullName && fullName.includes(' ')) {
          const parts = String(fullName).trim().split(/\s+/);
          this.name = parts.shift() || '';
          this.surname = parts.join(' ') || '';
        } else {
          // Uso directo cuando el backend ya provee nombre y apellido por separado
          this.name = fullName;
          this.surname = providedSurname;
        }

        this.email = this.staff_selected.email ?? '';
      });
    });
  }

  /**
   * Guarda los cambios realizados al usuario, validando los campos y enviando los datos al backend
   */
  save() {
    this.submitted = true;
    this.showValidation = false;
    this.showSuccess = false;
    this.validationType = 'none';
    this.missingFields = [];
    this.backendErrorText = '';

    // Arreglo para campos faltantes
    const missingFields: string[] = [];

    // Validación de campos obligatorios (guardamos claves de traducción, la plantilla las traducirá)
    if (!(`${this.name ?? ''}`.trim())) missingFields.push('STAFF.EDIT_STAFF.FIRST_NAME');
    if (!(`${this.surname ?? ''}`.trim())) missingFields.push('STAFF.EDIT_STAFF.SURNAME');
    if (!(`${this.email ?? ''}`.trim())) missingFields.push('STAFF.EDIT_STAFF.EMAIL');
    if (!this.selectedValue) missingFields.push('STAFF.EDIT_STAFF.ROLE_SELECT');

    // Si hay campos faltantes, activa la validación y delega el mensaje al HTML
    if (missingFields.length > 0) {
      this.missingFields = missingFields;
      this.showValidation = true;
      this.validationType = 'missing';
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
        this.showValidation = true;
        this.validationType = 'permission';
        this.backendErrorText = resp.message_text || '';
      } else {
        // Si la edición fue exitosa, activa la alerta de éxito y refresca los datos del usuario
        this.showSuccess = true;
        // Refresca los datos del usuario tras guardar
        this.staffService.showUser(this.staff_id).subscribe((resp: any) => {
          this.staff_selected = resp.user;
          this.selectedValue = this.staff_selected.role?.id?.toString() ?? '';
          this.name = this.staff_selected.name ?? '';
          this.surname = this.staff_selected.surname ?? '';
          this.email = this.staff_selected.email ?? '';
        });
        // Redirige al listado después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/staffs/list-staff']);
        }, 2000);
      }
    });
  }
}
