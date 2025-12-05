import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentsService } from '../../service/appointments.service';
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

  constructor(
    private appointmentsService: AppointmentsService,
    private router: Router,
    private driverTourService: DriverTourService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
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
    
    // Llamar al servicio con filtros de fecha
    this.appointmentsService.listAppointments({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    }).subscribe({
      next: (response: any) => {
        this.appointments = response.data || [];
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
    if (this.selectedDate) {
      const dateStr = this.formatDate(this.selectedDate);
      this.filteredAppointments = this.appointments.filter(apt => apt.fecha === dateStr);
    } else {
      this.filteredAppointments = [];
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
      this.currentMonth++;
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
}
