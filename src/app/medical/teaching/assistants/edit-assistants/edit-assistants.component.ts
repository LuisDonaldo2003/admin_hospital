import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TeachingService } from '../../services/teaching.service';
import { Teaching, Modalidad, Participacion } from '../../models/teaching.interface';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

interface TeachingForm {
  id?: number;
  // Assistant fields
  profesion: string;
  nombre: string;
  area: string;
  adscripcion: string;
  correo?: string;
  ei?: string;
  ef?: string;

  // Event fields (optional in edit mode)
  nombre_evento?: string;
  tema?: string;
  fecha?: string;
  horas?: string;
  foja?: string;
  modalidad_id?: number;
  participacion_id?: number;
}

@Component({
  selector: 'app-edit-assistants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './edit-assistants.component.html',
  styleUrls: ['./edit-assistants.component.scss']
})
export class EditAssistantsComponent implements OnInit {

  public teaching: TeachingForm = {
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
  public modal_validation: string = '';
  public submitted = false;

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
   * Inicia el tour guiado del formulario de editar asistente
   */
  public startEditAssistantTour(): void {
    this.driverTourService.startEditAssistantTour();
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
      }
    });
  }

  // Event Management Logic
  public eventsList: any[] = [];
  public showEventModal = false;
  public event_selected: any = null;

  public newEvent: any = {
    nombre_evento: '',
    tema: '',
    fecha: '',
    horas: '',
    foja: '',
    modalidad_id: undefined,
    participacion_id: undefined
  };

  /**
   * Cargar datos del asistente y sus eventos
   */
  loadTeaching(id: number): void {
    this.loading = true;
    this.teachingService.getTeaching(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Map backend data (TA) to local form
          const data: any = response.data;
          this.teaching = {
            id: data.id,
            profesion: data.profesion || '',
            nombre: data.nombre || '',
            area: data.area || '',
            adscripcion: data.adscripcion || '',
            correo: data.correo || '',
            ei: data.ei || '',
            ef: data.ef || '',
          };
          // Store full events list for history
          this.eventsList = data.events || [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar enseñanza:', error);
        this.loading = false;
      }
    });
  }

  // --- Modal Logic ---

  openEventModal() {
    this.newEvent = {
      nombre_evento: '',
      tema: '',
      fecha: '',
      horas: '',
      foja: '',
      modalidad_id: undefined,
      participacion_id: undefined
    };
    this.showEventModal = true;
  }

  closeEventModal() {
    this.showEventModal = false;
  }

  saveEvent() {
    if (!this.teachingId) return;

    // Validate
    if (!this.newEvent.nombre_evento || !this.newEvent.fecha || !this.newEvent.modalidad_id || !this.newEvent.participacion_id) {
      this.modal_validation = 'Por favor complete los campos obligatorios (*)';
      // Auto-clear validation message after 3 seconds
      setTimeout(() => this.modal_validation = '', 3000);
      return;
    }

    this.loading = true;
    // Call service to add event
    this.teachingService.createEvent(this.teachingId, this.newEvent).subscribe({
      next: (res) => {
        if (res.success) {
          this.closeEventModal();
          this.loadTeaching(this.teachingId!);
          this.text_success = 'Evento registrado correctamente';
          setTimeout(() => this.text_success = '', 3000);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error saving event', err);
        this.modal_validation = 'Error al registrar el evento';
        this.loading = false;
      }
    });
  }

  public selectEvent(event: any) {
    this.event_selected = event;
  }

  deleteEvent() {
    if (!this.event_selected?.id) return;

    this.loading = true;
    this.teachingService.deleteTeachingEvent(this.event_selected.id).subscribe({
      next: () => {
        this.loadTeaching(this.teachingId!);
        this.loading = false;
        this.event_selected = null;
      },
      error: (err) => {
        console.error('Error deleting event', err);
        this.loading = false;
        this.event_selected = null;
      }
    });
  }

  getModalidadName(id: number): string {
    const mod = this.modalidades.find(m => m.id === id);
    return mod ? mod.nombre : 'N/A';
  }

  getParticipacionName(id: number): string {
    const part = this.participaciones.find(p => p.id === id);
    return part ? part.nombre : 'N/A';
  }

  /**
   * Validar campos antes de guardar y mostrar alertas específicas
   */

  validateAndSave(): void {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    // Validar campos requeridos básicos (Asistente)
    if (!this.teaching.profesion || !this.teaching.nombre || !this.teaching.area || !this.teaching.adscripcion) {
      return;
    }

    // Si NO es modo edición (es decir, estamos Creando), validamos también los campos del evento
    if (!this.isEditMode) {
      if (!this.teaching.nombre_evento || !this.teaching.fecha || !this.teaching.modalidad_id ||
        !this.teaching.participacion_id || !this.teaching.horas || !this.teaching.foja) {
        return;
      }
    }

    // Si todo está completo, proceder a guardar
    this.save();
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
