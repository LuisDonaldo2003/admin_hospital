import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsService, Appointment, Doctor, Especialidad, TimeSlot, EstadoCita } from '../../service/appointments.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './edit-appointment.component.html',
  styleUrls: ['./edit-appointment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditAppointmentComponent implements OnInit {

  appointmentId: number | null = null;

  // Propiedades del formulario
  nombre_paciente: string = '';
  especialidad_id: number = 0;
  doctor_id: number = 0;
  fecha: string = '';
  hora_inicio: string = '';
  motivo_consulta: string = '';
  estado: EstadoCita = 'Programada';
  notas: string = '';
  motivoCancelacion: string = '';
  
  // Estado original para detectar cambios
  estadoOriginal: EstadoCita = 'Programada';

  // Control del formulario
  submitted = false;
  loading = false;
  loadingDoctors = false;
  loadingHorarios = false;

  // Listas
  especialidades: Especialidad[] = [];
  doctoresDisponibles: Doctor[] = [];
  horariosDisponibles: TimeSlot[] = [];

  // Mensajes
  text_success: string = '';
  text_validation: string = '';

  // Estados disponibles para edición
  estadosDisponibles: EstadoCita[] = ['Programada', 'Confirmada', 'En curso', 'Completada', 'Cancelada', 'No asistió'];

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
    
    // Obtener ID de la cita desde la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.appointmentId = +params['id'];
        this.loadAppointmentData(this.appointmentId);
      } else {
        this.router.navigate(['/appointments/list_appointment']);
      }
    });
  }

  /**
   * Inicia el tour guiado del formulario de edición de cita
   */
  public startEditAppointmentTour(): void {
    this.driverTourService.startEditAppointmentTour();
  }

  loadAppointmentData(id: number): void {
    this.loading = true;
    this.appointmentsService.getAppointment(id).subscribe({
      next: (response: any) => {
        const appointment = response.data;
        
        // Mapear campos del backend a los del frontend
        this.nombre_paciente = appointment.paciente_nombre || appointment.nombre_paciente || '';
        this.especialidad_id = appointment.doctor_relation?.especialidad_id || appointment.doctor?.especialidad_id || 0;
        this.doctor_id = appointment.doctor_id;
        
        // Formatear fecha: convertir de ISO a YYYY-MM-DD
        if (appointment.fecha) {
          const fechaObj = new Date(appointment.fecha);
          this.fecha = fechaObj.toISOString().split('T')[0];
        }
        
        // El backend retorna 'hora' no 'hora_inicio'
        this.hora_inicio = appointment.hora ? appointment.hora.substring(0, 5) : '';
        
        // El backend usa 'motivo' no 'motivo_consulta'
        this.motivo_consulta = appointment.motivo || appointment.motivo_consulta || '';
        
        // Mapear estado del backend al frontend
        this.estado = this.mapEstadoFromBackend(appointment.estado);
        this.estadoOriginal = this.estado; // Guardar el estado original
        
        // El backend usa 'observaciones' no 'notas'
        this.notas = appointment.observaciones || appointment.notas || '';
        
        // Cargar doctores de la especialidad
        if (this.especialidad_id) {
          this.loadDoctoresByEspecialidad();
        }
        
        // Cargar horarios disponibles
        if (this.doctor_id && this.fecha) {
          this.loadHorariosDisponibles();
        }
        
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.text_validation = 'Error al cargar la cita';
        setTimeout(() => {
          this.router.navigate(['/appointments/list_appointment']);
        }, 2000);
      }
    });
  }

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

  loadDoctoresByEspecialidad(): void {
    this.loadingDoctors = true;
    this.doctoresDisponibles = [];
    
    this.appointmentsService.getDoctorsByEspecialidad(this.especialidad_id).subscribe({
      next: (response) => {
        this.loadingDoctors = false;
        
        if (response.success && response.data) {
          this.doctoresDisponibles = response.data.filter(d => d.activo);
          
          if (this.doctoresDisponibles.length === 0) {
            this.text_validation = 'No hay doctores disponibles para esta especialidad';
          }
        } else {
          this.doctoresDisponibles = [];
        }
      },
      error: (error) => {
        this.loadingDoctors = false;
        this.text_validation = 'Error al cargar doctores: ' + (error.error?.message || error.message);
      }
    });
  }

  onDoctorOrFechaChange(): void {
    this.hora_inicio = '';
    this.horariosDisponibles = [];
    
    if (this.doctor_id && this.fecha) {
      this.loadHorariosDisponibles();
    }
  }

  loadHorariosDisponibles(): void {
    this.loadingHorarios = true;
    this.appointmentsService.getHorariosDisponibles(this.doctor_id, this.fecha).subscribe({
      next: (response) => {
        this.loadingHorarios = false;
        if (response.success) {
          this.horariosDisponibles = response.data.slots.filter(slot => slot.disponible);
          
          // Agregar el horario actual si no está en la lista
          if (this.hora_inicio) {
            const horaActual = this.hora_inicio.substring(0, 5);
            const existeHoraActual = this.horariosDisponibles.some(slot => slot.hora === horaActual);
            if (!existeHoraActual) {
              this.horariosDisponibles.unshift({ hora: horaActual, disponible: true });
            }
          }
          
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

  mapEstadoFromBackend(estado: string): EstadoCita {
    const estadosMap: { [key: string]: EstadoCita } = {
      'pendiente': 'Programada',
      'confirmada': 'Confirmada',
      'en_progreso': 'En curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No asistió'
    };
    return estadosMap[estado] || 'Programada';
  }

  validateForm(): boolean {
    if (!this.nombre_paciente || !this.nombre_paciente.trim()) {
      return false;
    }

    if (!this.especialidad_id || this.especialidad_id === 0) {
      return false;
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

  save(): void {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    if (!this.validateForm()) {
      this.text_validation = this.translate.instant('COMMON.FILL_REQUIRED_FIELDS');
      return;
    }

    if (!this.appointmentId) {
      this.text_validation = 'ID de cita no válido';
      return;
    }

    this.loading = true;

    // Detectar si se está cambiando a "Cancelada"
    const cambiandoACancelada = this.estado === 'Cancelada' && this.estadoOriginal !== 'Cancelada';
    
    // Si se está cambiando a cancelada, usar el endpoint de cancelación
    if (cambiandoACancelada) {
      const motivoCancelacion = this.motivoCancelacion && this.motivoCancelacion.trim() 
        ? this.motivoCancelacion.trim() 
        : 'Sin motivo especificado';
      
      this.appointmentsService.cancelAppointment(this.appointmentId, motivoCancelacion).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.text_success = this.translate.instant('APPOINTMENTS.EDIT_APPOINTMENT.SUCCESS');
            
            setTimeout(() => {
              this.router.navigate(['/appointments/cancelled/list']);
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
      return;
    }

    // Para cualquier otra actualización, usar updateAppointment
    const appointmentData: any = {
      paciente_nombre: this.nombre_paciente.trim(),
      doctor_id: this.doctor_id,
      fecha: this.fecha,
      hora: this.hora_inicio,
      motivo: this.motivo_consulta.trim(),
      estado: this.mapEstadoToBackend(this.estado)
    };

    if (this.notas && this.notas.trim()) {
      appointmentData.observaciones = this.notas.trim();
    }
    
    this.appointmentsService.updateAppointment(this.appointmentId, appointmentData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.text_success = this.translate.instant('APPOINTMENTS.EDIT_APPOINTMENT.SUCCESS');
          
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
    
    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours = hours - 12;
    }
    
    return `${hours}:${minutes} ${period}`;
  }
}
