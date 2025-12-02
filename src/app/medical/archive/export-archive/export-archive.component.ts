import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArchiveService } from '../service/archive.service';
import { DriverTourService } from '../../../shared/services/driver-tour.service';

@Component({
  selector: 'app-export-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './export-archive.component.html',
  styleUrls: ['./export-archive.component.scss']
})
export class ExportArchiveComponent implements OnInit {
  /**
   * Almacena todos los expedientes originales cargados desde el backend.
   */
  private allArchives: any[] = [];
  /** Lista de respaldos existentes. */
  backups: any[] = [];

  /** Cache de expedientes filtrados y hash del último filtro aplicado. */
  private filteredCache: any[] = [];
  private lastFilterHash: string = '';

  /** Propiedades para paginación virtual. */
  displayedArchives: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 50; // Mostrar solo 50 registros por página
  totalPages: number = 0;
  totalFilteredRecords: number = 0;

  /** Listas para selects de filtros. */
  genders: any[] = [];

  /** Filtros seleccionados por el usuario. */
  selectedGender: string = '';
  selectedYear: string = '';
  selectedMonth: string = '';

  /** Índices optimizados para búsqueda rápida por filtro. */
  private genderIndex: Map<string, any[]> = new Map();
  private yearIndex: Map<string, any[]> = new Map();
  private monthIndex: Map<string, any[]> = new Map();

  /** Opciones de años y meses para los filtros. */
  years: number[] = [];
  months = [
    { value: '01', name: 'Enero' },
    { value: '02', name: 'Febrero' },
    { value: '03', name: 'Marzo' },
    { value: '04', name: 'Abril' },
    { value: '05', name: 'Mayo' },
    { value: '06', name: 'Junio' },
    { value: '07', name: 'Julio' },
    { value: '08', name: 'Agosto' },
    { value: '09', name: 'Septiembre' },
    { value: '10', name: 'Octubre' },
    { value: '11', name: 'Noviembre' },
    { value: '12', name: 'Diciembre' }
  ];

  /** Estado de carga global y de página. */
  loading: boolean = false;
  isLoadingPage: boolean = false; 

  /**
   * Inyección de servicios para expedientes y traducción.
   */
  constructor(
    private archiveService: ArchiveService,
    private translate: TranslateService,
    private driverTourService: DriverTourService
  ) {
    const lang = localStorage.getItem('language') || 'en';
    this.translate.use(lang);
  }

  /** Inicializa la carga de expedientes, respaldos, géneros y años al montar el componente. */
  ngOnInit(): void {
    this.loadArchives();
    this.loadBackups();
    this.loadGenders();
    this.initializeYears();
    this.checkAndShowExportTour();
  }

  /**
   * Verifica si debe mostrar el tour de bienvenida
   */
  checkAndShowExportTour(): void {
    if (!this.driverTourService.isTourCompleted('export-archive')) {
      setTimeout(() => {
        this.startExportArchiveTour();
      }, 1000);
    }
  }

  /**
   * Inicia el tour guiado para exportación de archivos
   */
  startExportArchiveTour(): void {
    this.driverTourService.startExportArchiveTour();
  }

  /**
   * Parsea una fecha en formato string a objeto Date.
   */
  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;

    try {
      // Si la fecha viene en formato ISO (YYYY-MM-DD) o (YYYY-MM-DD HH:mm:ss)
      if (typeof dateString === 'string') {
        // Extraer solo la parte de la fecha (YYYY-MM-DD)
        const dateOnly = dateString.split(' ')[0]; // Remover tiempo si existe
        const dateParts = dateOnly.split('-');
        
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // JavaScript usa meses 0-indexados
          const day = parseInt(dateParts[2]);
          
          // Crear fecha local sin afectación de zona horaria
          return new Date(year, month, day);
        }
      }
      
      // Fallback para otros formatos
      return new Date(dateString);
    } catch {
      // Si hay error, retorna null (se elimina el log)
      return null;
    }
  }

  /** Inicializa el arreglo de años para el filtro de año. */
  private initializeYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 2000; // Año inicial
    this.years = [];
    for (let year = currentYear; year >= startYear; year--) {
      this.years.push(year);
    }
  }

  /** Carga la lista de géneros desde el backend. */
  private loadGenders(): void {
    this.archiveService.listGenders().subscribe({
      next: (res: any) => this.genders = res,
      error: () => {
        // Se elimina el log, pero se podría mostrar un mensaje de error en la UI si se requiere
      }
    });
  }

  /**
   * Carga todos los expedientes desde el backend y construye los índices para filtrado rápido.
   * Elimina todos los logs.
   */
  loadArchives(): void {
    this.loading = true;
    this.archiveService.getAllArchives().subscribe({
      next: (res: any) => {
        // Almacenar datos originales
        this.allArchives = Array.isArray(res.data) ? res.data : [];

        // Construir índices para búsqueda optimizada
        this.buildSearchIndexes();

        // Extraer filtros únicos
        this.extractUniqueFilters();

        // Aplicar filtros iniciales
        this.applyFiltersOptimized();

        this.loading = false;
      },
      error: () => {
        // Se elimina el log, pero se podría mostrar un mensaje de error en la UI si se requiere
        this.loading = false;
      }
    });
  }

  /**
   * CONSTRUYE ÍNDICES PARA BÚSQUEDA OPTIMIZADA
   * Esto permite filtrar en O(1) en lugar de O(n)
   */
  /**
   * Construye los índices para filtrado rápido por género, año y mes únicamente.
   */
  private buildSearchIndexes(): void {
    // LIMPIAR ÍNDICES EXISTENTES
    this.genderIndex.clear();
    this.yearIndex.clear();
    this.monthIndex.clear();

    // CONSTRUIR ÍNDICES POR CADA CRITERIO
    this.allArchives.forEach((archive: any) => {
      // ÍNDICE POR GÉNERO - CONVERTIR A STRING PARA COMPATIBILIDAD
      const genderId = archive.gender?.id;
      if (genderId) {
        const genderKey = String(genderId);
        if (!this.genderIndex.has(genderKey)) {
          this.genderIndex.set(genderKey, []);
        }
        this.genderIndex.get(genderKey)!.push(archive);
      }

      // ÍNDICES POR FECHA
      if (archive.admission_date) {
        const date = this.parseDate(archive.admission_date);
        if (date && !isNaN(date.getTime())) {
          const year = date.getFullYear().toString();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');

          // ÍNDICE POR AÑO
          if (!this.yearIndex.has(year)) {
            this.yearIndex.set(year, []);
          }
          this.yearIndex.get(year)!.push(archive);

          // ÍNDICE POR MES
          if (!this.monthIndex.has(month)) {
            this.monthIndex.set(month, []);
          }
          this.monthIndex.get(month)!.push(archive);
        }
      }
    });
  }

  /**
   * Extrae los filtros únicos para los selects (solo géneros ahora).
   */
  private extractUniqueFilters(): void {
    // Ya no necesitamos extraer estados únicos
    // Los géneros se cargan por separado
  }

  /** Carga la lista de respaldos desde el backend. */
  loadBackups(): void {
    this.archiveService.listBackups().subscribe({
      next: (res: any) => this.backups = res.data,
      error: () => {
        // Se elimina el log, pero se podría mostrar un mensaje de error en la UI si se requiere
      }
    });
  }

  /** Limpia todos los filtros y resetea la paginación. */
  clearAllFilters(): void {
    this.selectedGender = '';
    this.selectedYear = '';
    this.selectedMonth = '';
    this.currentPage = 1;
    
    this.applyFiltersOptimized();
  }

  /**
   * FILTRADO OPTIMIZADO USANDO ÍNDICES Y CACHE
   */
  /**
   * Aplica los filtros seleccionados usando índices y cache para optimizar el filtrado.
   * Solo filtra por género, año y mes.
   */
  applyFiltersOptimized(): void {
    const filterHash = this.generateFilterHash();
    
    // SI EL HASH ES EL MISMO, USAR CACHE
    if (filterHash === this.lastFilterHash && this.lastFilterHash !== '') {
      this.updatePagination();
      return;
    }
    
    let candidateSet: Set<any> = new Set();
    let firstFilter = true;

    // FILTRO POR GÉNERO - USAR ÍNDICE CON STRING
    if (this.selectedGender) {
      const genderKey = String(this.selectedGender);
      const genderResults = this.genderIndex.get(genderKey) || [];
      if (firstFilter) {
        candidateSet = new Set(genderResults);
        firstFilter = false;
      } else {
        candidateSet = new Set([...candidateSet].filter(x => genderResults.includes(x)));
      }
    }

    // FILTRO POR AÑO - USAR ÍNDICE CON STRING
    if (this.selectedYear) {
      const yearKey = String(this.selectedYear);
      const yearResults = this.yearIndex.get(yearKey) || [];
      if (firstFilter) {
        candidateSet = new Set(yearResults);
        firstFilter = false;
      } else {
        candidateSet = new Set([...candidateSet].filter(x => yearResults.includes(x)));
      }
    }

    // FILTRO POR MES - USAR ÍNDICE CON STRING
    if (this.selectedMonth) {
      const monthKey = String(this.selectedMonth);
      const monthResults = this.monthIndex.get(monthKey) || [];
      if (firstFilter) {
        candidateSet = new Set(monthResults);
        firstFilter = false;
      } else {
        candidateSet = new Set([...candidateSet].filter(x => monthResults.includes(x)));
      }
    }

    // SI NO HAY FILTROS, USAR TODOS LOS REGISTROS
    if (firstFilter) {
      candidateSet = new Set(this.allArchives);
    }

    // CONVERTIR A ARRAY Y CACHEAR
    this.filteredCache = Array.from(candidateSet);
    this.lastFilterHash = filterHash;
    this.totalFilteredRecords = this.filteredCache.length;
    
    // RESETEAR PAGINACIÓN Y ACTUALIZAR VISTA
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * GENERA HASH ÚNICO DE LOS FILTROS ACTUALES
   */
  /** Genera un hash único para los filtros actuales. */
  private generateFilterHash(): string {
    return `${this.selectedGender}-${this.selectedYear}-${this.selectedMonth}`;
  }

  /**
   * ACTUALIZA LA PAGINACIÓN Y LOS REGISTROS MOSTRADOS
   */
  /** Actualiza la paginación y los registros mostrados en la vista. */
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.totalFilteredRecords / this.itemsPerPage);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
  this.displayedArchives = this.filteredCache.slice(startIndex, endIndex);
  // Se elimina el log de paginación
  }

  /**
   * MÉTODO PÚBLICO PARA OBTENER REGISTROS FILTRADOS (PAGINADOS)
   */
  /** Retorna los expedientes filtrados y paginados para mostrar en la tabla. */
  getDisplayedArchives(): any[] {
    return this.displayedArchives;
  }

  /**
   * MÉTODO PÚBLICO PARA OBTENER TODOS LOS REGISTROS FILTRADOS (PARA EXPORTACIÓN)
   */
  /** Retorna todos los expedientes filtrados (sin paginación) para exportación. */
  getAllFilteredArchives(): any[] {
    return this.filteredCache;
  }

  /**
   * MÉTODOS DE NAVEGACIÓN DE PÁGINAS
   */
  /** Navega a una página específica en la paginación. */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.isLoadingPage = true;
      this.currentPage = page;
      
      // SIMULAR DELAY PARA UX (OPCIONAL)
      setTimeout(() => {
        this.updatePagination();
        this.isLoadingPage = false;
      }, 100);
    }
  }

  /** Navega a la página siguiente. */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /** Navega a la página anterior. */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * MÉTODO LEGACY MANTENIDO PARA COMPATIBILIDAD (AHORA OPTIMIZADO)
   */

  /** Método legacy para obtener expedientes filtrados (compatibilidad). */
  filteredArchives(): any[] {
    // MÉTODO LEGACY - AHORA DELEGA A LA VERSIÓN OPTIMIZADA
    return this.getAllFilteredArchives();
  }

  /** Exporta los expedientes filtrados a un archivo Excel y lo respalda en el backend. */
  exportToExcel(): void {
    const filteredData = this.getAllFilteredArchives(); // USAR TODOS LOS REGISTROS FILTRADOS
    
    if (filteredData.length === 0) {
      alert('No hay datos para exportar con los filtros aplicados');
      return;
    }

  // Se elimina el log de exportación a Excel

    const exportData = filteredData.map((a: any) => ({
      'No. Archivo': a.archive_number,
      'Nombre': `${a.name} ${a.last_name_father ?? ''} ${a.last_name_mother ?? ''}`,
      'Edad': `${a.age} ${this.getAgeUnitLabel(a.age_unit)}`,
      'Género': a.gender?.name ?? 'N/A',
      'Localidad': a.location_text ?? 'N/A',
      'Municipio': a.municipality_text ?? 'N/A',
      'Estado': a.state_text ?? 'N/A',
      'Fecha de ingreso': a.admission_date ?? 'N/A'
    }));

    // Crear libro de Excel con ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pacientes');

    // Agregar encabezados
    worksheet.columns = [
      { header: 'No. Archivo', key: 'No. Archivo', width: 15 },
      { header: 'Nombre', key: 'Nombre', width: 30 },
      { header: 'Edad', key: 'Edad', width: 15 },
      { header: 'Género', key: 'Género', width: 15 },
      { header: 'Localidad', key: 'Localidad', width: 20 },
      { header: 'Municipio', key: 'Municipio', width: 20 },
      { header: 'Estado', key: 'Estado', width: 20 },
      { header: 'Fecha de ingreso', key: 'Fecha de ingreso', width: 20 }
    ];

    // Agregar datos
    exportData.forEach((data: any) => {
      worksheet.addRow(data);
    });

    // Generar archivo Excel
    const filename = this.getBackupFilename('excel');
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, filename);

      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('type', 'excel');

      this.archiveService.uploadBackup(formData).subscribe({
        next: () => {
          // Se elimina el log de respaldo enviado
          this.loadBackups(); // Recarga la lista de respaldos
        },
        error: () => {
          // Se elimina el log de error de respaldo
        }
      });
    });
  }

  /** Exporta los expedientes filtrados a un archivo PDF y lo respalda en el backend. */
  exportToPDF(): void {
    const filteredData = this.getAllFilteredArchives(); // USAR TODOS LOS REGISTROS FILTRADOS
    
    if (filteredData.length === 0) {
      const message = this.translate.instant('ARCHIVE.COMMON.NO_DATA_TO_EXPORT');
      alert(message);
      return;
    }

  // Se elimina el log de exportación a PDF

    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    
    // Título con información de filtros
    let title = 'Lista de Pacientes';
    if (this.hasActiveFilters()) {
      title += ' (Filtrado)';
    }
    doc.text(title, 14, 20);

    // Información de filtros aplicados
    if (this.hasActiveFilters()) {
      doc.setFontSize(10);
      let filterInfo = 'Filtros aplicados: ';
      const filters = [];
      
      if (this.selectedGender) {
        const gender = this.genders.find(g => g.id == this.selectedGender);
        filters.push(`Género: ${gender?.name || this.selectedGender}`);
      }
      if (this.selectedYear) {
        filters.push(`Año: ${this.selectedYear}`);
      }
      if (this.selectedMonth) {
        const month = this.months.find(m => m.value === this.selectedMonth);
        filters.push(`Mes: ${month?.name || this.selectedMonth}`);
      }
      
      doc.text(filterInfo + filters.join(', '), 14, 30);
    }

    const exportData = filteredData.map((a: any) => [
      a.archive_number,
      `${a.name ?? ''} ${a.last_name_father ?? ''} ${a.last_name_mother ?? ''}`,
      `${a.age ?? 'N/A'} ${this.getAgeUnitLabel(a.age_unit)}`,
      a.gender?.name ?? 'N/A',
      a.location_text ?? 'N/A',
      a.municipality_text ?? 'N/A',
      a.state_text ?? 'N/A',
      a.admission_date ?? 'N/A'
    ]);

    autoTable(doc, {
      startY: this.hasActiveFilters() ? 35 : 25,
      head: [['No. Archivo', 'Nombre', 'Edad', 'Género', 'Localidad', 'Municipio', 'Estado', 'Fecha de ingreso']],
      body: exportData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    const filename = this.getBackupFilename('pdf');
    const pdfBlob = doc.output('blob');
    FileSaver.saveAs(pdfBlob, filename);

    const formData = new FormData();
    formData.append('file', pdfBlob, filename);
    formData.append('type', 'pdf');

    this.archiveService.uploadBackup(formData).subscribe({
      next: () => {
        // Se elimina el log de respaldo enviado
        this.loadBackups(); // Recarga la lista de respaldos
      },
      error: () => {
        // Se elimina el log de error de respaldo
      }
    });
  }

  /** Retorna true si hay algún filtro activo. */
  hasActiveFilters(): boolean {
    return !!(this.selectedGender ||
              this.selectedYear ||
              this.selectedMonth);
  }  /** Descarga un respaldo por nombre de archivo. */
  downloadBackup(filename: string): void {
    this.archiveService.downloadBackup(filename).subscribe(blob => {
      FileSaver.saveAs(blob, filename);
    });
  }

  /** Genera el nombre de archivo para el respaldo exportado según los filtros. */
  getBackupFilename(type: 'excel' | 'pdf'): string {
    const now = new Date();
    const currentMonth = now.toLocaleString('es-MX', { month: 'long' });
    const currentYear = now.getFullYear();

    // Construir el nombre base según los filtros aplicados
    let baseName = 'Pacientes';
    const filterParts: string[] = [];

    // Agregar filtro de género
    if (this.selectedGender) {
      const gender = this.genders.find(g => g.id == this.selectedGender);
      if (gender) {
        filterParts.push(gender.name.replace(/\s+/g, '_'));
      }
    }

    // Manejar filtros de fecha
    let dateString = '';
    if (this.selectedYear && this.selectedMonth) {
      // Si se selecciona año y mes específicos
      const month = this.months.find(m => m.value === this.selectedMonth);
      dateString = `${month?.name}_${this.selectedYear}`;
    } else if (this.selectedYear) {
      // Solo año seleccionado
      dateString = this.selectedYear;
    } else if (this.selectedMonth) {
      // Solo mes seleccionado (cualquier año)
      const month = this.months.find(m => m.value === this.selectedMonth);
      dateString = `${month?.name}_TodosLosAnios`;
    } else {
      // Sin filtros de fecha, usar fecha actual
      dateString = `${currentMonth}_${currentYear}`;
    }

    // Construir el nombre completo
    if (filterParts.length > 0) {
      baseName += `_${filterParts.join('_')}`;
    }

    // Si no hay filtros aplicados, usar nombre genérico
    if (!this.hasActiveFilters()) {
      baseName += '_TodosLosPacientes';
    }

    // Agregar la fecha
    baseName += `_${dateString}`;

    // Buscar archivos existentes con el mismo patrón para versioning
    const basePattern = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapar caracteres especiales
    const regex = new RegExp(`${basePattern}V(\\d+)\\.${type === 'excel' ? 'xlsx' : 'pdf'}`, 'i');
    const existingBackups = this.backups.filter(b => regex.test(b.filename));
    const version = existingBackups.length + 1;

    const finalFilename = `${baseName}V${version}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
    
  // Se elimina el log de generación de nombre de archivo

    return finalFilename;
  }

  // Método para mostrar un resumen de los filtros aplicados
  /** Retorna un resumen textual de los filtros aplicados. */
  getAppliedFiltersDescription(): string {
    if (!this.hasActiveFilters()) {
      return 'Todos los pacientes sin filtros aplicados';
    }

    const filters: string[] = [];

    // Filtro de género
    if (this.selectedGender) {
      const gender = this.genders.find(g => g.id == this.selectedGender);
      filters.push(`Género: ${gender?.name || 'Desconocido'}`);
    }

    // Filtros de fecha
    if (this.selectedYear && this.selectedMonth) {
      const month = this.months.find(m => m.value === this.selectedMonth);
      filters.push(`Fecha: ${month?.name} ${this.selectedYear}`);
    } else if (this.selectedYear) {
      filters.push(`Año: ${this.selectedYear}`);
    } else if (this.selectedMonth) {
      const month = this.months.find(m => m.value === this.selectedMonth);
      filters.push(`Mes: ${month?.name} (todos los años)`);
    }

    return filters.join(', ');
  }

  /**
   * MÉTODOS DE UTILIDAD PARA LA PAGINACIÓN
   */
  /** Retorna información textual de la paginación actual. */
  getPaginationInfo(): string {
    if (this.totalFilteredRecords === 0) return 'No hay registros';
    
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalFilteredRecords);
    return `Mostrando ${start}-${end} de ${this.totalFilteredRecords} registros`;
  }

  /** Retorna el arreglo de números de página para la paginación. */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    // Ajustar si hay pocas páginas al final
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * MÉTODOS PARA MANEJO DE FILTROS CON CALLBACK
   */
  /** Maneja el cambio de cualquier filtro y aplica los filtros inmediatamente. */
  onFilterChange(filterType: string): void {
    // Se elimina el log de cambio de filtro
    this.applyFiltersOptimized();
    // Se elimina el log de verificación de vista
  }

  /**
   * Obtiene la etiqueta de la unidad de edad
   * @param unit - La unidad de edad (años, días, meses)
   * @returns La etiqueta correspondiente
   */
  getAgeUnitLabel(unit?: string): string {
    switch (unit) {
      case 'años':
        return 'años';
      case 'días':
        return 'días';
      case 'meses':
        return 'meses';
      default:
        return 'años';
    }
  }

  /**
   * MÉTODOS TRACKBY PARA OPTIMIZAR RENDERIZADO DE LISTAS
   */
  /** TrackBy para optimizar renderizado de lista de géneros. */
  trackByGenderId(index: number, item: any): any {
    return item.id;
  }

  /** TrackBy para optimizar renderizado de lista de años. */
  trackByYear(index: number, item: number): number {
    return item;
  }

  /** TrackBy para optimizar renderizado de lista de meses. */
  trackByMonthValue(index: number, item: any): string {
    return item.value;
  }

  /** TrackBy para optimizar renderizado de lista de expedientes. */
  trackByArchiveId(index: number, item: any): any {
    return item.id || item.archive_number;
  }
}
