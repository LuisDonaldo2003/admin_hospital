import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsService, Doctor, Especialidad, TipoTurno } from '../../service/appointments.service';

import { GeneralMedicalService } from '../../general-medical/service/general-medical.service';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-edit-doctor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './edit-doctor.component.html',
  styleUrls: ['./edit-doctor.component.scss']
})
export class EditDoctorComponent implements OnInit {

  @Input() isEditMode: boolean = true;
  doctorId: number | null = null;

  // Propiedades del formulario simplificado
  nombre_completo: string = '';
  especialidad_id: number = 0;
  general_medical_id: number = 0;
  turno: TipoTurno = 'Matutino';

  // Horarios
  hora_inicio_matutino: string = '08:00';
  hora_fin_matutino: string = '14:00';
  hora_inicio_vespertino: string = '14:00';
  hora_fin_vespertino: string = '20:00';

  // Control del formulario
  submitted = false;
  loading = false;

  // Listas
  especialidades: Especialidad[] = [];
  generalMedicals: any[] = [];
  turnosDisponibles: TipoTurno[] = ['Matutino', 'Vespertino', 'Mixto'];

  // Flags de UI
  showSpecialist: boolean = false;
  showGeneral: boolean = false;

  // Mensajes
  text_success: string = '';
  text_validation: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private appointmentsService: AppointmentsService,
    private generalMedicalService: GeneralMedicalService,
    public authService: AuthService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    this.determineFilters();

    // Detectar si estamos en modo edición por la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.doctorId = +params['id'];
        this.loadDoctorData(this.doctorId);
      }
    });
  }

  determineFilters(): void {
    const canSpecialist = this.authService.hasPermission('appointments_add_especialidad');
    const canGeneral = this.authService.hasPermission('appointments_add_general_medical');

    if (canSpecialist && !canGeneral) {
      this.showSpecialist = true;
      this.showGeneral = false;
      this.loadEspecialidades();
    } else if (canGeneral && !canSpecialist) {
      this.showSpecialist = false;
      this.showGeneral = true;
      this.loadGeneralMedicals();
    } else {
      // Admin o ambos
      this.showSpecialist = true;
      this.showGeneral = true;
      this.loadEspecialidades();
      this.loadGeneralMedicals();
    }
  }

  loadDoctorData(id: number): void {
    this.loading = true;
    this.appointmentsService.getDoctor(id).subscribe({
      next: (response: any) => {
        const doctor = response.data;
        this.nombre_completo = doctor.nombre_completo;
        this.especialidad_id = doctor.especialidad_id;
        this.general_medical_id = doctor.general_medical_id || 0;
        this.turno = doctor.turno;
        this.hora_inicio_matutino = doctor.hora_inicio_matutino || '08:00';
        this.hora_fin_matutino = doctor.hora_fin_matutino || '14:00';
        this.hora_inicio_vespertino = doctor.hora_inicio_vespertino || '14:00';
        this.hora_fin_vespertino = doctor.hora_fin_vespertino || '20:00';
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading doctor:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Cargar especialidades
   */
  loadEspecialidades(): void {
    this.appointmentsService.listEspecialidades().subscribe({
      next: (response) => {
        if (response.success) {
          this.especialidades = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar especialidades:', error);
      }
    });
  }

  loadGeneralMedicals(): void {
    this.generalMedicalService.listGeneralMedicals().subscribe({
      next: (resp) => {
        if (resp.success) this.generalMedicals = resp.data.filter(g => g.activo);
      }
    });
  }

  /**
   * Validar formulario
   */
  validateForm(): boolean {
    if (!this.nombre_completo || !this.nombre_completo.trim()) {
      return false;
    }

    // Validar según rol
    if (this.showSpecialist && (!this.especialidad_id || this.especialidad_id === 0)) {
      // En caso de Admin, puede que haya llenado el otro. 
      // Si showSpecialist y showGeneral son true (Admin), se debiera exigir al menos uno?
      // Asumiremos: Si es Admin, debe elegir una especialidad SI NO ha elegido general (y viceversa?)
      // O más simple: Si tiene permiso de especialista, debe llenar especialidad.
      // Pero el requerimiento dice que Admin puede ver ambos filtros en listado.
      // Al crear doctor, un Admin debería poder asignar especialidad O general.

      if (this.showGeneral) {
        // Es admin: validamos que tenga AL MENOS UNO
        if ((!this.especialidad_id || this.especialidad_id === 0) && (!this.general_medical_id || this.general_medical_id === 0)) {
          return false;
        }
      } else {
        // Solo especialista
        return false;
      }
    }

    if (this.showGeneral && !this.showSpecialist && (!this.general_medical_id || this.general_medical_id === 0)) {
      return false;
    }

    if (!this.turno) {
      return false;
    }

    // Validar horarios según turno
    if (this.turno === 'Matutino' || this.turno === 'Mixto') {
      if (!this.hora_inicio_matutino || !this.hora_fin_matutino) {
        return false;
      }
      if (this.hora_inicio_matutino >= this.hora_fin_matutino) {
        this.text_validation = this.translate.instant('APPOINTMENTS.EDIT_DOCTOR.INVALID_SCHEDULE');
        return false;
      }
    }

    if (this.turno === 'Vespertino' || this.turno === 'Mixto') {
      if (!this.hora_inicio_vespertino || !this.hora_fin_vespertino) {
        return false;
      }
      if (this.hora_inicio_vespertino >= this.hora_fin_vespertino) {
        this.text_validation = this.translate.instant('APPOINTMENTS.EDIT_DOCTOR.INVALID_SCHEDULE');
        return false;
      }
    }

    return true;
  }

  /**
   * Formatea tiempo de HH:MM:SS a HH:MM (formato H:i requerido por Laravel)
   */
  private formatTimeToHi(time: string): string {
    if (!time) return '';
    // Si el tiempo ya tiene el formato correcto (HH:MM), devolverlo tal cual
    if (time.length === 5 && time.match(/^\d{2}:\d{2}$/)) {
      return time;
    }
    // Si tiene segundos (HH:MM:SS), eliminarlos
    return time.substring(0, 5);
  }

  /**
   * Guardar doctor
   */
  save(): void {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    if (!this.validateForm()) {
      this.text_validation = this.translate.instant('COMMON.FILL_REQUIRED_FIELDS');
      return;
    }

    this.loading = true;

    const doctorData: any = {
      nombre_completo: this.nombre_completo.trim(),
      turno: this.turno,
      activo: true
    };

    if (this.especialidad_id) {
      doctorData.especialidad_id = this.especialidad_id;
    }

    if (this.general_medical_id) {
      doctorData.general_medical_id = this.general_medical_id;
    }
    // Limpiar si no aplica el contexto? Mejor enviar lo que esté setedo.
    // Si el usuario cambia de rol, podría enviar datos basura, pero el backend debiera ignorarlos o validarlos.

    // Agregar horarios según el turno (formato H:i sin segundos)
    if (this.turno === 'Matutino' || this.turno === 'Mixto') {
      doctorData.hora_inicio_matutino = this.formatTimeToHi(this.hora_inicio_matutino);
      doctorData.hora_fin_matutino = this.formatTimeToHi(this.hora_fin_matutino);
    }

    if (this.turno === 'Vespertino' || this.turno === 'Mixto') {
      doctorData.hora_inicio_vespertino = this.formatTimeToHi(this.hora_inicio_vespertino);
      doctorData.hora_fin_vespertino = this.formatTimeToHi(this.hora_fin_vespertino);
    }



    const request = this.isEditMode && this.doctorId
      ? this.appointmentsService.updateDoctor(this.doctorId, doctorData)
      : this.appointmentsService.storeDoctor(doctorData);

    request.subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          const successKey = this.isEditMode ? 'APPOINTMENTS.EDIT_DOCTOR.UPDATE_SUCCESS' : 'APPOINTMENTS.EDIT_DOCTOR.SUCCESS';
          this.text_success = this.translate.instant(successKey);
          setTimeout(() => {
            this.router.navigate(['/medical/appointments/list-doctors']); // Corregida la ruta de redirección
          }, 1500);
        } else {
          this.text_validation = response.message || this.translate.instant('COMMON.ERROR_OCCURRED');
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al guardar doctor:', error);
        console.error('Datos enviados:', doctorData);
        console.error('Errores específicos del backend:', JSON.stringify(error.error, null, 2));

        // Mostrar errores de validación específicos
        if (error.error?.errors) {
          const errors = error.error.errors;
          console.table(errors); // Mostrar errores en tabla
          const errorMessages = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`);
          this.text_validation = errorMessages.join(' | ');
        } else {
          this.text_validation = error.error?.message || this.translate.instant('COMMON.ERROR_OCCURRED');
        }
      }
    });
  }

  /**
   * Cancelar y volver al listado
   */
  goToList(): void {
    this.router.navigate(['/medical/appointments/list_doctor']);
  }

  /**
   * Permitir solo letras y espacios
   */
  onNameKeyPress(event: KeyboardEvent): void {
    const charCode = event.charCode;
    const char = String.fromCharCode(charCode);
    const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;

    if (!pattern.test(char)) {
      event.preventDefault();
    }
  }

  /**
   * Permitir solo números
   */
  onNumberKeyPress(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  /**
   * Manejar cambio de turno
   */
  onTurnoChange(): void {
    // Resetear validaciones
    this.text_validation = '';
  }
}
