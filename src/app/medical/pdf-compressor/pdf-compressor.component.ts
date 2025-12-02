import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PdfCompressionService } from './services/pdf-compression.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-pdf-compressor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './pdf-compressor.component.html',
  styleUrls: ['./pdf-compressor.component.scss']
})
export class PdfCompressorComponent implements OnInit {
  // Archivos
  selectedFiles: File[] = [];
  compressedFiles: { original: File; compressed: Blob; name: string; originalSize: number; compressedSize: number; }[] = [];

  // Estados
  isProcessing = false;
  isDragOver = false;

  // Configuración
  readonly MAX_FILE_SIZE = 500 * 1024; // 500KB límite objetivo
  readonly ALLOWED_FILE_TYPE = 'application/pdf';

  // Mensajes
  text_validation = '';
  text_success = '';

  // Estadísticas
  totalOriginalSize = 0;
  totalCompressedSize = 0;

  constructor(
    private translate: TranslateService,
    private pdfCompressionService: PdfCompressionService,
    private driverTourService: DriverTourService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    // Iniciar tour si es la primera vez
    if (!this.driverTourService.isTourCompleted('pdf-compressor')) {
      setTimeout(() => {
        this.driverTourService.startPdfCompressorTour();
      }, 500);
    }
  }

  /**
   * Inicia el tour guiado manualmente
   */
  startPdfCompressorTour(): void {
    this.driverTourService.startPdfCompressorTour();
  }

  /**
   * Manejar selección de archivos desde input
   */
  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.addFiles(files);
    event.target.value = ''; // Limpiar input
  }

  /**
   * Eventos de drag & drop
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = Array.from(event.dataTransfer?.files || []) as File[];
    this.addFiles(files);
  }

  /**
   * Agregar archivos a la lista
   */
  private addFiles(files: File[]): void {
    this.text_validation = '';
    this.text_success = '';

    // Validar y agregar archivos
    const validFiles = files.filter(file => {
      // Validar tipo de archivo
      if (file.type !== this.ALLOWED_FILE_TYPE) {
        this.text_validation = `El archivo "${file.name}" no es un PDF válido`;
        return false;
      }

      // Validar tamaño mínimo
      if (file.size < 1024) {
        this.text_validation = `El archivo "${file.name}" parece estar dañado o vacío`;
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
      this.text_success = `${validFiles.length} archivo(s) agregado(s)`;
    }
  }

  /**
   * Eliminar archivo de la lista
   */
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.text_validation = '';
    this.text_success = '';
  }

  /**
   * Comprimir todos los archivos
   */
  async compressAll(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      this.text_validation = 'No hay archivos para comprimir';
      return;
    }

    this.isProcessing = true;
    this.compressedFiles = [];
    this.text_validation = '';
    this.text_success = '';
    this.totalOriginalSize = 0;
    this.totalCompressedSize = 0;

    try {
      for (const file of this.selectedFiles) {
        const compressedBlob = await this.pdfCompressionService.compressPdf(file, this.MAX_FILE_SIZE);

        this.compressedFiles.push({
          original: file,
          compressed: compressedBlob,
          name: file.name,
          originalSize: file.size,
          compressedSize: compressedBlob.size
        });

        this.totalOriginalSize += file.size;
        this.totalCompressedSize += compressedBlob.size;
      }

      const reductionPercent = ((this.totalOriginalSize - this.totalCompressedSize) / this.totalOriginalSize * 100).toFixed(1);
      this.text_success = `Archivos comprimidos exitosamente. Reducción del ${reductionPercent}%`;

    } catch (error) {
      console.error('Error al comprimir PDFs:', error);
      this.text_validation = 'Error al comprimir los archivos. Por favor, intenta nuevamente.';
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Descargar archivo comprimido individual
   */
  downloadCompressed(compressedFile: any): void {
    const url = URL.createObjectURL(compressedFile.compressed);
    const a = document.createElement('a');
    a.href = url;
    a.download = compressedFile.name.replace('.pdf', '_comprimido.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Descargar todos los archivos comprimidos
   */
  downloadAll(): void {
    this.compressedFiles.forEach(file => {
      this.downloadCompressed(file);
    });
  }

  /**
   * Limpiar todo
   */
  clearAll(): void {
    this.selectedFiles = [];
    this.compressedFiles = [];
    this.text_validation = '';
    this.text_success = '';
    this.totalOriginalSize = 0;
    this.totalCompressedSize = 0;
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Calcular porcentaje de reducción
   */
  getReductionPercent(original: number, compressed: number): string {
    if (original === 0) return '0';
    return ((original - compressed) / original * 100).toFixed(1);
  }

  /**
   * Calcular porcentaje de reducción como número
   */
  getReductionPercentNumber(original: number, compressed: number): number {
    if (original === 0) return 0;
    return ((original - compressed) / original * 100);
  }

  /**
   * Verificar si el archivo comprimido cumple con el límite
   */
  meetsLimit(compressedSize: number): boolean {
    return compressedSize <= this.MAX_FILE_SIZE;
  }

  /**
   * Verificar si algún archivo supera el límite
   */
  hasFilesOverLimit(): boolean {
    return this.compressedFiles.some(f => !this.meetsLimit(f.compressedSize));
  }
}
