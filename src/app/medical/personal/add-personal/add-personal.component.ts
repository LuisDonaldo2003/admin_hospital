import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PersonalService, Personal } from '../service/personal.service';

@Component({
  selector: 'app-add-personal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    KeyValuePipe
  ],
  templateUrl: './add-personal.component.html',
  styleUrls: ['./add-personal.component.scss']
})
export class AddPersonalComponent implements OnInit {

  // Propiedades del formulario
  nombre: string = '';
  apellidos: string = '';
  tipo: 'Clínico' | 'No Clínico' | '' = '';
  fechaIngreso: string;
  
  // Control del formulario
  submitted = false;
  loading = false;
  
  // Documentos
  documentos = new Map<string, File>();
  
  // Mensajes
  text_success = '';
  text_validation = '';

  // Lista de documentos requeridos
  documentosRequeridos = [
    'Acta de nacimiento',
    'Comprobante de domicilio',
    'CURP',
    'INE',
    'RFC',
    'Título profesional'
  ];

  constructor(
    private router: Router,
    private translate: TranslateService,
    private personalService: PersonalService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
    
    // Inicializar fecha de ingreso con fecha actual
    this.fechaIngreso = new Date().toLocaleDateString('es-ES');
  }

  ngOnInit(): void {}

  /**
   * Detectar si el modo oscuro está activo
   */
  isDarkMode(): boolean {
    return document.body.classList.contains('dark-mode');
  }

  /**
   * Manejar selección de archivos
   */
  onFileSelected(event: any, tipoDocumento: string): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file, tipoDocumento);
      event.target.value = ''; // Limpiar input
    }
  }

  /**
   * Procesar archivo (común para input y drag & drop)
   */
  processFile(file: File, tipoDocumento: string): void {
    // Validar que sea PDF
    if (file.type !== 'application/pdf') {
      this.text_validation = 'Solo se permiten archivos PDF';
      return;
    }
    
    // Validar tamaño máximo (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.text_validation = 'El archivo no puede superar los 10MB';
      return;
    }
    
    // Agregar archivo al mapa
    this.documentos.set(tipoDocumento, file);
    this.text_validation = ''; // Limpiar mensaje de error
  }

  /**
   * Eventos de drag & drop
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragEnter(event: DragEvent, element?: EventTarget | null): void {
    event.preventDefault();
    event.stopPropagation();
    if (element && element instanceof HTMLElement) {
      element.classList.add('drag-over');
    }
  }

  onDragLeave(event: DragEvent, element?: EventTarget | null): void {
    event.preventDefault();
    event.stopPropagation();
    if (element && element instanceof HTMLElement) {
      element.classList.remove('drag-over');
    }
  }

  onDrop(event: DragEvent, tipoDocumento: string, element?: EventTarget | null): void {
    event.preventDefault();
    event.stopPropagation();
    if (element && element instanceof HTMLElement) {
      element.classList.remove('drag-over');
    }

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.processFile(file, tipoDocumento);
    }
  }

  /**
   * Eliminar documento seleccionado
   */
  removeDocument(tipoDocumento: string): void {
    this.documentos.delete(tipoDocumento);
  }

  /**
   * Obtener lista de documentos faltantes
   */
  getMissingDocuments(): string[] {
    return this.documentosRequeridos.filter(tipo => !this.documentos.has(tipo));
  }

  /**
   * Validar formulario
   */
  validateForm(): boolean {
    this.text_validation = '';

    // Validar campos básicos
    if (!this.nombre.trim()) {
      this.text_validation = 'El nombre es requerido';
      return false;
    }

    if (this.nombre.trim().length < 2) {
      this.text_validation = 'El nombre debe tener al menos 2 caracteres';
      return false;
    }

    if (!this.apellidos.trim()) {
      this.text_validation = 'Los apellidos son requeridos';
      return false;
    }

    if (this.apellidos.trim().length < 2) {
      this.text_validation = 'Los apellidos deben tener al menos 2 caracteres';
      return false;
    }

    if (!this.tipo) {
      this.text_validation = 'El tipo de personal es requerido';
      return false;
    }

    // Los documentos son opcionales - no se requiere validación obligatoria
    // Si hay documentos faltantes, el personal se marcará como "documentos incompletos"

    return true;
  }

  /**
   * Guardar personal
   */
  save(): void {
    this.submitted = true;
    this.text_success = '';
    this.text_validation = '';

    // Validar formulario
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    // Preparar datos del personal
    const personalData: Personal = {
      nombre: this.nombre.trim(),
      apellidos: this.apellidos.trim(),
      tipo: this.tipo as 'Clínico' | 'No Clínico'
    };

    // Enviar datos a la API
    this.personalService.storePersonalWithDocuments(personalData, this.documentos)
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            // Mensaje personalizado según el estado de documentos
            if (this.documentos.size === 6) {
              this.text_success = 'Personal guardado exitosamente con todos los documentos completos.';
            } else {
              this.text_success = `Personal guardado exitosamente. Documentos subidos: ${this.documentos.size}/6. Se marcará como "documentos incompletos".`;
            }
            
            // Opcional: redirigir después de unos segundos
            setTimeout(() => {
              this.goToList();
            }, 3000);
          } else {
            this.text_validation = response.message || 'Error al guardar el personal';
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al guardar personal:', error);
          
          if (error.status === 422 && error.error && error.error.errors) {
            // Errores de validación del servidor
            const errores = error.error.errors;
            const mensajesError = [];
            
            for (const campo in errores) {
              if (errores[campo] && errores[campo].length > 0) {
                mensajesError.push(errores[campo][0]);
              }
            }
            
            this.text_validation = mensajesError.join('. ');
          } else if (error.error && error.error.message) {
            this.text_validation = error.error.message;
          } else {
            this.text_validation = 'Error de conexión. Intente nuevamente.';
          }
        }
      });
  }

  /**
   * Ir a la lista de personal
   */
  goToList(): void {
    this.router.navigate(['/personal/list_personal']);
  }
}
