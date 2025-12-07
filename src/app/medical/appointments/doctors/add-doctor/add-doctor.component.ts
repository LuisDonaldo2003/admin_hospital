    import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsService, Doctor, Especialidad, TipoTurno } from '../../service/appointments.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-add-doctor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './add-doctor.component.html',
  styleUrls: ['./add-doctor.component.scss']
})
export class AddDoctorComponent implements OnInit {

  @Input() isEditMode: boolean = false;
  doctorId: number | null = null;

  // Propiedades del formulario simplificado
  nombre_completo: string = '';
  especialidad_id: number = 0;
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
  turnosDisponibles: TipoTurno[] = ['Matutino', 'Vespertino', 'Mixto'];

  // Mensajes
  text_success: string = '';
  text_validation: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private appointmentsService: AppointmentsService,
    private driverTourService: DriverTourService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    this.loadEspecialidades();
    
    // Detectar si estamos en modo edición por la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.doctorId = +params['id'];
        this.loadDoctorData(this.doctorId);
      }
    });
  }

  /**
   * Inicia el tour guiado del formulario
   */
  startTour(): void {
    this.driverTourService.startAddDoctorTour();
  }
  
  loadDoctorData(id: number): void {
    this.loading = true;
    this.appointmentsService.getDoctor(id).subscribe({
      next: (response: any) => {
        const doctor = response.data;
        this.nombre_completo = doctor.nombre_completo;
        this.especialidad_id = doctor.especialidad_id;
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

  /**
   * Validar formulario
   */
  validateForm(): boolean {
    if (!this.nombre_completo || !this.nombre_completo.trim()) {
      return false;
    }

    if (!this.especialidad_id || this.especialidad_id === 0) {
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
        this.text_validation = this.translate.instant('APPOINTMENTS.ADD_DOCTOR.INVALID_SCHEDULE');
        return false;
      }
    }

    if (this.turno === 'Vespertino' || this.turno === 'Mixto') {
      if (!this.hora_inicio_vespertino || !this.hora_fin_vespertino) {
        return false;
      }
      if (this.hora_inicio_vespertino >= this.hora_fin_vespertino) {
        this.text_validation = this.translate.instant('APPOINTMENTS.ADD_DOCTOR.INVALID_SCHEDULE');
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
      especialidad_id: this.especialidad_id,
      turno: this.turno,
      activo: true
    };

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
          const successKey = this.isEditMode ? 'APPOINTMENTS.ADD_DOCTOR.UPDATE_SUCCESS' : 'APPOINTMENTS.ADD_DOCTOR.SUCCESS';
          this.text_success = this.translate.instant(successKey);
          setTimeout(() => {
            this.router.navigate(['/appointments/list_doctor']);
          }, 1500);
        } else {
          this.text_validation = response.message || this.translate.instant('COMMON.ERROR_OCCURRED');
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al guardar doctor:', error);
        console.error('Datos enviados:', doctorData);
        
        // Mostrar errores de validación específicos
        if (error.error?.errors) {
          const errors = error.error.errors;
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
    this.router.navigate(['/appointments/list_doctor']);
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
