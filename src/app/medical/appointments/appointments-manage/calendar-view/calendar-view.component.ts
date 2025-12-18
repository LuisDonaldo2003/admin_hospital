import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentsService } from '../../service/appointments.service';
import { AppointmentServicesService } from '../../service/appointment-services.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss']
})
export class CalendarViewComponent implements OnInit {
  currentDate: Date = new Date();
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  selectedDate: Date | null = null;

  weeks: any[][] = [];
  monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  dayNames: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  appointments: any[] = [];
  filteredAppointments: any[] = [];
  isLoading: boolean = false;

  // Filtros
  // Filtros
  appointment_service_id: number = 0;
  doctor_id: number = 0;

  services: any[] = [];
  doctores: any[] = [];
  loadingDoctors: boolean = false;

  constructor(
    private appointmentsService: AppointmentsService,
    private appointmentServicesService: AppointmentServicesService,
    private authService: AuthService,
    private router: Router,
    private driverTourService: DriverTourService
  ) { }

  ngOnInit(): void {
    const user = this.authService.user;
    if (user && user.doctor_id) {
      this.setupDoctorMode(user.doctor_id);
    } else {
      this.loadServices();
      this.loadAppointments();
    }
  }

  setupDoctorMode(doctorId: number): void {
    this.doctor_id = doctorId;
    this.appointmentsService.getDoctor(doctorId).subscribe({
      next: (resp: any) => {
        if (resp.success && resp.data) {
          const doctor = resp.data;
          this.appointment_service_id = doctor.appointment_service_id || 0;
          this.loadServices(); // Cargar servicios para visualización (aunque esté bloqueado)
          this.loadDoctors(); // Cargar lista de doctores (filtrada por servicio)
          this.loadAppointments();
        }
      }
    });
  }

  loadServices(): void {
    this.appointmentServicesService.listAccessible().subscribe({
      next: (resp) => {
        if (resp.success) this.services = resp.data;
      }
    });
  }

  onServiceChange(): void {
    this.doctor_id = 0;
    this.doctores = [];
    if (this.appointment_service_id) {
      this.loadDoctors();
    }
    this.loadAppointments();
  }

  onDoctorChange(): void {
    // Cuando cambia el doctor, limpiamos la fecha seleccionada para mostrar la lista completa
    this.selectedDate = null;
    this.loadAppointments();
  }

  loadDoctors(): void {
    this.loadingDoctors = true;
    this.appointmentsService.listDoctors({ appointment_service_id: this.appointment_service_id }).subscribe({
      next: (resp) => {
        this.loadingDoctors = false;
        if (resp.success) this.doctores = resp.data.filter(d => d.activo);
      },
      error: () => this.loadingDoctors = false
    });
  }

  /**
   * Inicia el tour guiado del calendario de citas
   */
  public startAppointmentsCalendarTour(): void {
    this.driverTourService.startAppointmentsCalendarTour();
  }

  loadAppointments(): void {
    this.isLoading = true;

    // Calcular primer y último día del mes actual
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    const fechaInicio = this.formatDate(firstDay);
    const fechaFin = this.formatDate(lastDay);

    const params: any = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    };

    if (this.doctor_id) {
      params.doctor_id = this.doctor_id;
    } else if (this.appointment_service_id) {
      params.appointment_service_id = this.appointment_service_id;
    }

    // Llamar al servicio con filtros
    this.appointmentsService.listAppointments(params).subscribe({
      next: (response: any) => {
        let allAppointments = response.data || [];

        // Filtramos por servicio si se proporcionó, para asegurar consistencia
        // (Aunque el backend debería encargarse, esto es doble seguridad)
        if (this.appointment_service_id && !this.doctor_id) {
          // Opcional: filtrar en cliente si el backend no soporta filtro por servicio en appointment
          // allAppointments = allAppointments.filter(...)
        }

        this.appointments = allAppointments;
        this.generateCalendar(); // Regenerar calendario después de cargar citas
        this.filterAppointmentsByDate();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
        this.generateCalendar(); // Generar calendario vacío en caso de error
      }
    });
  }

  generateCalendar(): void {
    this.weeks = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let day = 1;
    for (let i = 0; i < 6; i++) {
      const week: any[] = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDayOfWeek) {
          week.push({ day: null, date: null, appointments: [] });
        } else if (day > daysInMonth) {
          week.push({ day: null, date: null, appointments: [] });
        } else {
          const date = new Date(this.currentYear, this.currentMonth, day);
          const dayAppointments = this.getAppointmentsForDate(date);
          week.push({
            day,
            date,
            appointments: dayAppointments,
            isToday: this.isToday(date),
            isSelected: this.isSelected(date)
          });
          day++;
        }
      }
      this.weeks.push(week);
      if (day > daysInMonth) break;
    }
  }

  getAppointmentsForDate(date: Date): any[] {
    const dateStr = this.formatDate(date);
    return this.appointments.filter(apt => apt.fecha === dateStr);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  isSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    return date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear();
  }

  selectDate(day: any): void {
    if (day.date) {
      this.selectedDate = day.date;
      this.filterAppointmentsByDate();
      this.generateCalendar();
    }
  }

  filterAppointmentsByDate(): void {
    // Si hay un doctor seleccionado, mostrar TODAS sus citas del mes ordenadas
    if (this.doctor_id) {
      this.filteredAppointments = [...this.appointments].sort((a, b) => {
        // Ordenar por fecha y luego por hora
        if (a.fecha !== b.fecha) {
          return a.fecha.localeCompare(b.fecha);
        }
        return a.hora.localeCompare(b.hora);
      });
      // NOTA: Ignoramos selectedDate aquí para cumplir con el requerimiento de "no importa el día" al seleccionar doctor.
    } else {
      // Comportamiento normal: solo mostrar si hay fecha seleccionada
      if (this.selectedDate) {
        const dateStr = this.formatDate(this.selectedDate);
        this.filteredAppointments = this.appointments.filter(apt => apt.fecha === dateStr);
      } else {
        this.filteredAppointments = [];
      }
    }
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadAppointments(); // Recargar citas del nuevo mes
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth--;
    }
    this.loadAppointments(); // Recargar citas del nuevo mes
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.selectedDate = today;
    this.loadAppointments(); // Recargar citas del mes actual
  }

  viewAppointment(appointment: any): void {
    this.router.navigate(['/appointments/edit_appointment', appointment.id]);
  }

  addNewAppointment(): void {
    this.router.navigate(['/appointments/add_appointment']);
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Programada': 'badge-warning',
      'programada': 'badge-warning',
      'pendiente': 'badge-warning',
      'Confirmada': 'badge-info',
      'confirmada': 'badge-info',
      'En curso': 'badge-primary',
      'en_progreso': 'badge-primary',
      'en_curso': 'badge-primary',
      'Completada': 'badge-success',
      'completada': 'badge-success',
      'Cancelada': 'badge-danger',
      'cancelada': 'badge-danger',
      'No asistió': 'badge-secondary',
      'no_asistio': 'badge-secondary'
    };
    return statusClasses[status] || 'badge-secondary';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'programada': 'Programada',
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'en_progreso': 'En Progreso',
      'en_curso': 'En Curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No Asistió'
    };
    return statusTexts[status] || status;
  }

  formatTime(time: string): string {
    if (!time) return '';
    // Convertir de formato 24h (HH:MM:SS) a 12h (h:MM AM/PM)
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  getPacienteNombre(appointment: any): string {
    return appointment.paciente?.nombre ||
      appointment.pacienteRelation?.person?.nombre ||
      appointment.paciente_nombre ||
      'N/A';
  }

  getDoctorNombre(appointment: any): string {
    return appointment.doctor?.nombre_completo ||
      appointment.doctorRelation?.nombre_completo ||
      appointment.doctor?.nombre ||
      'N/A';
  }

  getDoctorService(appointment: any): string {
    const doc = appointment.doctorRelation || appointment.doctor;
    if (!doc) return 'N/A';

    // Priorizar el servicio unificado
    if (doc.appointment_service) {
      return doc.appointment_service.nombre || doc.appointment_service;
    }
    if (appointment.specialty) {
      return appointment.specialty.nombre;
    }

    return 'N/A';
  }
}
