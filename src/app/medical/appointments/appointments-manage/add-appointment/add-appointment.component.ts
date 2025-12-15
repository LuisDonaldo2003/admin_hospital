import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsService, Appointment, Doctor, Especialidad, TimeSlot, EstadoCita } from '../../service/appointments.service';
import { GeneralMedicalService, GeneralMedical } from '../../general-medical/service/general-medical.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-add-appointment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddAppointmentComponent implements OnInit {

  // Propiedades del formulario
  folio_expediente: string = '';
  nombre_paciente: string = ''; // Campo de texto libre
  fecha_nacimiento: string = '';
  numero_cel: string = '';
  procedencia: string = '';
  tipo_cita: 'Primera vez' | 'Subsecuente' | '' = '';
  turno: 'Matutino' | 'Vespertino' | '' = '';

  // Selección de servicio
  service_type: 'general' | 'specialist' = 'specialist';
  showSpecialist: boolean = true;
  showGeneral: boolean = true;
  user: any;

  especialidad_id: number = 0;
  general_medical_id: number = 0;
  doctor_id: number = 0;
  fecha: string = '';
  hora_inicio: string = '';
  motivo_consulta: string = '';
  estado: EstadoCita = 'Programada';
  notas: string = '';

  // Control del formulario
  submitted = false;
  loading = false;
  loadingDoctors = false;
  loadingHorarios = false;

  // Listas
  especialidades: Especialidad[] = [];
  generalMedicals: GeneralMedical[] = [];
  doctoresDisponibles: Doctor[] = [];

  horariosDisponibles: TimeSlot[] = [];

  // Mensajes
  text_success: string = '';
  text_validation: string = '';

  // Estados disponibles
  estadosDisponibles: EstadoCita[] = ['Programada', 'Confirmada'];

  // Tipos de cita y turnos
  tiposCita: ('Primera vez' | 'Subsecuente')[] = ['Primera vez', 'Subsecuente'];
  turnos: ('Matutino' | 'Vespertino')[] = ['Matutino', 'Vespertino'];

  /**
   * Obtener fecha mínima (hoy) en formato YYYY-MM-DD
   */
  getMinDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private appointmentsService: AppointmentsService,
    private generalMedicalService: GeneralMedicalService,
    private driverTourService: DriverTourService,
    public authService: AuthService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);

    // Establecer fecha como hoy en zona horaria local
    this.fecha = this.getMinDate();
  }

  ngOnInit(): void {
    this.user = this.authService.user;
    this.filterServiceTypesByRole();
  }

  filterServiceTypesByRole(): void {
    const canSpecialist = this.authService.hasPermission('appointments_add_especialidad');
    const canGeneral = this.authService.hasPermission('appointments_add_general_medical');

    // DEBUG: Ver qué permisos detecta
    console.log('Permisos detectados:', { canSpecialist, canGeneral });

    if (canSpecialist && !canGeneral) {
      // SOLO ESPECIALISTA
      this.showSpecialist = true;
      this.showGeneral = false;
      this.service_type = 'specialist';
      this.loadEspecialidades();
    } else if (canGeneral && !canSpecialist) {
      // SOLO GENERAL
      this.showSpecialist = false;
      this.showGeneral = true;
      this.service_type = 'general';
      this.loadGeneralMedicals();
    } else {
      // AMBOS (Admin, Director, o Configuración antigua/default)
      this.showSpecialist = true;
      this.showGeneral = true;
      // Por defecto cargar especialidades o dejar que el usuario elija
      this.loadEspecialidades();
      this.loadGeneralMedicals();
    }
  }

  /**
   * Inicia el tour guiado del formulario de agregar cita
   */
  public startAddAppointmentTour(): void {
    this.driverTourService.startAddAppointmentTour();
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
        this.text_validation = 'Error al cargar especialidades';
      }
    });
  }

  /**
   * Cargar médicos generales (categorías)
   */
  loadGeneralMedicals(): void {
    this.generalMedicalService.listGeneralMedicals().subscribe({
      next: (response) => {
        if (response.success) {
          this.generalMedicals = response.data.filter(gm => gm.activo);
        }
      },
      error: (error) => {
        // Silencioso o manejo de error suave
        console.error('Error al cargar médicos generales', error);
      }
    });
  }

  /**
   * Cambio de tipo de servicio
   */
  onServiceTypeChange(): void {
    // Resetear selecciones
    this.especialidad_id = 0;
    this.general_medical_id = 0;
    this.doctor_id = 0;
    this.hora_inicio = '';
    this.horariosDisponibles = [];
    this.doctoresDisponibles = [];
  }

  /**
   * Cuando cambia la especialidad, cargar doctores disponibles
   */
  onEspecialidadChange(): void {
    this.doctor_id = 0;
    this.hora_inicio = '';
    this.horariosDisponibles = [];

    if (this.especialidad_id && this.especialidad_id !== 0) {
      this.loadDoctoresByEspecialidad();
    } else {
      this.doctoresDisponibles = [];
    }
  }



  /**
   * Cuando cambia la categoría de médico general
   */
  onGeneralMedicalChange(): void {
    this.doctor_id = 0;
    this.hora_inicio = '';
    this.horariosDisponibles = [];

    if (this.general_medical_id && this.general_medical_id !== 0) {
      this.loadDoctoresByGeneralMedical();
    } else {
      this.doctoresDisponibles = [];
    }
  }

  /**
   * Cuando cambia el turno
   */
  onTurnoChange(): void {
    // Si ya hay especialidad o categoría médica seleccionada, recargar doctores para filtrar por el turno
    this.doctor_id = 0;
    this.hora_inicio = '';
    this.horariosDisponibles = [];

    if (this.service_type === 'specialist' && this.especialidad_id) {
      this.loadDoctoresByEspecialidad();
    } else if (this.service_type === 'general' && this.general_medical_id) {
      this.loadDoctoresByGeneralMedical();
    }
  }

  /**
   * Cargar doctores por especialidad
   */
  loadDoctoresByEspecialidad(): void {
    if (!this.especialidad_id) return;

    this.loadingDoctors = true;
    this.doctoresDisponibles = [];

    this.appointmentsService.listDoctors({ especialidad_id: this.especialidad_id }).subscribe({
      next: (response) => {
        this.loadingDoctors = false;
        if (response.success && response.data) {
          // Filtrar por activo Y por turno seleccionado (si existe)
          this.doctoresDisponibles = response.data.filter(d => {
            const isActive = d.activo;
            const matchesTurno = !this.turno || d.turno === this.turno || d.turno === 'Mixto';
            return isActive && matchesTurno;
          });

          if (this.doctoresDisponibles.length === 0) {
            this.text_validation = this.turno
              ? `No hay doctores disponibles para esta especialidad en el turno ${this.turno}`
              : 'No hay doctores disponibles para esta especialidad';
          }
        }
      },
      error: (error) => {
        this.loadingDoctors = false;
        this.text_validation = 'Error al cargar doctores';
      }
    });
  }

  /**
   * Cargar doctores por médico general
   */
  loadDoctoresByGeneralMedical(): void {
    if (!this.general_medical_id) return;

    this.loadingDoctors = true;
    this.doctoresDisponibles = [];

    this.appointmentsService.listDoctors({ general_medical_id: this.general_medical_id }).subscribe({
      next: (response) => {
        this.loadingDoctors = false;
        if (response.success && response.data) {
          // Filtrar por activo Y por turno seleccionado (si existe)
          this.doctoresDisponibles = response.data.filter(d => {
            const isActive = d.activo;
            const matchesTurno = !this.turno || d.turno === this.turno || d.turno === 'Mixto';
            return isActive && matchesTurno;
          });

          if (this.doctoresDisponibles.length === 0) {
            this.text_validation = this.turno
              ? `No hay doctores disponibles para esta categoría en el turno ${this.turno}`
              : 'No hay doctores disponibles para esta categoría';
          }
        }
      },
      error: (error) => {
        this.loadingDoctors = false;
        this.text_validation = 'Error al cargar doctores';
      }
    });
  }

  /**
   * Cuando cambia el doctor o la fecha, cargar horarios disponibles
   */
  onDoctorOrFechaChange(): void {
    this.hora_inicio = '';
    this.horariosDisponibles = [];

    if (this.doctor_id && this.fecha) {
      this.loadHorariosDisponibles();
    }
  }

  /**
   * Cargar horarios disponibles automáticamente
   */
  loadHorariosDisponibles(): void {
    this.loadingHorarios = true;
    this.appointmentsService.getHorariosDisponibles(this.doctor_id, this.fecha).subscribe({
      next: (response) => {
        this.loadingHorarios = false;
        if (response.success) {
          this.horariosDisponibles = response.data.slots.filter(slot => slot.disponible);

          if (this.horariosDisponibles.length === 0) {
            this.text_validation = this.translate.instant('APPOINTMENTS.ADD_APPOINTMENT.NO_AVAILABLE_TIMES');
          }
        }
      },
      error: (error) => {
        this.loadingHorarios = false;
        this.text_validation = this.translate.instant('APPOINTMENTS.ADD_APPOINTMENT.ERROR_LOADING_TIMES');
      }
    });
  }

  /**
   * Mapear estado del frontend al formato del backend
   */
  mapEstadoToBackend(estado: EstadoCita): string {
    const estadosMap: { [key: string]: string } = {
      'Programada': 'pendiente',
      'Confirmada': 'confirmada',
      'En curso': 'en_progreso',
      'Completada': 'completada',
      'Cancelada': 'cancelada',
      'No asistió': 'no_asistio'
    };
    return estadosMap[estado] || 'pendiente';
  }



  /**
   * Validar formulario
   */
  validateForm(): boolean {
    if (!this.folio_expediente || !this.folio_expediente.trim()) {
      return false;
    }

    if (!this.nombre_paciente || !this.nombre_paciente.trim()) {
      return false;
    }

    if (!this.fecha_nacimiento) {
      return false;
    }

    if (!this.numero_cel || !this.numero_cel.trim()) {
      return false;
    }

    if (!this.procedencia || !this.procedencia.trim()) {
      return false;
    }

    if (!this.tipo_cita) {
      return false;
    }

    if (!this.turno) {
      return false;
    }

    if (this.service_type === 'specialist') {
      if (!this.especialidad_id || this.especialidad_id === 0) {
        return false;
      }
    } else {
      if (!this.general_medical_id || this.general_medical_id === 0) {
        return false;
      }
    }

    if (!this.doctor_id || this.doctor_id === 0) {
      return false;
    }

    if (!this.fecha) {
      return false;
    }

    if (!this.hora_inicio || this.hora_inicio === '') {
      return false;
    }

    if (!this.motivo_consulta || !this.motivo_consulta.trim()) {
      return false;
    }

    return true;
  }

  /**
   * Guardar cita
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

    const appointmentData: any = {
      folio_expediente: this.folio_expediente.trim(),
      paciente_nombre: this.nombre_paciente.trim(), // Backend espera 'paciente_nombre'
      fecha_nacimiento: this.fecha_nacimiento,
      numero_cel: this.numero_cel.trim(),
      procedencia: this.procedencia.trim(),
      tipo_cita: this.tipo_cita,
      turno: this.turno,
      doctor_id: this.doctor_id,
      fecha: this.fecha,
      hora: this.hora_inicio, // Backend espera 'hora'
      motivo: this.motivo_consulta.trim(), // Backend espera 'motivo'
      estado: this.mapEstadoToBackend(this.estado) // Mapear estado al formato del backend
    };

    // Solo agregar observaciones si no está vacío
    if (this.notas && this.notas.trim()) {
      appointmentData.observaciones = this.notas.trim();
    }

    this.appointmentsService.storeAppointment(appointmentData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.text_success = this.translate.instant('APPOINTMENTS.ADD_APPOINTMENT.SUCCESS');
          setTimeout(() => {
            this.router.navigate(['/appointments/list_appointment']);
          }, 1500);
        } else {
          this.text_validation = response.message || this.translate.instant('COMMON.ERROR_OCCURRED');
        }
      },
      error: (error) => {
        this.loading = false;
        this.text_validation = error.error?.message || this.translate.instant('COMMON.ERROR_OCCURRED');
      }
    });
  }

  /**
   * Cancelar y volver al listado
   */
  goToList(): void {
    this.router.navigate(['/appointments/list_appointment']);
  }

  /**
   * Obtener hora de fin calculada (20 minutos después)
   */
  getHoraFin(): string {
    if (!this.hora_inicio) return '';
    return this.appointmentsService.calcularHoraFin(this.hora_inicio);
  }

  /**
   * Formatear slot de tiempo para mostrar
   */
  formatTimeSlot(slot: TimeSlot): string {
    return `${slot.hora_inicio} - ${slot.hora_fin}`;
  }

  /**
   * Formatear hora a formato 12 horas con AM/PM
   */
  formatTimeAMPM(timeString: string): string {
    if (!timeString) return '';

    const parts = timeString.split(':');
    if (parts.length < 2) return timeString;

    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];

    const period = hours >= 12 ? 'PM' : 'AM';

    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours = hours - 12;
    }

    return `${hours}:${minutes} ${period}`;
  }

  onFolioKeyPress(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
