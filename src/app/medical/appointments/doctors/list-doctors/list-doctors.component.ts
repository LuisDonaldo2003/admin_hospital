import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsService, Doctor } from '../../service/appointments.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

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
  isLoading = false;
  searchTerm: string = '';
  
  // Filtros
  filtroEspecialidad: string = '';
  
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
    private driverTourService: DriverTourService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    this.loadEspecialidades();
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
      
      const matchEspecialidad = !this.filtroEspecialidad || 
        doctor.especialidad_id === parseInt(this.filtroEspecialidad);
      
      return matchSearch && matchEspecialidad;
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
