import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentsService } from '../../service/appointments.service';
import { GeneralMedicalService } from '../../general-medical/service/general-medical.service';
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
  showSpecialist: boolean = false;
  showGeneral: boolean = false;

  especialidad_id: number = 0;
  general_medical_id: number = 0;
  doctor_id: number = 0;

  especialidades: any[] = [];
  generalMedicals: any[] = [];
  doctores: any[] = [];
  loadingDoctors: boolean = false;

  constructor(
    private appointmentsService: AppointmentsService,
    private generalMedicalService: GeneralMedicalService,
    private authService: AuthService,
    private router: Router,
    private driverTourService: DriverTourService
  ) { }

  ngOnInit(): void {
    this.filterServiceTypesByRole();
    this.loadAppointments();
  }

  /**
   * Determinar qué filtros mostrar según permisos
   */
  filterServiceTypesByRole(): void {
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
      // Admin o ambos permisos
      this.showSpecialist = true;
      this.showGeneral = true;
      this.loadEspecialidades();
      this.loadGeneralMedicals();
    }
  }

  loadEspecialidades(): void {
    this.appointmentsService.listEspecialidades().subscribe({
      next: (resp) => {
        if (resp.success) this.especialidades = resp.data;
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

  onServiceTypeChange(): void {
    this.doctor_id = 0;
    this.doctores = [];
    // Recargar calendario sin filtros específicos o resetear
    this.loadAppointments();
  }

  onEspecialidadChange(): void {
    this.doctor_id = 0;
    this.doctores = [];
    if (this.especialidad_id) {
      this.loadDoctorsByEspecialidad();
    }
    this.loadAppointments();
  }

  onGeneralMedicalChange(): void {
    this.doctor_id = 0;
    this.doctores = [];
    if (this.general_medical_id) {
      this.loadDoctorsByGeneralMedical();
    }
    this.loadAppointments();
  }

  onDoctorChange(): void {
    // Cuando cambia el doctor, limpiamos la fecha seleccionada para mostrar la lista completa
    this.selectedDate = null;
    this.loadAppointments();
  }

  loadDoctorsByEspecialidad(): void {
    this.loadingDoctors = true;
    this.appointmentsService.listDoctors({ especialidad_id: this.especialidad_id }).subscribe({
      next: (resp) => {
        this.loadingDoctors = false;
        if (resp.success) this.doctores = resp.data.filter(d => d.activo);
      },
      error: () => this.loadingDoctors = false
    });
  }

  loadDoctorsByGeneralMedical(): void {
    this.loadingDoctors = true;
    this.appointmentsService.listDoctors({ general_medical_id: this.general_medical_id }).subscribe({
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
    } else {
      // Si no hay doctor seleccionado, filtrar por especialidad o categoría si están seleccionadas
      if (this.especialidad_id) {
        params.especialidad_id = this.especialidad_id;
      }
      if (this.general_medical_id) {
        params.general_medical_id = this.general_medical_id;
      }
    }

    // Llamar al servicio con filtros
    this.appointmentsService.listAppointments(params).subscribe({
      next: (response: any) => {
        let allAppointments = response.data || [];

        // Filtrado estricto por permisos para evitar fugas de información
        const canSpecialist = this.authService.hasPermission('appointments_add_especialidad');
        const canGeneral = this.authService.hasPermission('appointments_add_general_medical');

        if (canSpecialist && !canGeneral) {
          // Solo especialistas: ver citas donde el doctor tiene especialidad
          allAppointments = allAppointments.filter((apt: any) => {
            const doc = apt.doctor_relation || apt.doctor;
            return doc && doc.especialidad_id;
          });
        } else if (canGeneral && !canSpecialist) {
          // Solo generales: ver citas donde el doctor pertenece a medico general
          allAppointments = allAppointments.filter((apt: any) => {
            const doc = apt.doctor_relation || apt.doctor;
            return doc && doc.general_medical_id;
          });
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

  getDoctorEspecialidad(appointment: any): string {
    // Primero intentar obtener el objeto doctor completo
    const doc = appointment.doctorRelation || appointment.doctor;

    if (!doc) return 'N/A';

    // Si tiene especialidad asignada
    if (doc.especialidad && doc.especialidad.nombre) {
      return doc.especialidad.nombre;
    }

    // Si tiene ID de especialidad, buscar en la lista cargada localmente
    if (doc.especialidad_id) {
      const esp = this.especialidades.find(e => e.id === doc.especialidad_id);
      if (esp) return esp.nombre;
    }

    // Si es médico general (general_medical_id no nulo)
    if (doc.general_medical_id) {
      // Intentar obtener de la relación directa
      if (doc.general_medical && doc.general_medical.nombre) {
        return doc.general_medical.nombre;
      }
      // Si no, buscar en la lista cargada localmente
      const gm = this.generalMedicals.find(g => g.id === doc.general_medical_id);
      return gm ? gm.nombre : 'Médico General';
    }

    // Fallback si la info viene anidada diferente o es solo string
    return doc.especialidad_nombre || 'N/A';
  }
}
