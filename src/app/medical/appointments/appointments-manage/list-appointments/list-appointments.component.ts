import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentsService } from '../../service/appointments.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './list-appointments.component.html',
  styleUrls: ['./list-appointments.component.scss']
})
export class ListAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  paginatedAppointments: any[] = [];
  doctors: any[] = [];
  searchText: string = '';
  isLoading: boolean = false;

  // Filtros
  filtroEstado: string = '';
  filtroDoctor: number = 0;

  // Paginación
  currentPage: number = 1;
  limit: number = 10;
  skip: number = 0;
  totalPages: number = 0;
  pageNumbers: number[] = [];
  Math = Math;

  // Cita seleccionada para cancelar/eliminar
  selectedAppointment: any = null;
  motivoCancelacion: string = '';

  // Totales
  totalAppointments: number = 0;

  constructor(
    private appointmentsService: AppointmentsService,
    private router: Router,
    private driverTourService: DriverTourService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDoctors();
    this.loadAppointments();
  }

  /**
   * Inicia el tour guiado de la lista de citas
   */
  public startAppointmentsListTour(): void {
    this.driverTourService.startAppointmentsListTour();
  }

  /**
   * Cargar doctores para filtro
   */
  loadDoctors(): void {
    this.appointmentsService.listDoctors().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.doctors = response.data || [];
        }
      },
      error: (error: any) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentsService.listAppointments().subscribe({
      next: (response: any) => {
        let allAppointments = response.data || [];

        // Filtrado por estados (excluir canceladas, etc. si aplica)
        allAppointments = allAppointments.filter((apt: any) =>
          apt.estado !== 'cancelada' &&
          apt.estado !== 'completada' &&
          apt.estado !== 'no_asistio'
        );

        // Filtrado estricto por permisos
        const canSpecialist = this.authService.hasPermission('appointments_add_especialidad');
        const canGeneral = this.authService.hasPermission('appointments_add_general_medical');

        if (canSpecialist && !canGeneral) {
          // Solo especialistas
          allAppointments = allAppointments.filter((apt: any) => {
            // Preferir doctor_relation si existe (trae datos completos), sino fallback a doctor (ahora arreglado en backend)
            const doc = apt.doctor_relation || apt.doctor;
            return doc && doc.especialidad_id;
          });
        } else if (canGeneral && !canSpecialist) {
          // Solo generales
          allAppointments = allAppointments.filter((apt: any) => {
            const doc = apt.doctor_relation || apt.doctor;
            return doc && doc.general_medical_id;
          });
        }

        this.appointments = allAppointments;
        this.totalAppointments = this.appointments.length;
        this.filteredAppointments = [...this.appointments];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar las citas'
        });
      }
    });
  }

  searchAppointments(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchSearch = !this.searchText.trim() ||
        appointment.paciente_nombre?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        appointment.nombre_paciente?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        appointment.doctor?.nombre_completo?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        appointment.folio_expediente?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        appointment.motivo?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchEstado = !this.filtroEstado || appointment.estado === this.filtroEstado;

      const matchDoctor = !this.filtroDoctor || appointment.doctor_id === this.filtroDoctor;

      return matchSearch && matchEstado && matchDoctor;
    });

    // Resetear paginación
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.searchText = '';
    this.filtroEstado = '';
    this.filtroDoctor = 0;
    this.searchAppointments();
  }

  /**
   * Verificar si hay filtros activos
   */
  get hasActiveFilters(): boolean {
    return !!(this.searchText.trim() || this.filtroEstado || this.filtroDoctor);
  }

  /**
   * Actualizar paginación
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAppointments.length / this.limit);
    this.skip = (this.currentPage - 1) * this.limit;

    // Calcular páginas a mostrar
    this.pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }

    // Actualizar datos paginados
    this.paginatedAppointments = this.filteredAppointments.slice(this.skip, this.skip + this.limit);
  }

  /**
   * Ir a página específica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  /**
   * Página anterior
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /**
   * Página siguiente
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  /**
   * Seleccionar cita para cancelar/eliminar
   */
  selectAppointment(appointment: any): void {
    this.selectedAppointment = appointment;
    this.motivoCancelacion = ''; // Limpiar el campo al abrir el modal
  }

  /**
   * Ir a agregar cita
   */
  goToAddAppointment(): void {
    this.router.navigate(['/appointments/add_appointment']);
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Formatear hora a formato 12 horas con AM/PM
   */
  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';

    // Extraer hora y minutos (formato puede ser HH:MM:SS o HH:MM)
    const parts = timeString.split(':');
    if (parts.length < 2) return timeString;

    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];

    // Determinar AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convertir a formato 12 horas
    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours = hours - 12;
    }

    return `${hours}:${minutes} ${period}`;
  }

  /**
   * Obtener nombre del paciente de forma segura
   */
  getPacienteNombre(appointment: any): string {
    if (!appointment) return 'N/A';

    // El backend retorna siempre un objeto paciente con la propiedad nombre
    if (appointment.paciente?.nombre) {
      return appointment.paciente.nombre;
    }

    // Fallback a campos directos
    if (appointment.paciente_nombre) {
      return appointment.paciente_nombre;
    }

    return 'N/A';
  }

  /**
   * Obtener nombre del doctor de forma segura
   */
  getDoctorNombre(appointment: any): string {
    if (!appointment) return 'N/A';

    // El backend retorna siempre un objeto doctor con la propiedad nombre
    if (appointment.doctor?.nombre) {
      return appointment.doctor.nombre;
    }

    // Fallback a doctor_relation
    if (appointment.doctor_relation?.nombre_completo) {
      return appointment.doctor_relation.nombre_completo;
    }

    return 'N/A';
  }

  /**
   * Obtener motivo de consulta de forma segura
   */
  getMotivoConsulta(appointment: any): string {
    if (!appointment) return 'N/A';

    // El backend retorna motivo como string simple
    if (appointment.motivo) {
      return appointment.motivo;
    }

    // Fallback alternativo
    if (appointment.motivo_consulta) {
      return appointment.motivo_consulta;
    }

    return 'N/A';
  }

  /**
   * Confirmar cancelación
   */
  confirmCancel(): void {
    if (!this.selectedAppointment?.id) return;

    const motivo = this.motivoCancelacion && this.motivoCancelacion.trim()
      ? this.motivoCancelacion.trim()
      : 'Sin motivo especificado';

    this.appointmentsService.cancelAppointment(this.selectedAppointment.id, motivo).subscribe({
      next: () => {
        this.closeModal('cancel_appointment');
        this.motivoCancelacion = ''; // Limpiar el campo
        this.loadAppointments();
      },
      error: (error: any) => {
        console.error('Error cancelling appointment:', error);
        this.closeModal('cancel_appointment');
        this.motivoCancelacion = ''; // Limpiar el campo
        Swal.fire('Error', 'Error al cancelar la cita', 'error');
      }
    });
  }

  /**
   * Confirmar eliminación
   */
  confirmDelete(): void {
    if (!this.selectedAppointment?.id) return;

    this.appointmentsService.deleteAppointment(this.selectedAppointment.id).subscribe({
      next: () => {
        this.closeModal('delete_appointment');
        this.loadAppointments();
      },
      error: (error: any) => {
        console.error('Error deleting appointment:', error);
        this.closeModal('delete_appointment');
        Swal.fire('Error', 'Error al eliminar la cita', 'error');
      }
    });
  }

  editAppointment(id: number): void {
    this.router.navigate(['/appointments/edit_appointment', id]);
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pendiente': 'badge-warning',
      'confirmada': 'badge-info',
      'en_progreso': 'badge-primary',
      'completada': 'badge-success',
      'cancelada': 'badge-danger',
      'no_asistio': 'badge-secondary'
    };
    return statusClasses[status] || 'badge-secondary';
  }

  getStatusTranslationKey(status: string): string {
    if (!status) return 'APPOINTMENTS.LIST_APPOINTMENTS.STATUS.PENDING';

    const statusKeys: { [key: string]: string } = {
      'pendiente': 'PENDING',
      'confirmada': 'CONFIRMED',
      'en_progreso': 'IN_PROGRESS',
      'completada': 'COMPLETED',
      'cancelada': 'CANCELLED',
      'no_asistio': 'NO_SHOW'
    };

    const key = statusKeys[status] || 'PENDING';
    return `APPOINTMENTS.LIST_APPOINTMENTS.STATUS.${key}`;
  }

  /**
   * Cerrar modal de Bootstrap
   */
  private closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    // Remover backdrop manualmente si persiste
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  }
}
