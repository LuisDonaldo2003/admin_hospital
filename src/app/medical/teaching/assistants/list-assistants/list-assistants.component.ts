import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TeachingService } from '../../services/teaching.service';
import { 
  Teaching, 
  Modalidad, 
  Participacion, 
  TeachingStats,
  TeachingFilters 
} from '../../models/teaching.interface';
import { PermissionService } from 'src/app/shared/services/permission.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

/**
 * Componente para listar registros de enseñanza del hospital
 * Basado en la hoja "LIBRO10" del Excel
 */
@Component({
  selector: 'app-list-assistants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './list-assistants.component.html',
  styleUrls: ['./list-assistants.component.scss']
})
export class ListAssistantsComponent implements OnInit {
  
  // Datos
  public teachingList: Teaching[] = [];
  public modalidades: Modalidad[] = [];
  public participaciones: Participacion[] = [];
  public profesiones: string[] = [];
  public areas: string[] = [];
  
  // Paginación
  public pageSize = 10;
  public skip = 0;
  public limit = 10;
  public totalData = 0;
  public currentPage = 1;
  public pageIndex = 0;
  public pageNumberArray: number[] = [];
  public serialNumberArray: number[] = [];
  
  // Filtros
  public searchTerm = '';
  public filtroEspecialidad = '';
  public filtroArea = '';
  public filtroModalidad: number | undefined;
  public filtroParticipacion: number | undefined;
  
  // Estado
  public loading = false;
  public teaching_selected: Teaching | null = null;
  
  // Control de expansión de cards
  public expandedCards: Set<number> = new Set();
  
  // Estadísticas
  public stats: TeachingStats = {
    total: 0,
    por_modalidad: {},
    por_participacion: {},
    total_horas: 0,
    evaluaciones_pendientes: 0
  };
  
  // Servicios
  private router = inject(Router);
  private translate = inject(TranslateService);
  private teachingService = inject(TeachingService);
  public permissionService = inject(PermissionService);
  private driverTourService = inject(DriverTourService);

  public selectedLang: string = 'es';

  constructor() {
    this.selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(this.selectedLang);
  }

  /**
   * Inicia el tour guiado de la lista de asistentes
   */
  public startAssistantsListTour(): void {
    this.driverTourService.startAssistantsListTour();
  }
  
  ngOnInit(): void {
    this.loadCatalogs();
    this.getTableData();
    this.getStats();
  }
  
  /**
   * Cargar catálogos de modalidades, participaciones, profesiones y áreas
   */
  loadCatalogs(): void {
    this.teachingService.getModalidades().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.modalidades = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar modalidades:', error);
      }
    });
    
    this.teachingService.getParticipaciones().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.participaciones = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar participaciones:', error);
      }
    });
    
    this.teachingService.getProfesiones().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profesiones = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar profesiones:', error);
      }
    });
    
    this.teachingService.getAreas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.areas = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar áreas:', error);
      }
    });
  }
  
  /**
   * Obtener datos de la tabla desde el servidor
   */
  public getTableData(): void {
    this.loading = true;
    
    const filters: TeachingFilters = {
      search: this.searchTerm || undefined,
      especialidad: this.filtroEspecialidad || undefined,
      area: this.filtroArea || undefined,
      modalidad_id: this.filtroModalidad,
      participacion_id: this.filtroParticipacion
    };
    
    console.log('Filtros aplicados:', filters);
    
    this.teachingService.getTeachings(this.currentPage, this.pageSize, filters).subscribe({
      next: (response) => {
        this.teachingList = response.data;
        this.totalData = response.total;
        this.calculateTotalPages(response.total, response.per_page);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener enseñanzas:', error);
        this.loading = false;
      }
    });
  }
  
  /**
   * Obtener estadísticas
   */
  public getStats(): void {
    this.teachingService.getStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error al obtener estadísticas:', error);
      }
    });
  }
  
  /**
   * Filtrar datos
   */
  public filterData(): void {
    this.currentPage = 1;
    this.pageIndex = 0;
    this.getTableData();
  }
  
  /**
   * Buscar
   */
  public searchData(): void {
    this.currentPage = 1;
    this.pageIndex = 0;
    this.getTableData();
  }
  
  /**
   * Limpiar filtros
   */
  public clearFilters(): void {
    this.searchTerm = '';
    this.filtroEspecialidad = '';
    this.filtroArea = '';
    this.filtroModalidad = undefined;
    this.filtroParticipacion = undefined;
    this.getTableData();
  }
  
  /**
   * Calcular total de páginas
   */
  private calculateTotalPages(totalData: number, pageSize: number): void {
    const pageCount = Math.ceil(totalData / pageSize);
    this.serialNumberArray = Array.from({ length: totalData }, (_, i) => i + 1);
    this.pageNumberArray = Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  
  /**
   * Navegar a una página específica
   */
  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.pageIndex = pageNumber - 1;
    this.skip = (pageNumber - 1) * this.pageSize;
    this.limit = this.pageSize;
    this.getTableData();
  }
  
  /**
   * Seleccionar registro para eliminar
   */
  public selectTeaching(teaching: Teaching): void {
    this.teaching_selected = teaching;
  }
  
  /**
   * Eliminar registro
   */
  public deleteTeaching(): void {
    if (!this.teaching_selected?.id) return;
    
    this.teachingService.deleteTeaching(this.teaching_selected.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Recargar datos sin mostrar mensaje
          this.getTableData();
          this.getStats();
        }
      },
      error: (error) => {
        console.error('Error al eliminar enseñanza:', error);
        this.translate.get('TEACHING.DELETE_ERROR').subscribe((text: string) => {
          alert(text);
        });
      }
    });
  }
  
  /**
   * Navegar a agregar registro
   */
  public addTeaching(): void {
    this.router.navigate(['/teaching/add_teaching']);
  }
  
  /**
   * Navegar a editar registro
   */
  public editTeaching(id: number): void {
    if (id) {
      this.router.navigate(['/teaching/edit_teaching', id]);
    }
  }
  
  /**
   * Navegar a evaluaciones pendientes
   */
  public goToEvaluaciones(): void {
    this.router.navigate(['/teaching/list_evaluation']);
  }
  
  /**
   * Toggle expansión de card
   */
  public toggleCardExpansion(teachingId: number | undefined): void {
    if (!teachingId) return;
    
    if (this.expandedCards.has(teachingId)) {
      this.expandedCards.delete(teachingId);
    } else {
      this.expandedCards.add(teachingId);
    }
  }
  
  /**
   * Verificar si una card está expandida
   */
  public isCardExpanded(teachingId: number | undefined): boolean {
    return teachingId ? this.expandedCards.has(teachingId) : false;
  }
  
  /**
   * Exportar a Excel
   */
  public exportToExcel(): void {
    const filters: TeachingFilters = {
      search: this.searchTerm || undefined,
      especialidad: this.filtroEspecialidad || undefined,
      area: this.filtroArea || undefined,
      modalidad_id: this.filtroModalidad,
      participacion_id: this.filtroParticipacion
    };
    
    this.teachingService.exportToExcel(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `enseñanzas_${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al exportar:', error);
        this.translate.get('TEACHING_MODULE.ASSISTANTS.EXCEL_EXPORT_ERROR').subscribe((text: string) => {
          alert(text);
        });
      }
    });
  }
  
  /**
   * Obtener nombre de modalidad por ID
   */
  public getModalidadNombre(id: number | undefined): string {
    if (!id) return 'N/A';
    const modalidad = this.modalidades.find(m => m.id === id);
    return modalidad?.nombre || 'N/A';
  }
  
  /**
   * Obtener nombre de participación por ID
   */
  public getParticipacionNombre(id: number | undefined): string {
    if (!id) return 'N/A';
    const participacion = this.participaciones.find(p => p.id === id);
    return participacion?.nombre || 'N/A';
  }
  
  /**
   * Calcular el total de horas de los registros visibles
   */
  public getTotalHoras(): number {
    if (!this.teachingList || this.teachingList.length === 0) {
      return 0;
    }
    
    return this.teachingList.reduce((total, teaching) => {
      if (!teaching.horas) return total;
      
      // Extraer el número de horas
      const horasStr = teaching.horas.toString().replace(/[^0-9.]/g, '');
      const horasNum = parseFloat(horasStr);
      
      return total + (isNaN(horasNum) ? 0 : horasNum);
    }, 0);
  }
  
  /**
   * Formatear horas para mostrar correctamente
   */
  public formatHoras(horas: string | undefined): string {
    if (!horas) return 'N/A';
    
    // Si ya viene formateado correctamente, devolverlo
    if (horas.includes('HRA') || horas.includes('HR')) {
      return horas;
    }
    
    // Intentar extraer el número
    const numero = parseFloat(horas);
    if (isNaN(numero)) {
      return horas; // Devolver el valor original si no es un número
    }
    
    // Formatear según el número
    if (numero === 1) {
      return '1 HRA.';
    } else if (numero > 1) {
      return `${numero} HRS.`;
    } else {
      return `${numero} HRA.`;
    }
  }
  
  /**
   * Formatear fecha
   */
  public formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    // Si la fecha ya está en formato DD/MM/YYYY, devolverla tal cual
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    // Si viene en formato ISO (2025-11-14T06:00:00.000000Z)
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Si no es una fecha válida, devolver el string original
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString;
    }
  }
  
  /**
   * Permisos - verificar si puede crear
   */
  canCreate(): boolean {
    return this.permissionService.hasPermission('add_teaching');
  }
  
  /**
   * Permisos - verificar si puede editar
   */
  canEdit(): boolean {
    return this.permissionService.hasPermission('edit_teaching');
  }
  
  /**
   * Permisos - verificar si puede eliminar
   */
  canDelete(): boolean {
    return this.permissionService.hasPermission('delete_teaching');
  }
  
  /**
   * Permisos - verificar si puede exportar
   */
  canExport(): boolean {
    return this.permissionService.hasPermission('teaching.export');
  }
  
  /**
   * Verificar si hay filtros activos
   */
  get hasActiveFilters(): boolean {
    return !!(
      this.searchTerm.trim() ||
      this.filtroEspecialidad.trim() ||
      this.filtroArea.trim() ||
      this.filtroModalidad ||
      this.filtroParticipacion
    );
  }
}
