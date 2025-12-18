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
  activo: boolean = true;
  rfc: string = '';
  numeroChecador: string = '';
  fechaIngreso: string = '';

  // Control
  personalId: number = 0;
  isLoading = true;
  isSaving = false;

  // Documentos
  documentosExistentes: PersonalDocument[] = [];

  // Estado para subida de archivo individual
  isUploadingDoc = false;

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
    private personalService: PersonalService,
    private driverTourService: DriverTourService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.personalId = +id;
      this.cargarDatos();
    } else {
      this.goToList();
    }
  }

  startEditPersonalTour(): void {
    this.driverTourService.startEditPersonalTour();
  }

  isDarkMode(): boolean {
    return document.body.classList.contains('dark-mode');
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 KB';
    return (bytes / 1024).toFixed(0) + ' KB';
  }

  cargarDatos() {
    this.isLoading = true;
    this.personalService.showPersonal(this.personalId).subscribe({
      next: (resp) => {
        if (resp.success) {
          const p = resp.data;
          this.nombre = p.nombre;
          this.apellidos = p.apellidos;
          this.tipo = p.tipo;
          this.activo = p.activo !== false;
          this.rfc = p.rfc || '';
          this.numeroChecador = p.numero_checador || '';
          this.fechaIngreso = p.fecha_ingreso || '';

          this.cargarDocumentos(); // Cargar docs después de los datos
        } else {
          this.text_validation = 'Error cargando datos';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.text_validation = 'Error de conexión';
        this.isLoading = false;
      }
    });
  }

  cargarDocumentos() {
    this.personalService.getDocumentos(this.personalId).subscribe({
      next: (resp) => {
        this.documentosExistentes = resp.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // --- Actualizar Datos Basicos ---

  saveBasicData() {
    this.isSaving = true;
    this.text_success = '';
    this.text_validation = '';

    const data: Partial<Personal> = {
      nombre: this.nombre,
      apellidos: this.apellidos,
      tipo: this.tipo as any,
      activo: this.activo,
      rfc: this.rfc,
      numero_checador: this.numeroChecador
    };

    this.personalService.updatePersonal(this.personalId, data).subscribe({
      next: (resp) => {
        this.isSaving = false;
        if (resp.success) {
          this.text_success = 'Datos actualizados correctamente';
          setTimeout(() => this.text_success = '', 3000);
        } else {
          this.text_validation = resp.message;
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.text_validation = err.error?.message || 'Error al actualizar';
      }
    });
  }

  // --- Gestión de Documentos ---

  /**
   * Al seleccionar un archivo, se sube inmediatamente.
   */
  onFileSelected(event: any, tipoDocumento: string) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validaciones básicas antes de enviar
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 500 * 1024) {
        alert('El archivo supera los 500KB');
        return;
      }

      this.uploadDocument(tipoDocumento, file);
      event.target.value = ''; // Limpiar
    }
  }

  // Soporte Drop
  onDrop(event: DragEvent, tipoDocumento: string) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        alert('Solo PDF');
        return;
      }
      this.uploadDocument(tipoDocumento, file);
    }
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  uploadDocument(tipo: string, file: File) {
    this.isUploadingDoc = true;
    this.personalService.uploadDocument(this.personalId, tipo, file).subscribe({
      next: (resp) => {
        this.isUploadingDoc = false;
        if (resp.success) {
          this.cargarDocumentos(); // Recargar lista
          this.text_success = `Documento ${tipo} subido correctamente`;
          setTimeout(() => this.text_success = '', 3000);
        } else {
          alert('Error al subir: ' + resp.message);
        }
      },
      error: (err) => {
        this.isUploadingDoc = false;
        console.error(err);
        alert('Error al subir documento');
      }
    });
  }

  deleteDocument(docId: number) {
    if (!confirm('¿Seguro de eliminar este documento?')) return;

    this.personalService.deleteDocument(docId).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.cargarDocumentos();
        } else {
          alert(resp.message);
        }
      },
      error: (err) => alert('Error eliminando documento')
    });
  }

  downloadDocument(docId: number, nombreOriginal: string) {
    this.personalService.downloadDocument(docId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreOriginal;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error(err)
    });
  }

  // --- Helpers Vista ---

  getExistingDocs(tipo: string): PersonalDocument[] {
    return this.documentosExistentes.filter(d => d.tipo_documento === tipo);
  }

  hasDocument(tipo: string): boolean {
    // Para mostrar check si ya tiene (excepto constancias que pueden ser muchas)
    return this.documentosExistentes.some(d => d.tipo_documento === tipo);
  }

  goToList() {
    this.router.navigate(['/personal/list']);
  }
}
