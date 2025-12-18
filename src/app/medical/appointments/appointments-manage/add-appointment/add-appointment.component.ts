import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsService, Appointment, Doctor, TimeSlot, EstadoCita } from '../../service/appointments.service';
import { AppointmentServicesService } from '../../service/appointment-services.service';
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
  nombre_paciente: string = '';
  fecha_nacimiento: string = '';
  numero_cel: string = '';
  procedencia: string = '';
  tipo_cita: 'Primera vez' | 'Subsecuente' | '' = '';
  turno: 'Matutino' | 'Vespertino' | 'Jornada Acumulada' | '' = '';

  // Selección de servicio unificado
  service_id: number = 0;
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
  user: any;

  // Listas
  services: any[] = []; // Unified services
  doctoresDisponibles: Doctor[] = [];
  horariosDisponibles: TimeSlot[] = [];

  // Mensajes
  text_success: string = '';
  text_validation: string = '';

  // Estados disponibles
  estadosDisponibles: EstadoCita[] = ['Programada', 'Confirmada'];

  // Tipos de cita y turnos
  tiposCita: ('Primera vez' | 'Subsecuente')[] = ['Primera vez', 'Subsecuente'];
  turnos: ('Matutino' | 'Vespertino' | 'Jornada Acumulada')[] = ['Matutino', 'Vespertino', 'Jornada Acumulada'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private appointmentsService: AppointmentsService,
    private appointmentServicesService: AppointmentServicesService,
    private driverTourService: DriverTourService,
    public authService: AuthService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
    this.fecha = this.getMinDate();
  }

  ngOnInit(): void {
    this.user = this.authService.user;
    this.loadServices();

    if (this.user && this.user.doctor_id) {
      this.setupDoctorMode(this.user.doctor_id);
    }
  }

  setupDoctorMode(doctorId: number): void {
    // 1. Obtener detalles del doctor vinculado
    this.appointmentsService.getDoctor(doctorId).subscribe({
      next: (resp: any) => {
        if (resp.success && resp.data) {
          const doctor = resp.data;

          // 2. Asignar Servicio y Turno (Auto-configuración)
          this.service_id = doctor.appointment_service_id || 0;
          this.turno = doctor.turno;

          // 3. Cargar Doctores del servicio secuencialmente
          this.loadingDoctors = true;
          this.appointmentsService.listDoctors({ appointment_service_id: this.service_id }).subscribe({
            next: (r2: any) => {
              this.loadingDoctors = false;
              if (r2.success && r2.data) {
                // Filtrar por activo y turno (misma lógica que loadDoctorsByService)
                this.doctoresDisponibles = r2.data.filter((d: Doctor) => {
                  const isActive = d.activo;
                  const matchesTurno = !this.turno || d.turno === this.turno || d.turno === 'Mixto';
                  return isActive && matchesTurno;
                });

                // 4. Seleccionar al doctor actual (Yo)
                // Usar == para comparar string/number por si acaso
                const me = this.doctoresDisponibles.find(d => d.id == doctorId);
                if (me) {
                  this.doctor_id = doctorId;
                  this.text_validation = ''; // Limpiar errores

                  // Cargar horarios si hay fecha
                  if (this.fecha) {
                    this.loadHorarios();
                  }
                } else {
                  this.text_validation = "Advertencia: Tu doctor no aparece disponible en este servicio o turno (verifique que esté Activo).";
                }
              }
            },
            error: (err) => {
              this.loadingDoctors = false;
              console.error(err);
            }
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  getMinDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public startAddAppointmentTour(): void {
    this.driverTourService.startAddAppointmentTour();
  }

  loadServices(): void {
    this.appointmentServicesService.listAccessible().subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.services = resp.data.filter((s: any) => s.activo);
        }
      },
      error: (error) => {
        console.error('Error al cargar servicios', error);
      }
    });
  }

  onServiceChange(): void {
    this.doctor_id = 0;
    this.hora_inicio = '';
    this.horariosDisponibles = [];
    this.doctoresDisponibles = [];

    if (this.service_id && this.service_id !== 0) {
      this.loadDoctorsByService();
    }
  }

  onTurnoChange(): void {
    this.doctor_id = 0;
    this.hora_inicio = '';
    this.horariosDisponibles = [];

    // Si ya hay servicio, recargar doctores para aplicar filtro de turno
    if (this.service_id) {
      this.loadDoctorsByService();
    }
  }

  loadDoctorsByService(): void {
    if (!this.service_id) return;

    this.loadingDoctors = true;
    this.doctoresDisponibles = [];

    // Usamos el servicio unificado
    // El backend filtra por appointment_service_id
    this.appointmentsService.listDoctors({ appointment_service_id: this.service_id }).subscribe({
      next: (response) => {
        this.loadingDoctors = false;
        if (response.success && response.data) {
          // Filtrar por activo Y por turno seleccionado
          this.doctoresDisponibles = response.data.filter(d => {
            const isActive = d.activo;
            const matchesTurno = !this.turno || d.turno === this.turno || d.turno === 'Mixto';
            return isActive && matchesTurno;
          });

          if (this.doctoresDisponibles.length === 0) {
            this.text_validation = this.turno
              ? `No hay doctores disponibles para este servicio en el turno ${this.turno}`
              : 'No hay doctores disponibles para este servicio';
          }
        }
      },
      error: (error) => {
        this.loadingDoctors = false;
        this.text_validation = 'Error al cargar doctores';
      }
    });
  }

  onDoctorOrFechaChange(): void {
    this.hora_inicio = '';
    this.horariosDisponibles = [];

    if (this.doctor_id && this.doctor_id !== 0 && this.fecha) {
      this.loadHorarios();
    }
  }

  loadHorarios(): void {
    const doctor = this.doctoresDisponibles.find(d => d.id == this.doctor_id); // == loose for string/num
    if (!doctor) return;

    this.loadingHorarios = true;
    this.appointmentsService.getHorariosDisponibles(this.doctor_id, this.fecha).subscribe({
      next: (response) => {
        this.loadingHorarios = false;
        if (response.success) {
          this.horariosDisponibles = response.data.slots.filter(slot => slot.disponible);
        }
      },
      error: (error) => {
        this.loadingHorarios = false;
        console.error('Error loading schedules', error);
      }
    });
  }

  validateForm(): boolean {
    if (!this.folio_expediente || !this.folio_expediente.trim()) return false;
    if (!this.nombre_paciente || !this.nombre_paciente.trim()) return false;
    if (!this.fecha_nacimiento) return false;
    if (!this.numero_cel || !this.numero_cel.trim()) return false;
    if (!this.procedencia || !this.procedencia.trim()) return false;
    if (!this.tipo_cita) return false;
    if (!this.turno) return false;
    if (!this.service_id || this.service_id === 0) return false; // Validar servicio
    if (!this.doctor_id || this.doctor_id === 0) return false;
    if (!this.fecha) return false;
    if (!this.hora_inicio) return false;
    if (!this.motivo_consulta || !this.motivo_consulta.trim()) return false;
    return true;
  }

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
      paciente_nombre: this.nombre_paciente.trim(),
      fecha_nacimiento: this.fecha_nacimiento,
      numero_cel: this.numero_cel.trim(),
      procedencia: this.procedencia.trim(),
      tipo_cita: this.tipo_cita,
      turno: this.turno,
      doctor_id: this.doctor_id,
      fecha: this.fecha,
      hora: this.hora_inicio,
      motivo: this.motivo_consulta.trim(),
      estado: this.mapEstadoToBackend(this.estado)
    };

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

  mapEstadoToBackend(estado: EstadoCita): string {
    const estadosMap: Record<string, string> = {
      'Programada': 'pendiente',
      'Confirmada': 'confirmada',
      'En curso': 'en_curso',
      'Completada': 'completada',
      'Cancelada': 'cancelada',
      'No asistió': 'no_asistio'
    };
    return estadosMap[estado] || 'pendiente';
  }

  goToList(): void {
    this.router.navigate(['/appointments/list_appointment']);
  }

  getHoraFin(): string {
    if (!this.hora_inicio) return '';
    return this.appointmentsService.calcularHoraFin(this.hora_inicio);
  }

  formatTimeAMPM(timeString: string): string {
    if (!timeString) return '';
    const parts = timeString.split(':');
    if (parts.length < 2) return timeString;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) hours = 12;
    else if (hours > 12) hours = hours - 12;
    return `${hours}:${minutes} ${period}`;
  }

  onFolioKeyPress(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
