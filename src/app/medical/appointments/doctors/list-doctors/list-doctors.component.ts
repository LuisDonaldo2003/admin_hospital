import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsService, Doctor } from '../../service/appointments.service';
import { AppointmentServicesService } from '../../service/appointment-services.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-doctors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './list-doctors.component.html',
  styleUrls: ['./list-doctors.component.scss']
})
export class ListDoctorsComponent implements OnInit {

  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  services: any[] = [];
  isLoading = false;
  searchTerm: string = '';

  // Filtros
  filtroService: string = '';

  // Doctor seleccionado para eliminar
  selectedDoctor: Doctor | null = null;

  // Totales
  totalDoctors: number = 0;

  // Variables de paginación
  public pageSize = 10;
  public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private appointmentsService: AppointmentsService,
    private appointmentServicesService: AppointmentServicesService,
    private driverTourService: DriverTourService,
    public authService: AuthService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadDoctors();
    this.checkAndStartTour();
  }

  private checkAndStartTour(): void {
    setTimeout(() => {
      if (!this.driverTourService.isTourCompleted('doctors-list')) {
        this.startTour();
      }
    }, 500);
  }

  startTour(): void {
    this.driverTourService.startDoctorsListTour();
  }

  /**
   * Cargar servicios unificados
   */
  loadServices(): void {
    this.appointmentServicesService.listAccessible().subscribe({
      next: (resp: any) => {
        if (resp.success) {
          // Filtrar activos
          this.services = resp.data.filter((s: any) => s.activo);
        }
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  /**
   * Cargar doctores
   */
  loadDoctors(): void {
    this.isLoading = true;
    this.appointmentsService.listDoctors().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.doctors = response.data;
          this.totalDoctors = this.doctors.length;
          // Apply initial filter
          this.filterDoctors();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar doctores:', error);
      }
    });
  }

  /**
   * Filtrar doctores
   */
  filterDoctors(): void {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchSearch = !this.searchTerm ||
        doctor.nombre_completo.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro por servicio
      let matchService = true;
      if (this.filtroService) {
        const serviceId = parseInt(this.filtroService);
        // Verificar si el doctor tiene este servicio principal
        if (doctor.appointment_service_id === serviceId) {
          matchService = true;
        } else if (doctor.appointmentService && doctor.appointmentService.id === serviceId) {
          matchService = true;
        } else {
          matchService = false;
        }
      }

      return matchSearch && matchService;
    });

    this.currentPage = 1;
    this.skip = 0;
    this.calculatePagination();
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.filtroService = '';
    this.filterDoctors();
  }

  /**
   * Seleccionar doctor para eliminar
   */
  selectDoctor(doctor: Doctor): void {
    this.selectedDoctor = doctor;
  }

  /**
   * Confirmar eliminación
   */
  confirmDelete(): void {
    if (!this.selectedDoctor?.id) return;

    this.appointmentsService.deleteDoctor(this.selectedDoctor.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadDoctors();
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El doctor ha sido eliminado correctamente',
            customClass: {
              confirmButton: 'btn btn-success'
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al eliminar doctor:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.translate.instant('APPOINTMENTS.LIST_DOCTORS.DELETE_ERROR'),
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });
      }
    });
  }

  /**
   * Ir a agregar doctor
   */
  goToAddDoctor(): void {
    this.router.navigate(['/appointments/add_doctor']);
  }

  /**
   * Obtener horario del doctor
   */
  getSchedule(doctor: Doctor): string {
    if (doctor.turno === 'Matutino') {
      return `${doctor.hora_inicio_matutino} - ${doctor.hora_fin_matutino}`;
    } else if (doctor.turno === 'Vespertino') {
      return `${doctor.hora_inicio_vespertino} - ${doctor.hora_fin_vespertino}`;
    } else {
      return `${doctor.hora_inicio_matutino}-${doctor.hora_fin_matutino} / ${doctor.hora_inicio_vespertino}-${doctor.hora_fin_vespertino}`;
    }
  }

  /**
   * Obtener nombre del rol (Servicio)
   */
  getRoleName(doctor: Doctor): string {
    if (doctor.appointmentService) {
      return doctor.appointmentService.nombre;
    }
    if (doctor.appointment_service) {
      return doctor.appointment_service.nombre;
    }
    // Fallback legacy
    if (doctor.especialidad?.nombre) {
      return doctor.especialidad.nombre;
    }
    if (doctor.general_medical_id && doctor.generalMedical) {
      return doctor.generalMedical.nombre;
    }

    return 'N/A';
  }

  /**
   * Calcular paginación
   */
  private calculatePagination(): void {
    this.totalData = this.filteredDoctors.length;
    this.totalPages = this.pageSize > 0 ? Math.ceil(this.totalData / this.pageSize) : 0;

    this.pageNumberArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pageNumberArray.push(i);
    }

    this.serialNumberArray = [];
    if (this.totalData > 0) {
      const startIndex = (this.currentPage - 1) * this.pageSize + 1;
      for (let i = startIndex; i < startIndex + this.pageSize && i <= this.totalData; i++) {
        this.serialNumberArray.push(i);
      }
    }
  }

  public getMoreData(event: string): void {
    if (event === 'next' && this.currentPage < this.totalPages) {
      this.currentPage++;
    } else if (event === 'previous' && this.currentPage > 1) {
      this.currentPage--;
    }
    this.skip = (this.currentPage - 1) * this.pageSize;
    this.calculatePagination();
  }

  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.skip = (pageNumber - 1) * this.pageSize;
    this.calculatePagination();
  }
}
