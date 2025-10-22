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
  rfc: string = '';
  numeroChecador: string = '';
  
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
    'Título profesional',
    'Constancias de cursos',
    'Cédula profesional'
  ];

  // Configuración de archivos
  readonly MAX_FILE_SIZE = 500 * 1024; // 500KB máximo para PDFs de documentos
  readonly ALLOWED_FILE_TYPE = 'application/pdf';
  readonly ALLOWED_FILE_EXTENSIONS = ['.pdf'];

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
    // Limpiar mensajes previos
    this.text_validation = '';
    
    // Validar extensión del archivo
    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.ALLOWED_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      this.text_validation = `Solo se permiten archivos PDF. Archivo seleccionado: ${file.name}`;
      return;
    }
    
    // Validar tipo MIME
    if (file.type !== this.ALLOWED_FILE_TYPE) {
      this.text_validation = `Tipo de archivo no válido. Solo se permiten archivos PDF.`;
      return;
    }
    
    // Validar tamaño del archivo
    if (file.size > this.MAX_FILE_SIZE) {
      const sizeInKB = (file.size / 1024).toFixed(0);
      const maxSizeInKB = (this.MAX_FILE_SIZE / 1024).toFixed(0);
      this.text_validation = `El archivo es demasiado grande (${sizeInKB}KB). Tamaño máximo permitido: ${maxSizeInKB}KB para documentos PDF.`;
      return;
    }
    
    // Validar tamaño mínimo (evitar archivos corruptos o vacíos)
    if (file.size < 1024) { // 1KB mínimo
      this.text_validation = `El archivo parece estar dañado o vacío. Tamaño mínimo: 1KB.`;
      return;
    }
    
    // Validar que no se exceda el límite total de archivos
    if (this.documentos.size >= this.documentosRequeridos.length && !this.documentos.has(tipoDocumento)) {
      this.text_validation = `Ya has subido el máximo de ${this.documentosRequeridos.length} documentos permitidos.`;
      return;
    }
    
    // Si ya existe un documento de este tipo, mostramos mensaje de reemplazo
    if (this.documentos.has(tipoDocumento)) {
      console.log(`Reemplazando documento existente: ${tipoDocumento}`);
    }
    
    // Agregar archivo al mapa
    this.documentos.set(tipoDocumento, file);
    
    // Mostrar mensaje de éxito temporal
    const sizeInKB = (file.size / 1024).toFixed(1);
    console.log(`Documento "${tipoDocumento}" cargado exitosamente (${sizeInKB}KB)`);
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
    this.text_validation = ''; // Limpiar mensajes de error al eliminar
  }

  /**
   * Formatear tamaño de archivo para mostrar al usuario
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Verificar si el archivo es de tamaño apropiado (para mostrar advertencias visuales)
   */
  isFileSizeAppropriate(file: File): boolean {
    // Para documentos PDF, consideramos apropiado entre 50KB y 1MB
    const minAppropriateSize = 50 * 1024; // 50KB
    const maxAppropriateSize = 1024 * 1024; // 1MB
    
    return file.size >= minAppropriateSize && file.size <= maxAppropriateSize;
  }

  /**
   * Obtener lista de documentos faltantes
   */
  getMissingDocuments(): string[] {
    return this.documentosRequeridos.filter(tipo => !this.documentos.has(tipo));
  }

  /**
   * Obtener el tamaño total de todos los documentos cargados
   */
  getTotalDocumentsSize(): string {
    let totalSize = 0;
    for (const [_, file] of this.documentos) {
      totalSize += file.size;
    }
    return this.formatFileSize(totalSize);
  }

  /**
   * Obtener información de un documento específico
   */
  getDocumentInfo(tipoDocumento: string): { name: string, size: string, sizeWarning: boolean } | null {
    const file = this.documentos.get(tipoDocumento);
    if (!file) return null;
    
    return {
      name: file.name,
      size: this.formatFileSize(file.size),
      sizeWarning: !this.isFileSizeAppropriate(file)
    };
  }

  /**
   * Validar formulario
   */
  validateForm(): boolean {
    this.text_validation = '';

    // Validar campos básicos
    if (!this.nombre?.trim()) {
      this.text_validation = 'El nombre es requerido';
      return false;
    }

    if (this.nombre.trim().length < 2) {
      this.text_validation = 'El nombre debe tener al menos 2 caracteres';
      return false;
    }

    if (!this.apellidos?.trim()) {
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

  // Validar RFC
  console.log('Validando RFC:', this.rfc, 'Longitud:', this.rfc?.length);
  if (!this.rfc || !this.rfc.trim()) {
    this.text_validation = 'El RFC es requerido';
    return false;
  }

  const rfcTrimmed = this.rfc.trim();
  console.log('RFC trimmed:', rfcTrimmed, 'Longitud:', rfcTrimmed.length);
  if (rfcTrimmed.length < 10 || rfcTrimmed.length > 13) {
    this.text_validation = 'El RFC debe tener entre 10 y 13 caracteres';
    return false;
  }

  // Validar RFC formato básico (letras/números)
  const rfcPattern = /^[A-Z0-9]+$/;
  if (!rfcPattern.test(rfcTrimmed.toUpperCase()) || rfcTrimmed.length > 13) {
    this.text_validation = 'El RFC solo puede contener letras y números (máximo 13 caracteres)';
    return false;
  }

  // Validar número de checador
  console.log('Validando número de checador:', this.numeroChecador, 'Longitud:', this.numeroChecador?.length);
  if (!this.numeroChecador || !this.numeroChecador.trim()) {
    this.text_validation = 'El número de checador es requerido';
    return false;
  }

  if (!/^[0-9]{1,4}$/.test(this.numeroChecador.trim())) {
    this.text_validation = 'El número de checador debe tener entre 1 y 4 dígitos';
    return false;
  }    // Validar archivos cargados
    if (this.documentos.size > 0) {
      for (const [tipoDoc, file] of this.documentos) {
        // Re-validar cada archivo por seguridad
        if (file.size > this.MAX_FILE_SIZE) {
          const sizeInKB = (file.size / 1024).toFixed(0);
          const maxSizeInKB = (this.MAX_FILE_SIZE / 1024).toFixed(0);
          this.text_validation = `El archivo "${tipoDoc}" es demasiado grande (${sizeInKB}KB). Máximo permitido: ${maxSizeInKB}KB`;
          return false;
        }
        
        if (file.type !== this.ALLOWED_FILE_TYPE) {
          this.text_validation = `El archivo "${tipoDoc}" no es un PDF válido`;
          return false;
        }

        // Advertencia para archivos muy pequeños (posible corrupción)
        if (file.size < 1024) {
          this.text_validation = `El archivo "${tipoDoc}" parece estar dañado o vacío (tamaño: ${file.size} bytes)`;
          return false;
        }
      }
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
      tipo: this.tipo as 'Clínico' | 'No Clínico',
      rfc: this.rfc.trim().toUpperCase(),
      numero_checador: this.numeroChecador.trim()
    };

    // Enviar datos a la API
    this.personalService.storePersonalWithDocuments(personalData, this.documentos)
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            // Mensaje personalizado según el estado de documentos
            if (this.documentos.size === 7) {
              this.text_success = 'Personal guardado exitosamente con todos los documentos completos.';
            } else {
              this.text_success = `Personal guardado exitosamente. Documentos subidos: ${this.documentos.size}/7. Se marcará como "documentos incompletos".`;
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
