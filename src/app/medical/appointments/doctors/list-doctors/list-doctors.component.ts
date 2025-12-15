import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsService, Doctor } from '../../service/appointments.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';
import { GeneralMedicalService } from '../../general-medical/service/general-medical.service';
import { AuthService } from 'src/app/shared/auth/auth.service';

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
  especialidades: any[] = [];
  generalMedicals: any[] = [];
  isLoading = false;
  searchTerm: string = '';

  // Filtros
  filtroEspecialidad: string = '';
  filtroGeneralMedical: string = '';

  // Flags de UI
  showSpecialist: boolean = false;
  showGeneral: boolean = false;

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
    private generalMedicalService: GeneralMedicalService,
    private driverTourService: DriverTourService,
    public authService: AuthService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    this.determineFilters();
    this.loadDoctors();
    this.checkAndStartTour();
  }

  determineFilters(): void {
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
      // Admin o ambos
      this.showSpecialist = true;
      this.showGeneral = true;
      this.loadEspecialidades();
      this.loadGeneralMedicals();
    }
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

  loadGeneralMedicals(): void {
    this.generalMedicalService.listGeneralMedicals().subscribe({
      next: (resp) => {
        if (resp.success) this.generalMedicals = resp.data.filter(g => g.activo);
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
          let allDoctors = response.data;

          // Filtrado estricto por permisos
          const canSpecialist = this.authService.hasPermission('appointments_add_especialidad');
          const canGeneral = this.authService.hasPermission('appointments_add_general_medical');

          if (canSpecialist && !canGeneral) {
            // Solo especialistas: filtrar aquellos que tienen especialidad_id
            allDoctors = allDoctors.filter(d => d.especialidad_id);
          } else if (canGeneral && !canSpecialist) {
            // Solo generales: filtrar aquellos que tienen general_medical_id
            allDoctors = allDoctors.filter(d => d.general_medical_id);
          }
          // Si tiene ambos o ninguno (admin?), mostrar todos o manejar segun requerimiento.
          // Asumimos que admin ve todo.

          this.doctors = allDoctors;
          this.totalDoctors = this.doctors.length;
          this.filteredDoctors = [...this.doctors];
          this.calculatePagination();
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

      // Filtro especialidad
      const matchEspecialidad = !this.filtroEspecialidad ||
        doctor.especialidad_id === parseInt(this.filtroEspecialidad);

      // Filtro General Medical
      const matchGeneral = !this.filtroGeneralMedical ||
        doctor.general_medical_id === parseInt(this.filtroGeneralMedical);

      return matchSearch && matchEspecialidad && matchGeneral;
    });

    // Reset a la primera página y calcular paginación
    this.currentPage = 1;
    this.skip = 0;
    this.calculatePagination();
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.filtroEspecialidad = '';
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
        }
      },
      error: (error) => {
        console.error('Error al eliminar doctor:', error);
        alert(this.translate.instant('APPOINTMENTS.LIST_DOCTORS.DELETE_ERROR'));
      }
    });
  }

  /**
   * Verificar si hay filtros activos
   */
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm.trim() || this.filtroEspecialidad);
  }

  /**
   * Ir a agregar doctor
   */
  goToAddDoctor(): void {
    this.router.navigate(['/appointments/add_doctor']);
  }

  /**
   * Ir a editar doctor
   */
  editDoctor(doctor: Doctor): void {
    if (doctor.id) {
      this.router.navigate(['/appointments/edit_doctor', doctor.id]);
    }
  }

  /**
   * Obtener nombre completo del doctor
   */
  getFullName(doctor: Doctor): string {
    return doctor.nombre_completo;
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
   * Obtener nombre del rol (Especialidad o Médico General)
   */
  getRoleName(doctor: Doctor): string {
    if (doctor.especialidad?.nombre) {
      return doctor.especialidad.nombre;
    }

    if (doctor.general_medical_id) {
      // Buscar en la lista cargada
      const gm = this.generalMedicals.find(g => g.id === doctor.general_medical_id);
      return gm ? gm.nombre : 'Médico General';
    }

    return 'N/A';
  }

  /**
   * Calcular paginación
   */
  private calculatePagination(): void {
    this.totalData = this.filteredDoctors.length;
    this.totalPages = Math.ceil(this.totalData / this.pageSize);

    // Generar array de números de página
    this.pageNumberArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pageNumberArray.push(i);
    }

    // Generar array de números de serie
    this.serialNumberArray = [];
    const startIndex = (this.currentPage - 1) * this.pageSize + 1;
    for (let i = startIndex; i < startIndex + this.pageSize && i <= this.totalData; i++) {
      this.serialNumberArray.push(i);
    }
  }

  /**
   * Obtener más datos (paginación)
   */
  public getMoreData(event: string): void {
    if (event === 'next' && this.currentPage < this.totalPages) {
      this.currentPage++;
      this.skip = (this.currentPage - 1) * this.pageSize;
    } else if (event === 'previous' && this.currentPage > 1) {
      this.currentPage--;
      this.skip = (this.currentPage - 1) * this.pageSize;
    }
    this.calculatePagination();
  }

  /**
   * Mover a una página específica
   */
  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.skip = (pageNumber - 1) * this.pageSize;
    this.calculatePagination();
  }
}
