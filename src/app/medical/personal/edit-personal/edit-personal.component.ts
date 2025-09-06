import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PersonalService, Personal, PersonalDocument } from '../service/personal.service';

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
    'RFC',
    'Título profesional'
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private personalService: PersonalService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    this.personalId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.personalId) {
      this.cargarDatosPersonal();
    } else {
      this.text_validation = 'ID de personal no válido';
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

          // Cargar documentos existentes
          this.cargarDocumentos();
        } else {
          this.text_validation = 'Error al cargar los datos del personal';
        }
      },
      error: (error) => {
        this.loadingPersonal = false;
        console.error('Error al cargar personal:', error);
        this.text_validation = 'Error al cargar los datos del personal';
      }
    });
  }

  /**
   * Añadir archivo nuevo (validación reutilizable)
   */
  private addNewFile(file: File, tipoDocumento: string): void {
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
        this.text_validation = 'Solo se permiten archivos PDF';
        event.target.value = '';
        return;
      }
      
      // Validar tamaño máximo (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.text_validation = 'El archivo no puede superar los 10MB';
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
            this.text_success = 'Documento eliminado exitosamente';
            setTimeout(() => this.text_success = '', 3000);
          } else {
            this.text_validation = 'Error al eliminar el documento';
          }
        },
        error: (error) => {
          console.error('Error al eliminar documento:', error);
          this.text_validation = 'Error al eliminar el documento';
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
        this.text_validation = 'Error al descargar el documento';
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
      activo: this.activo
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
              this.text_success = 'Personal actualizado exitosamente';
              setTimeout(() => {
                this.goToList();
              }, 2000);
            }
          } else {
            this.loading = false;
            this.text_validation = response.message || 'Error al actualizar el personal';
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al actualizar personal:', error);
          this.text_validation = 'Error al actualizar el personal';
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
              this.text_success = 'Personal y documentos actualizados exitosamente';
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
              this.text_validation = 'Personal actualizado, pero algunos documentos no se pudieron subir';
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
}
