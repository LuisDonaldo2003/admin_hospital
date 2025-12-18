import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PersonalService, Personal } from '../service/personal.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

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

  // Control de subida de archivos
  isUploadingFiles = false;
  uploadProgress = 0;
  totalFilesToUpload = 0;
  filesUploaded = 0;

  // Documentos pendientes de subida
  // Clave: Tipo de documento, Valor: Array de archivos (para soportar múltiples constancias)
  documentosPendientes = new Map<string, File[]>();

  // Mensajes
  showSuccess: boolean = false;
  showValidation: boolean = false;
  serverValidationMessage: string = '';

  // Lista de documentos requeridos disponibles
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
  readonly MAX_FILE_SIZE = 500 * 1024; // 500KB
  readonly ALLOWED_FILE_TYPE = 'application/pdf';

  constructor(
    private router: Router,
    private translate: TranslateService,
    private personalService: PersonalService,
    private driverTourService: DriverTourService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
    this.fechaIngreso = new Date().toLocaleDateString('es-ES');
  }

  public startPersonalFormTour(): void {
    this.driverTourService.startPersonalFormTour();
  }

  ngOnInit(): void { }

  isDarkMode(): boolean {
    return document.body.classList.contains('dark-mode');
  }

  /**
   * Manejar selección de archivos (Input)
   */
  onFileSelected(event: any, tipoDocumento: string): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files), tipoDocumento);
      event.target.value = ''; // Limpiar input
    }
  }

  /**
   * Manejar Drop de archivos
   */
  onDrop(event: DragEvent, tipoDocumento: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.removeDragOverClass(event.currentTarget as HTMLElement);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files), tipoDocumento);
    }
  }

  /**
   * Eventos Drag & Drop visuales
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.addDragOverClass(event.currentTarget as HTMLElement);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.removeDragOverClass(event.currentTarget as HTMLElement);
  }

  private addDragOverClass(element: HTMLElement | null): void {
    if (element) element.classList.add('drag-over');
  }

  private removeDragOverClass(element: HTMLElement | null): void {
    if (element) element.classList.remove('drag-over');
  }

  /**
   * Procesar archivos seleccionados o soltados
   */
  processFiles(files: File[], tipoDocumento: string): void {
    this.serverValidationMessage = '';
    this.showValidation = false;

    for (const file of files) {
      if (!this.validateFile(file)) return;
    }

    // Agregar a la lista de pendientes
    const currentFiles = this.documentosPendientes.get(tipoDocumento) || [];

    if (tipoDocumento === 'Constancias de cursos') {
      // Concatenar nuevos
      this.documentosPendientes.set(tipoDocumento, [...currentFiles, ...files]);
    } else {
      // Reemplazar (solo 1 permitido para otros tipos por ahora en UI simple, aunque el map soporta array)
      this.documentosPendientes.set(tipoDocumento, [files[0]]);
    }
  }

  /**
   * Validar archivo individual
   */
  validateFile(file: File): boolean {
    if (file.type !== this.ALLOWED_FILE_TYPE) {
      this.serverValidationMessage = `Solo PDF permitidos. Archivo inválido: ${file.name}`;
      this.showValidation = true;
      return false;
    }
    if (file.size > this.MAX_FILE_SIZE) {
      this.serverValidationMessage = `El archivo ${file.name} excede 500KB.`;
      this.showValidation = true;
      return false;
    }
    if (file.size < 100) { // Muy pequeño
      this.serverValidationMessage = `El archivo ${file.name} parece estar vacío o corrupto.`;
      this.showValidation = true;
      return false;
    }
    return true;
  }

  /**
   * Remover documento de la lista de pendientes
   */
  removeDocument(tipoDocumento: string, index: number): void {
    const files = this.documentosPendientes.get(tipoDocumento);
    if (files) {
      files.splice(index, 1);
      if (files.length === 0) {
        this.documentosPendientes.delete(tipoDocumento);
      }
    }
  }

  /**
   * Obtener archivos pendientes para mostrar en UI
   */
  getPendingFiles(tipoDocumento: string): File[] {
    return this.documentosPendientes.get(tipoDocumento) || [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Validar formulario completo
   */
  validateForm(): boolean {
    if (!this.nombre.trim() || !this.apellidos.trim() || !this.tipo) return false;
    if (!this.rfc.trim() || !this.numeroChecador.trim()) return false;
    return true;
  }

  /**
   * Guardar Personal y luego subir archivos
   */
  save(): void {
    this.submitted = true;
    this.showSuccess = false;
    this.showValidation = false;
    this.serverValidationMessage = '';

    if (!this.validateForm()) {
      this.serverValidationMessage = 'Por favor complete los campos requeridos.';
      this.showValidation = true;
      return;
    }

    this.loading = true;

    // 1. Crear Personal
    const personalData: Personal = {
      nombre: this.nombre.trim(),
      apellidos: this.apellidos.trim(),
      tipo: this.tipo as 'Clínico' | 'No Clínico',
      rfc: this.rfc.trim().toUpperCase(),
      numero_checador: this.numeroChecador.trim(),
      activo: true
    };

    this.personalService.storePersonal(personalData).subscribe({
      next: (resp) => {
        if (resp.success && resp.data.id) {
          // Personal creado, proceder a subir archivos si existen
          if (this.documentosPendientes.size > 0) {
            this.uploadFiles(resp.data.id);
          } else {
            this.loading = false;
            this.showSuccess = true;
            this.finishProcess();
          }
        } else {
          this.loading = false;
          this.serverValidationMessage = resp.message || 'Error al crear personal';
          this.showValidation = true;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.handleError(err);
      }
    });
  }

  /**
   * Subir archivos secuencialmente 
   */
  async uploadFiles(personalId: number) {
    this.isUploadingFiles = true;
    this.uploadProgress = 0;

    // Aplanar mapa a lista de tareas: {tipo, archivo}
    const uploadTasks: { tipo: string, file: File }[] = [];
    this.documentosPendientes.forEach((files, tipo) => {
      files.forEach(f => uploadTasks.push({ tipo: tipo, file: f }));
    });

    this.totalFilesToUpload = uploadTasks.length;
    this.filesUploaded = 0;

    let errorCount = 0;

    // Ejecutar subidas
    for (const task of uploadTasks) {
      try {
        await new Promise<void>((resolve, reject) => {
          this.personalService.uploadDocument(personalId, task.tipo, task.file).subscribe({
            next: (res) => {
              if (res.success) resolve();
              else reject(res.message);
            },
            error: (err) => reject(err)
          });
        });
        this.filesUploaded++;
        this.uploadProgress = Math.round((this.filesUploaded / this.totalFilesToUpload) * 100);
      } catch (e) {
        console.error(`Error subiendo ${task.tipo}:`, e);
        errorCount++;
      }
    }

    this.isUploadingFiles = false;
    this.loading = false;
    this.showSuccess = true;

    if (errorCount > 0) {
      this.serverValidationMessage = `Personal creado, pero fallaron ${errorCount} documentos. Puede reintentar en Editar.`;
      this.showValidation = true;
    }

    this.finishProcess();
  }

  finishProcess() {
    setTimeout(() => {
      this.router.navigate(['/personal/list_personal']); // Redirigir a 'list', no 'list_personal' segun routing
    }, 2500);
  }

  handleError(error: any) {
    if (error.error && error.error.errors) {
      const msgs = Object.values(error.error.errors).flat() as string[];
      this.serverValidationMessage = msgs.join('. ');
    } else {
      this.serverValidationMessage = error.error?.message || 'Error desconocido';
    }
    this.showValidation = true;
  }

  goToList(): void {
    this.router.navigate(['/personal/list_personal']);
  }
}
