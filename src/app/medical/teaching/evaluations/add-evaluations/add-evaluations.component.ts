import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TeachingService } from '../../services/teaching.service';
import { Evaluacion } from '../../models/teaching.interface';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

/**
 * Componente para agregar evaluaciones
 */
@Component({
  selector: 'app-add-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-evaluations.component.html',
  styleUrls: ['./add-evaluations.component.scss']
})
export class AddEvaluationsComponent implements OnInit {
  
  public evaluacion: Evaluacion = this.getEmptyEvaluacion();
  public isEditMode = false;
  public evaluacionId: number | null = null;
  public saving = false;
  public loading = false;
  public profesiones: string[] = [];
  public submitted = false;
  
  // Notificaciones
  public text_success: string = '';
  public text_validation: string = '';
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private teachingService = inject(TeachingService);
  private driverTourService = inject(DriverTourService);

  public selectedLang: string = 'es';

  constructor() {
    this.selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(this.selectedLang);
  }

  /**
   * Inicia el tour guiado del formulario de agregar evaluación
   */
  public startEvaluationsFormTour(): void {
    this.driverTourService.startEvaluationsFormTour();
  }
  
  ngOnInit(): void {
    // Cargar datos necesarios para el formulario
    this.loadProfesiones();
  }

  private loadProfesiones(): void {
    this.teachingService.getProfesiones().subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          this.profesiones = response.data;
        } else {
          this.profesiones = [];
        }
      },
      error: (err) => {
        console.error('Error cargando profesiones:', err);
        this.profesiones = [];
      }
    });
  }
  
  private getEmptyEvaluacion(): Evaluacion {
    return {
      fecha_inicio: '',
      fecha_limite: '',
      especialidad: '',
      nombre: '',
      estado: 'PENDIENTE',
      observaciones: ''
    };
  }
  
  private loadEvaluacion(id: number): void {
    this.loading = true;
    this.teachingService.getEvaluacion(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.evaluacion = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar evaluación:', err);
        this.text_validation = this.translate.instant('TEACHING_MODULE.EVALUATIONS.LOAD_ERROR');
        this.loading = false;
      }
    });
  }
  
  saveEvaluacion(): void {
    this.submitted = true;
    this.text_success = '';
    this.text_validation = '';
    
    // Validar campos requeridos
    if (!this.isFormValid()) {
      this.text_validation = 'Por favor, completa todos los campos requeridos';
      return;
    }
    
    this.saving = true;
    
    const request = this.isEditMode && this.evaluacionId
      ? this.teachingService.updateEvaluacion(this.evaluacionId, this.evaluacion)
      : this.teachingService.createEvaluacion(this.evaluacion);
    
    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.text_success = this.isEditMode 
            ? 'Evaluación actualizada correctamente' 
            : 'Evaluación creada correctamente';
          
          // Esperar 2 segundos antes de redirigir
          setTimeout(() => {
            this.router.navigate(['/teaching/list_evaluation']);
          }, 2000);
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Error al guardar evaluación:', error);
        this.text_validation = error.error?.message || 'Error al guardar la evaluación';
        this.saving = false;
      }
    });
  }
  
  cancel(): void {
    this.router.navigate(['/teaching/evaluations']);
  }
  
  isFormValid(): boolean {
    return !!(
      this.evaluacion.fecha_limite &&
      this.evaluacion.especialidad &&
      this.evaluacion.nombre &&
      this.evaluacion.estado
    );
  }
}
