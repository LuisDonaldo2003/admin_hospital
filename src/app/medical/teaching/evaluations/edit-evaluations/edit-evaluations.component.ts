import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TeachingService } from '../../services/teaching.service';
import { Evaluacion } from '../../models/teaching.interface';

/**
 * Componente para editar evaluaciones
 */
@Component({
  selector: 'app-edit-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './edit-evaluations.component.html',
  styleUrls: ['./edit-evaluations.component.scss']
})
export class EditEvaluationsComponent implements OnInit {
  
  public evaluacion: Evaluacion = this.getEmptyEvaluacion();
  public isEditMode = false;
  public evaluacionId: number | null = null;
  public saving = false;
  public loading = false;
  
  // Notificaciones
  public text_success: string = '';
  public text_validation: string = '';
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private teachingService = inject(TeachingService);

  public selectedLang: string = 'es';

  constructor() {
    this.selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(this.selectedLang);
  }
  
  ngOnInit(): void {
    this.isEditMode = true;
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.evaluacionId = +params['id'];
        this.loadEvaluacion(this.evaluacionId);
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
      error: (error) => {
        console.error('Error al cargar evaluación:', error);
        this.text_validation = 'Error al cargar la evaluación';
        this.loading = false;
      }
    });
  }
  
  saveEvaluacion(): void {
    this.saving = true;
    this.text_success = '';
    this.text_validation = '';
    
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
    this.router.navigate(['/teaching/list_evaluation']);
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
