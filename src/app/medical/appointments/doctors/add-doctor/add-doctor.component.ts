import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsService, Doctor, TipoTurno, AppointmentServiceType } from '../../service/appointments.service';
import { AppointmentServicesService } from '../../service/appointment-services.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';
import { PermissionService } from 'src/app/shared/services/permission.service';

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

  // Propiedades del formulario
  nombre_completo: string = '';
  appointment_service_id: number = 0; // NUEVO: Servicio seleccionado
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
  servicios: AppointmentServiceType[] = []; // Lista de servicios de citas
  turnosDisponibles: any[] = [
    { value: 'Matutino', label: 'Matutino' },
    { value: 'Vespertino', label: 'Vespertino' },
    { value: 'Mixto', label: 'Jornada Acumulada' }
  ];

  // Mensajes
  text_success: string = '';
  text_validation: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private appointmentsService: AppointmentsService,
    private appointmentServicesService: AppointmentServicesService, // NUEVO
    private driverTourService: DriverTourService,
    private permissionService: PermissionService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    this.loadServicios(); // Cargar servicios disponibles

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
        this.appointment_service_id = doctor.appointment_service_id || 0;
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
   * Cargar servicios de citas disponibles (solo los asignados al usuario)
   */
  loadServicios(): void {
    this.appointmentServicesService.listAccessible().subscribe({
      next: (response) => {
        if (response.success) {
          this.servicios = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  /**
   * Valida el formulario antes de enviar
   */
  validateForm(): boolean {
    const missingFields: string[] = [];

    if (!this.nombre_completo || this.nombre_completo.trim() === '') {
      missingFields.push(this.translate.instant('APPOINTMENTS.ADD_DOCTOR.FULL_NAME'));
    }

    if (!this.appointment_service_id || this.appointment_service_id === 0) {
      missingFields.push('Servicio de cita');
    }

    if (!this.turno) {
      missingFields.push(this.translate.instant('APPOINTMENTS.ADD_DOCTOR.SHIFT'));
    }

    // Validar horarios según el turno
    if (this.turno === 'Matutino' || this.turno === 'Mixto' || this.turno === 'Jornada Acumulada') {
      if (!this.hora_inicio_matutino || !this.hora_fin_matutino) {
        missingFields.push(this.translate.instant('APPOINTMENTS.ADD_DOCTOR.MORNING_HOURS'));
      }
    }

    if (this.turno === 'Vespertino' || this.turno === 'Mixto' || this.turno === 'Jornada Acumulada') {
      if (!this.hora_inicio_vespertino || !this.hora_fin_vespertino) {
        missingFields.push(this.translate.instant('APPOINTMENTS.ADD_DOCTOR.AFTERNOON_HOURS'));
      }
    }

    if (missingFields.length > 0) {
      const campos = missingFields.join(', ');
      this.text_validation = this.translate.instant('FIELDS_MISSING', {
        plural: missingFields.length > 1 ? 'n' : '',
        sPlural: missingFields.length > 1 ? 's' : '',
        campos
      });
      return false;
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
   * Guarda el doctor (Create o Update según isEditMode)
   */
  saveDoctor(): void {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    if (!this.validateForm()) {
      return;
    }

    const doctorData: Partial<Doctor> = {
      nombre_completo: this.nombre_completo,
      appointment_service_id: this.appointment_service_id,
      turno: this.turno,
      hora_inicio_matutino: this.formatTimeToHi(this.hora_inicio_matutino),
      hora_fin_matutino: this.formatTimeToHi(this.hora_fin_matutino),
      hora_inicio_vespertino: this.formatTimeToHi(this.hora_inicio_vespertino),
      hora_fin_vespertino: this.formatTimeToHi(this.hora_fin_vespertino),
      activo: true
    };

    this.loading = true;

    if (this.isEditMode && this.doctorId) {
      this.appointmentsService.updateDoctor(this.doctorId, doctorData as Doctor).subscribe({
        next: (response: any) => {
          this.text_success = this.translate.instant('APPOINTMENTS.ADD_DOCTOR.UPDATE_SUCCESS');
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/appointments/list_doctor']);
          }, 1500);
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || this.translate.instant('ERROR_OCCURRED');
          this.text_validation = errorMsg;
          this.loading = false;
        }
      });
    } else {
      this.appointmentsService.storeDoctor(doctorData as Doctor).subscribe({
        next: (response: any) => {
          this.text_success = this.translate.instant('APPOINTMENTS.ADD_DOCTOR.SUCCESS');
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/appointments/list_doctor']);
          }, 1500);
        },
        error: (error: any) => {
          const errorMsg = error.error?.message || this.translate.instant('ERROR_OCCURRED');
          this.text_validation = errorMsg;
          this.loading = false;
        }
      });
    }
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
   * Manejar cambio de turno
   */
  onTurnoChange(): void {
    // Resetear validaciones
    this.text_validation = '';
  }
}
