import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PersonalService, Personal, PersonalDocument } from '../service/personal.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-edit-personal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    KeyValuePipe
  ],
  templateUrl: './edit-personal.component.html',
  styleUrls: ['./edit-personal.component.scss']
})
export class EditPersonalComponent implements OnInit {

  // Propiedades del formulario
  nombre: string = '';
  apellidos: string = '';
  tipo: 'Clínico' | 'No Clínico' | '' = '';
  fechaIngreso: string = '';
  activo: boolean = true;
  rfc: string = '';
  numeroChecador: string = '';
  
  // Control del formulario
  submitted = false;
  loading = false;
  loadingPersonal = true;
  
  // ID del personal a editar
  personalId: number = 0;
  
  // Documentos existentes y nuevos
  documentosExistentes: PersonalDocument[] = [];
  documentosNuevos = new Map<string, File>();
  
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private personalService: PersonalService
    ,
    private driverTourService: DriverTourService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    this.personalId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.personalId) {
      this.cargarDatosPersonal();
    } else {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.INVALID_ID');
      this.loadingPersonal = false;
    }
  }

  /**
   * Cargar datos del personal desde el servidor
   */
  cargarDatosPersonal(): void {
    this.loadingPersonal = true;

    this.personalService.showPersonal(this.personalId).subscribe({
      next: (response) => {
        this.loadingPersonal = false;
        if (response.success) {
          const personal = response.data;
          this.nombre = personal.nombre;
          this.apellidos = personal.apellidos;
          this.tipo = personal.tipo;
          this.fechaIngreso = personal.fecha_ingreso || '';
          this.activo = personal.activo !== false;
          this.rfc = personal.rfc || '';
          this.numeroChecador = personal.numero_checador || '';

          // Cargar documentos existentes
          this.cargarDocumentos();
        } else {
          this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.LOAD_ERROR');
        }
      },
      error: (error) => {
        this.loadingPersonal = false;
        console.error('Error al cargar personal:', error);
        this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.LOAD_ERROR');
      }
    });
  }

  /**
   * Añadir archivo nuevo (validación reutilizable)
   */
  private addNewFile(file: File, tipoDocumento: string): void {
    // Validar que sea PDF
    if (file.type !== 'application/pdf') {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.PDF_ONLY');
      return;
    }

    // Validar tamaño máximo (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.FILE_SIZE_LIMIT');
      return;
    }

    // Agregar archivo nuevo (reemplazará el existente)
    this.documentosNuevos.set(tipoDocumento, file);
    this.text_validation = ''; // Limpiar mensaje de error
  }

  /**
   * Detectar si el modo oscuro está activo (para binding en template)
   */
  isDarkMode(): boolean {
    return document.body.classList.contains('dark-mode');
  }

  /**
   * Eventos de drag & drop (para soportar arrastrar archivos a la nueva UI)
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
      this.addNewFile(file, tipoDocumento);
    }
  }

  /**
   * Cargar documentos existentes del personal
   */
  cargarDocumentos(): void {
    this.personalService.getDocumentos(this.personalId).subscribe({
      next: (response) => {
        if (response.success) {
          // Filtrar solo documentos que pertenezcan a este personal
          this.documentosExistentes = response.data.filter(doc => doc.personal_id === this.personalId);
          console.log('Documentos cargados para personal ID:', this.personalId, this.documentosExistentes);
        }
      },
      error: (error) => {
        console.error('Error al cargar documentos:', error);
      }
    });
  }

  /**
   * Manejar selección de archivos para reemplazar documentos
   */
  onFileSelected(event: any, tipoDocumento: string): void {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.PDF_ONLY');
        event.target.value = '';
        return;
      }
      
      // Validar tamaño máximo (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.FILE_SIZE_LIMIT');
        event.target.value = '';
        return;
      }
      
      // Agregar archivo nuevo (reemplazará el existente)
      this.documentosNuevos.set(tipoDocumento, file);
      this.text_validation = ''; // Limpiar mensaje de error
    }
  }

  /**
   * Eliminar documento nuevo seleccionado
   */
  removeNewDocument(tipoDocumento: string): void {
    this.documentosNuevos.delete(tipoDocumento);
  }

  /**
   * Eliminar documento existente
   */
  removeExistingDocument(documento: PersonalDocument): void {
    if (confirm('¿Está seguro de eliminar este documento?')) {
      this.personalService.deleteDocument(documento.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.documentosExistentes = this.documentosExistentes.filter(d => d.id !== documento.id);
            this.text_success = this.translate.instant('PERSONAL.EDIT_PERSONAL.DELETE_DOCUMENT_SUCCESS');
            setTimeout(() => this.text_success = '', 3000);
          } else {
            this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.DELETE_DOCUMENT_ERROR');
          }
        },
        error: (error) => {
          console.error('Error al eliminar documento:', error);
          this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.DELETE_DOCUMENT_ERROR');
        }
      });
    }
  }

  /**
   * Descargar documento existente
   */
  downloadDocument(documentId: number): void {
    this.personalService.downloadDocument(documentId).subscribe({
      next: (blob: Blob) => {
        const documento = this.documentosExistentes.find(d => d.id === documentId);
        let fileName = `documento_${documentId}.pdf`;
        
        if (documento) {
          // Usar el nombre del personal actual, no el del archivo
          const nombrePersona = `${this.nombre}_${this.apellidos}`.replace(/\s+/g, '_');
          const tipoDocumento = documento.tipo_documento.replace(/\s+/g, '_');
          fileName = `${nombrePersona}_${tipoDocumento}.pdf`;
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar documento:', error);
        this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.DOWNLOAD_ERROR');
      }
    });
  }

  /**
   * Obtener lista de documentos faltantes
   */
  getMissingDocuments(): string[] {
    const tiposExistentes = this.documentosExistentes.map(d => d.tipo_documento);
    const tiposNuevos = Array.from(this.documentosNuevos.keys());
    const todosTipos = [...tiposExistentes, ...tiposNuevos];
    
    return this.documentosRequeridos.filter(tipo => !todosTipos.includes(tipo));
  }

  /**
   * Verificar si un tipo de documento ya existe
   */
  documentExists(tipoDocumento: string): boolean {
    return this.documentosExistentes.some(d => d.tipo_documento === tipoDocumento);
  }

  /**
   * Obtener documento existente por tipo
   */
  getExistingDocument(tipoDocumento: string): PersonalDocument | undefined {
    return this.documentosExistentes.find(d => d.tipo_documento === tipoDocumento);
  }

  /**
   * Obtener nombre limpio del documento para mostrar
   */
  getDocumentDisplayName(tipoDocumento: string): string {
    const nombrePersona = `${this.nombre || ''} ${this.apellidos || ''}`.trim();
    if (!nombrePersona) {
      return `${tipoDocumento}.pdf`;
    }
    return `${nombrePersona} - ${tipoDocumento}.pdf`;
  }

  /**
   * Validar formulario
   */
  validateForm(): boolean {
    this.text_validation = '';

    // Validar campos básicos
    if (!this.nombre.trim()) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.NAME_REQUIRED');
      return false;
    }

    if (this.nombre.trim().length < 2) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.NAME_MIN_LENGTH');
      return false;
    }

    if (!this.apellidos.trim()) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.LAST_NAME_REQUIRED');
      return false;
    }

    if (this.apellidos.trim().length < 2) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.LAST_NAME_MIN_LENGTH');
      return false;
    }

    if (!this.tipo) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.TYPE_REQUIRED');
      return false;
    }

    // Validar RFC
    if (!this.rfc.trim()) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.RFC_REQUIRED');
      return false;
    }

    if (this.rfc.trim().length < 10 || this.rfc.trim().length > 13) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.RFC_LENGTH');
      return false;
    }

    // Validar RFC formato básico (letras/números)
    const rfcPattern = /^[A-Z0-9]+$/;
    if (!rfcPattern.test(this.rfc.trim().toUpperCase()) || this.rfc.trim().length > 13) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.RFC_FORMAT');
      return false;
    }

    // Validar número de checador
    if (!this.numeroChecador.trim()) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.CHECADOR_REQUIRED');
      return false;
    }

    if (!/^[0-9]{1,4}$/.test(this.numeroChecador.trim())) {
      this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.CHECADOR_FORMAT');
      return false;
    }

    return true;
  }

  /**
   * Guardar cambios del personal
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

    // Preparar datos del personal para actualizar
    const personalData: Partial<Personal> = {
      nombre: this.nombre.trim(),
      apellidos: this.apellidos.trim(),
      tipo: this.tipo as 'Clínico' | 'No Clínico',
      activo: this.activo,
      rfc: this.rfc.trim().toUpperCase(),
      numero_checador: this.numeroChecador.trim()
    };

    // Actualizar datos básicos del personal
    this.personalService.updatePersonal(this.personalId, personalData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Si hay documentos nuevos, subirlos
            if (this.documentosNuevos.size > 0) {
              this.subirDocumentosNuevos();
            } else {
              this.loading = false;
              this.text_success = this.translate.instant('PERSONAL.EDIT_PERSONAL.UPDATE_SUCCESS');
              setTimeout(() => {
                this.goToList();
              }, 2000);
            }
          } else {
            this.loading = false;
            this.text_validation = response.message || this.translate.instant('PERSONAL.EDIT_PERSONAL.UPDATE_ERROR');
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al actualizar personal:', error);
          this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.UPDATE_ERROR');
        }
      });
  }

  /**
   * Subir documentos nuevos
   */
  private subirDocumentosNuevos(): void {
    let documentosSubidos = 0;
    const totalDocumentos = this.documentosNuevos.size;

    this.documentosNuevos.forEach((file, tipoDocumento) => {
      this.personalService.uploadDocument(this.personalId, tipoDocumento, file)
        .subscribe({
          next: (response) => {
            documentosSubidos++;
            if (response.success) {
              // Actualizar lista de documentos existentes
              this.cargarDocumentos();
            }
            
            // Si se subieron todos los documentos
            if (documentosSubidos === totalDocumentos) {
              this.loading = false;
              this.documentosNuevos.clear();
              this.text_success = this.translate.instant('PERSONAL.EDIT_PERSONAL.UPDATE_WITH_DOCS_SUCCESS');
              setTimeout(() => {
                this.goToList();
              }, 2000);
            }
          },
          error: (error) => {
            documentosSubidos++;
            console.error('Error al subir documento:', error);
            
            if (documentosSubidos === totalDocumentos) {
              this.loading = false;
              this.text_validation = this.translate.instant('PERSONAL.EDIT_PERSONAL.UPDATE_DOCS_PARTIAL_ERROR');
            }
          }
        });
    });
  }

  /**
   * Ir a la lista de personal
   */
  goToList(): void {
    this.router.navigate(['/personal/list']);
  }

  /**
   * Inicia el tour del formulario de edición de personal
   */
  public startEditPersonalTour(): void {
    this.driverTourService.startEditPersonalTour();
  }
}
