// Importación de módulos y servicios necesarios para el componente de agregar staff
import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StaffService } from '../service/staff.service';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Componente para agregar un nuevo miembro del staff.
 * Incluye formulario, validaciones y registro vía servicio.
 */
@Component({
  selector: 'app-add-staff-n',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSelectModule,
    MatOptionModule,
    TranslateModule
  ],
  templateUrl: './add-staff-n.component.html',
  styleUrls: ['./add-staff-n.component.scss']
})
export class AddStaffNComponent {
  /**
   * Nombre del nuevo staff
   */
  public name: string = '';
  /**
   * Apellido del nuevo staff
   */
  public surname: string = '';
  /**
   * Correo electrónico del nuevo staff
   */
  public email: string = '';
  /**
   * Contraseña del nuevo staff
   */
  public password: string = '';
  /**
   * Confirmación de la contraseña
   */
  public password_confirmation: string = '';
  /**
   * Rol seleccionado para el nuevo staff
   */
  public selectedValue: string = '';

  /**
   * Lista de roles disponibles para seleccionar
   */
  public roles: any = [];
  /**
   * Banderas y datos para controlar las alertas desde la plantilla
   */
  public showValidation: boolean = false;
  public showSuccess: boolean = false;
  public validationType: 'missing' | 'password_mismatch' | 'permission' | 'none' = 'none';
  public missingFields: string[] = [];
  public backendErrorText: string = '';
  /**
   * Bandera para indicar si el formulario fue enviado
   */
  public submitted: boolean = false;

  /**
   * Constructor que inyecta el servicio de staff, router y traducción
   */
  constructor(
    public staffservice: StaffService,
    private router: Router,
    private translate: TranslateService
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los roles disponibles y aplica el modo oscuro si está activado
   */
  ngOnInit(): void {
    // Obtiene la lista de roles desde el servicio
    this.staffservice.listConfig().subscribe((resp: any) => {
      this.roles = resp.roles ?? [];
    });

    // Aplica el modo oscuro si está activado en localStorage
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }
  }

  /**
   * Guarda el nuevo staff, validando los campos y enviando los datos al backend
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

    // Validación de campos obligatorios (guardamos las claves de traducción, la plantilla las traducirá)
    if (!this.name.trim()) missingFields.push('STAFF.ADD_STAFF.FIRST_NAME');
    if (!this.surname.trim()) missingFields.push('STAFF.ADD_STAFF.SURNAME');
    if (!this.email.trim()) missingFields.push('STAFF.ADD_STAFF.EMAIL');
    if (!this.password.trim()) missingFields.push('STAFF.ADD_STAFF.PASSWORD');
    if (!this.password_confirmation.trim()) missingFields.push('STAFF.ADD_STAFF.CONFIRM_PASSWORD');
    if (!this.selectedValue) missingFields.push('STAFF.ADD_STAFF.ROLE_SELECT');

    // Si hay campos faltantes, activa la validación y delega el mensaje al HTML
    if (missingFields.length > 0) {
      this.missingFields = missingFields;
      this.showValidation = true;
      this.validationType = 'missing';
      return;
    }

    // Validación de coincidencia de contraseñas
    if (this.password !== this.password_confirmation) {
      this.showValidation = true;
      this.validationType = 'password_mismatch';
      return;
    }

    // Prepara los datos del formulario para enviar al backend
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('password_confirmation', this.password_confirmation);
    formData.append('role_id', this.selectedValue);

    // Envía la solicitud de registro al servicio
    this.staffservice.registerUser(formData).subscribe((resp: any) => {
      // Si el backend responde con error de permisos
      if (resp.message === 403) {
        this.showValidation = true;
        this.validationType = 'permission';
        this.backendErrorText = resp.message_text || '';
      } else {
        // Si el registro fue exitoso, activa el indicador de éxito (plantilla mostrará el texto)
        this.showSuccess = true;

        setTimeout(() => {
          this.router.navigate(['/staffs/list-staff']);
        }, 1000);
      }
    });
  }
}
