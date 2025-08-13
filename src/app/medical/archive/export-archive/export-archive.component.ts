import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArchiveService } from '../service/archive.service';

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
  states: any[] = [];
  municipalities: any[] = [];
  locations: any[] = [];
  genders: any[] = [];

  /** Filtros seleccionados por el usuario. */
  selectedState: string = '';
  selectedMunicipality: string = '';
  selectedLocation: string = '';
  selectedGender: string = '';
  selectedYear: string = '';
  selectedMonth: string = '';

  /** Índices optimizados para búsqueda rápida por filtro. */
  private stateIndex: Map<string, any[]> = new Map();
  private municipalityIndex: Map<string, any[]> = new Map();
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
    private translate: TranslateService
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
   * Construye los índices para filtrado rápido por estado, municipio, género, año y mes.
   */
  private buildSearchIndexes(): void {
    // LIMPIAR ÍNDICES EXISTENTES
    this.stateIndex.clear();
    this.municipalityIndex.clear();
    this.genderIndex.clear();
    this.yearIndex.clear();
    this.monthIndex.clear();

    // CONSTRUIR ÍNDICES POR CADA CRITERIO
    this.allArchives.forEach((archive: any) => {
      // ÍNDICE POR ESTADO - CONVERTIR A STRING PARA COMPATIBILIDAD
      const stateId = archive.location?.municipality?.state?.id;
      if (stateId) {
        const stateKey = String(stateId);
        if (!this.stateIndex.has(stateKey)) {
          this.stateIndex.set(stateKey, []);
        }
        this.stateIndex.get(stateKey)!.push(archive);
      }

      // ÍNDICE POR MUNICIPIO - CONVERTIR A STRING PARA COMPATIBILIDAD
      const municipalityId = archive.location?.municipality?.id;
      if (municipalityId) {
        const municipalityKey = String(municipalityId);
        if (!this.municipalityIndex.has(municipalityKey)) {
          this.municipalityIndex.set(municipalityKey, []);
        }
        this.municipalityIndex.get(municipalityKey)!.push(archive);
      }

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

  // Se elimina el log de índices construidos
  }

  /**
   * EXTRAE FILTROS ÚNICOS DE MANERA OPTIMIZADA
   */
  /**
   * Extrae los filtros únicos para los selects de estado.
   */
  private extractUniqueFilters(): void {
    // Estados únicos - usando Set para deduplicación rápida
    const statesSet = new Set();
    this.allArchives.forEach((a: any) => {
      if (a.location?.municipality?.state?.id) {
        statesSet.add(JSON.stringify(a.location.municipality.state));
      }
    });
    this.states = Array.from(statesSet).map((s: any) => JSON.parse(s));
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

  /** Maneja el cambio de estado y actualiza municipios y filtros. */
  onStateChange(): void {
    this.selectedMunicipality = '';
    this.selectedLocation = '';
    
    // USAR ÍNDICE OPTIMIZADO PARA MUNICIPIOS CON STRING KEY
    if (this.selectedState) {
      const stateKey = String(this.selectedState);
      const stateArchives = this.stateIndex.get(stateKey) || [];
      const municipalitiesSet = new Set();
      stateArchives.forEach((a: any) => {
        if (a.location?.municipality?.id) {
          municipalitiesSet.add(JSON.stringify(a.location.municipality));
        }
      });
      this.municipalities = Array.from(municipalitiesSet).map((m: any) => JSON.parse(m));
  // Se elimina el log de municipios encontrados
    } else {
      this.municipalities = [];
    }
    
    this.applyFiltersOptimized();
  }

  /** Maneja el cambio de municipio y actualiza localidades y filtros. */
  onMunicipalityChange(): void {
    this.selectedLocation = '';
    
    // USAR ÍNDICE OPTIMIZADO PARA LOCALIDADES CON STRING KEY
    if (this.selectedMunicipality) {
      const municipalityKey = String(this.selectedMunicipality);
      const municipalityArchives = this.municipalityIndex.get(municipalityKey) || [];
      const locationsSet = new Set();
      municipalityArchives.forEach((a: any) => {
        if (a.location?.id) {
          locationsSet.add(JSON.stringify(a.location));
        }
      });
      this.locations = Array.from(locationsSet).map((l: any) => JSON.parse(l));
  // Se elimina el log de localidades encontradas
    } else {
      this.locations = [];
    }
    
    this.applyFiltersOptimized();
  }

  /** Limpia todos los filtros y resetea la paginación. */
  clearAllFilters(): void {
    this.selectedState = '';
    this.selectedMunicipality = '';
    this.selectedLocation = '';
    this.selectedGender = '';
    this.selectedYear = '';
    this.selectedMonth = '';
    this.municipalities = [];
    this.locations = [];
    this.currentPage = 1;
    
    this.applyFiltersOptimized();
  }

  /**
   * FILTRADO OPTIMIZADO USANDO ÍNDICES Y CACHE
   */
  /**
   * Aplica los filtros seleccionados usando índices y cache para optimizar el filtrado.
   * Elimina todos los logs.
   */
  applyFiltersOptimized(): void {
    const filterHash = this.generateFilterHash();
    
    // SI EL HASH ES EL MISMO, USAR CACHE (INCLUSO SI EL RESULTADO ES 0)
    if (filterHash === this.lastFilterHash && this.lastFilterHash !== '') {
      this.updatePagination();
      return;
    }

  // Se elimina el log de tiempo de filtrado
    
    let candidateSet: Set<any> = new Set();
    let firstFilter = true;

    // FILTRO POR ESTADO - USAR ÍNDICE CON STRING
    if (this.selectedState) {
      const stateKey = String(this.selectedState);
      const stateResults = this.stateIndex.get(stateKey) || [];
  // Se elimina el log de filtro estado
      if (firstFilter) {
        candidateSet = new Set(stateResults);
        firstFilter = false;
      } else {
        candidateSet = new Set([...candidateSet].filter(x => stateResults.includes(x)));
      }
    }

    // FILTRO POR MUNICIPIO - USAR ÍNDICE CON STRING
    if (this.selectedMunicipality) {
      const municipalityKey = String(this.selectedMunicipality);
      const municipalityResults = this.municipalityIndex.get(municipalityKey) || [];
  // Se elimina el log de filtro municipio
      if (firstFilter) {
        candidateSet = new Set(municipalityResults);
        firstFilter = false;
      } else {
        candidateSet = new Set([...candidateSet].filter(x => municipalityResults.includes(x)));
      }
    }

    // FILTRO POR LOCALIDAD - FILTRO DIRECTO CON STRING
    if (this.selectedLocation) {
      const locationKey = String(this.selectedLocation);
      const locationResults = this.allArchives.filter((a: any) => String(a.location?.id) === locationKey);
  // Se elimina el log de filtro localidad
      if (firstFilter) {
        candidateSet = new Set(locationResults);
        firstFilter = false;
      } else {
        candidateSet = new Set([...candidateSet].filter(x => locationResults.includes(x)));
      }
    }

    // FILTRO POR GÉNERO - USAR ÍNDICE CON STRING
    if (this.selectedGender) {
      const genderKey = String(this.selectedGender);
      const genderResults = this.genderIndex.get(genderKey) || [];
  // Se elimina el log de filtro género
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
  // Se elimina el log de filtro año
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
  // Se elimina el log de filtro mes
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
    
  // Se elimina el log de tiempo y resultado de filtrado
    
    // RESETEAR PAGINACIÓN Y ACTUALIZAR VISTA
  this.currentPage = 1;
  this.updatePagination();
  }

  /**
   * GENERA HASH ÚNICO DE LOS FILTROS ACTUALES
   */
  /** Genera un hash único para los filtros actuales. */
  private generateFilterHash(): string {
    return `${this.selectedState}-${this.selectedMunicipality}-${this.selectedLocation}-${this.selectedGender}-${this.selectedYear}-${this.selectedMonth}`;
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
      'Edad': a.age,
      'Género': a.gender?.name ?? 'N/A',
      'Dirección': a.address ?? 'N/A',
      'Localidad': a.location?.name ?? a.location_text ?? 'N/A',
      'Municipio': a.location?.municipality?.name ?? 'N/A',
      'Estado': a.location?.municipality?.state?.name ?? 'N/A',
      'Fecha de ingreso': a.admission_date ?? 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = { Sheets: { 'Pacientes': worksheet }, SheetNames: ['Pacientes'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const filename = this.getBackupFilename('excel');
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
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
  }

  /** Exporta los expedientes filtrados a un archivo PDF y lo respalda en el backend. */
  exportToPDF(): void {
    const filteredData = this.getAllFilteredArchives(); // USAR TODOS LOS REGISTROS FILTRADOS
    
    if (filteredData.length === 0) {
      alert('No hay datos para exportar con los filtros aplicados');
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
      if (this.selectedState) {
        const state = this.states.find(s => s.id == this.selectedState);
        filters.push(`Estado: ${state?.name || this.selectedState}`);
      }
      
      doc.text(filterInfo + filters.join(', '), 14, 30);
    }

    const exportData = filteredData.map((a: any) => [
      a.archive_number,
      `${a.name ?? ''} ${a.last_name_father ?? ''} ${a.last_name_mother ?? ''}`,
      a.age ?? 'N/A',
      a.gender?.name ?? 'N/A',
      a.address ?? 'N/A',
      a.location?.name ?? a.location_text ?? 'N/A',
      a.location?.municipality?.name ?? 'N/A',
      a.location?.municipality?.state?.name ?? 'N/A',
      a.admission_date ?? 'N/A'
    ]);

    autoTable(doc, {
      startY: this.hasActiveFilters() ? 35 : 25,
      head: [['No. Archivo', 'Nombre', 'Edad', 'Género', 'Dirección', 'Localidad', 'Municipio', 'Estado', 'Fecha de ingreso']],
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
    return !!(this.selectedState || 
              this.selectedMunicipality || 
              this.selectedLocation || 
              this.selectedGender || 
              this.selectedYear || 
              this.selectedMonth);
  }

  /** Descarga un respaldo por nombre de archivo. */
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

    // Agregar filtros geográficos si están aplicados
    if (this.selectedState) {
      const state = this.states.find(s => s.id == this.selectedState);
      if (state) {
        filterParts.push(state.name.replace(/\s+/g, '_'));
      }
    }

    if (this.selectedMunicipality) {
      const municipality = this.municipalities.find(m => m.id == this.selectedMunicipality);
      if (municipality) {
        filterParts.push(municipality.name.replace(/\s+/g, '_'));
      }
    }

    if (this.selectedLocation) {
      const location = this.locations.find(l => l.id == this.selectedLocation);
      if (location) {
        filterParts.push(location.name.replace(/\s+/g, '_'));
      }
    }

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

    // Filtros geográficos
    if (this.selectedState) {
      const state = this.states.find(s => s.id == this.selectedState);
      filters.push(`Estado: ${state?.name || 'Desconocido'}`);
    }

    if (this.selectedMunicipality) {
      const municipality = this.municipalities.find(m => m.id == this.selectedMunicipality);
      filters.push(`Municipio: ${municipality?.name || 'Desconocido'}`);
    }

    if (this.selectedLocation) {
      const location = this.locations.find(l => l.id == this.selectedLocation);
      filters.push(`Localidad: ${location?.name || 'Desconocida'}`);
    }

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
   * MÉTODOS TRACKBY PARA OPTIMIZAR RENDERIZADO DE LISTAS
   */
  /** TrackBy para optimizar renderizado de lista de estados. */
  trackByStateId(index: number, item: any): any {
    return item.id;
  }

  /** TrackBy para optimizar renderizado de lista de municipios. */
  trackByMunicipalityId(index: number, item: any): any {
    return item.id;
  }

  /** TrackBy para optimizar renderizado de lista de localidades. */
  trackByLocationId(index: number, item: any): any {
    return item.id;
  }

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
