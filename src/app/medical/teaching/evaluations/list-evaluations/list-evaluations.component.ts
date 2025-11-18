import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TeachingService } from '../../services/teaching.service';
import { Evaluacion, EvaluacionStats } from '../../models/teaching.interface';

/**
 * Componente para seguimiento de evaluaciones pendientes
 * Basado en la hoja "Hoja3" del Excel
 */
@Component({
  selector: 'app-list-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './list-evaluations.component.html',
  styleUrls: ['./list-evaluations.component.scss']
})
export class ListEvaluationsComponent implements OnInit {
  
  public evaluaciones: Evaluacion[] = [];
  public loading = false;
  
  // Paginación
  public pageSize = 10;
  public currentPage = 1;
  public totalData = 0;
  public pageNumberArray: number[] = [];
  
  // Filtros
  public filtroEstado = 'PENDIENTE';
  public searchTerm = '';
  
  // Control de expansión de cards
  public expandedCards: Set<number> = new Set();
  
  // Eliminación
  public evaluacionToDelete: Evaluacion | null = null;
  public deleting = false;
  
  // Notificaciones
  public text_success: string = '';
  public text_validation: string = '';
  
  // Estadísticas
  public stats: EvaluacionStats = {
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    reprobadas: 0
  };
  
  // Math para usar en template
  public Math = Math;
  
  private router = inject(Router);
  private translate = inject(TranslateService);
  private teachingService = inject(TeachingService);

  public selectedLang: string = 'es';

  constructor() {
    this.selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(this.selectedLang);
  }
  
  ngOnInit(): void {
    this.getEvaluaciones();
    this.getStats();
  }
  
  getEvaluaciones(): void {
    this.loading = true;
    
    if (this.filtroEstado === 'PENDIENTE') {
      this.teachingService.getEvaluacionesPendientes().subscribe({
        next: (response) => {
          this.evaluaciones = response.data;
          this.totalData = response.total;
          this.calculateTotalPages(response.total, response.per_page);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar evaluaciones pendientes:', error);
          this.loading = false;
        }
      });
    } else {
      this.teachingService.getEvaluaciones(this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.evaluaciones = response.data;
          this.totalData = response.total;
          this.calculateTotalPages(response.total, response.per_page);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar evaluaciones:', error);
          this.loading = false;
        }
      });
    }
  }
  
  getStats(): void {
    this.teachingService.getEvaluacionesStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }
  
  searchData(): void {
    this.currentPage = 1;
    this.getEvaluaciones();
  }
  
  filterData(): void {
    this.currentPage = 1;
    this.getEvaluaciones();
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.filtroEstado = 'PENDIENTE';
    this.currentPage = 1;
    this.getEvaluaciones();
  }
  
  private calculateTotalPages(totalData: number, pageSize: number): void {
    const pageCount = Math.ceil(totalData / pageSize);
    this.pageNumberArray = Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  
  moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.getEvaluaciones();
  }
  
  toggleCard(id: number): void {
    if (this.expandedCards.has(id)) {
      this.expandedCards.delete(id);
    } else {
      this.expandedCards.add(id);
    }
  }
  
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  }
  
  goBack(): void {
    this.router.navigate(['/teaching/list_teaching']);
  }
  
  /**
   * Navegar a formulario de nueva evaluación
   */
  addEvaluacion(): void {
    this.router.navigate(['/teaching/add_evaluation']);
  }
  
  /**
   * Editar evaluación existente
   */
  editEvaluacion(evaluacion: Evaluacion): void {
    this.router.navigate(['/teaching/edit_evaluation', evaluacion.id]);
  }
  
  /**
   * Preparar eliminación de evaluación
   */
  deleteEvaluacion(evaluacion: Evaluacion): void {
    this.evaluacionToDelete = evaluacion;
    this.openModal('deleteModal');
  }
  
  /**
   * Confirmar y ejecutar eliminación
   */
  confirmDelete(): void {
    if (!this.evaluacionToDelete?.id) return;
    
    this.deleting = true;
    this.text_success = '';
    this.text_validation = '';
    
    this.teachingService.deleteEvaluacion(this.evaluacionToDelete.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.text_success = 'Evaluación eliminada correctamente';
          this.closeModal('deleteModal');
          this.getEvaluaciones();
          this.getStats();
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Error al eliminar evaluación:', error);
        this.text_validation = 'Error al eliminar la evaluación';
        this.deleting = false;
      }
    });
  }
  
  /**
   * Abrir modal de Bootstrap
   */
  private openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
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
  }
}
