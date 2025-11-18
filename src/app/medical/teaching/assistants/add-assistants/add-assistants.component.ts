import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TeachingService } from '../../services/teaching.service';
import { Teaching, Modalidad, Participacion } from '../../models/teaching.interface';

@Component({
  selector: 'app-add-assistants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-assistants.component.html',
  styleUrls: ['./add-assistants.component.scss']
})
export class AddAssistantsComponent implements OnInit {
  
  public teaching: Teaching = {
    profesion: '',
    nombre: '',
    area: '',
    adscripcion: 'HOSPITAL GENERAL REGIONAL "DR. GUILLERMO SOBERÓN ACEVEDO"',
    nombre_evento: '',
    fecha: '',
    horas: '',
    foja: ''
  };
  
  public modalidades: Modalidad[] = [];
  public participaciones: Participacion[] = [];
  public profesiones: string[] = [];
  public areas: string[] = [];
  
  public isEditMode = false;
  public teachingId: number | null = null;
  public loading = false;
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
    this.loadCatalogs();
    
    // Verificar si es modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.teachingId = +params['id'];
        this.loadTeaching(this.teachingId);
      }
    });
  }
  
  loadCatalogs(): void {
    // Cargar modalidades
    this.teachingService.getModalidades().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.modalidades = response.data;
        }
      },
      error: (err) => console.error('Error cargando modalidades:', err)
    });
    
    // Cargar participaciones
    this.teachingService.getParticipaciones().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.participaciones = response.data;
        }
      },
      error: (err) => console.error('Error cargando participaciones:', err)
    });

    // Cargar profesiones desde backend
    this.teachingService.getProfesiones().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profesiones = response.data;
        }
      },
      error: (err) => {
        console.error('Error cargando profesiones:', err);
        // Mantener valores por defecto del import
      }
    });

    // Cargar áreas desde backend
    this.teachingService.getAreas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.areas = response.data;
        }
      },
      error: (err) => {
        console.error('Error cargando áreas:', err);
        // Mantener valores por defecto del import
      }
    });
  }
  
  loadTeaching(id: number): void {
    this.loading = true;
    this.teachingService.getTeaching(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.teaching = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar enseñanza:', error);
        this.loading = false;
      }
    });
  }
  
  save(): void {
    this.loading = true;
    this.text_success = '';
    this.text_validation = '';
    
    const request = this.isEditMode && this.teachingId
      ? this.teachingService.updateTeaching(this.teachingId, this.teaching)
      : this.teachingService.createTeaching(this.teaching);
    
    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.text_success = this.isEditMode ? 'Registro actualizado correctamente' : 'Registro creado correctamente';
          setTimeout(() => {
            this.goToList();
          }, 2000);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.text_validation = 'Error al guardar el registro';
        this.loading = false;
      }
    });
  }
  
  goToList(): void {
    this.router.navigate(['/teaching/list_teaching']);
  }
}
