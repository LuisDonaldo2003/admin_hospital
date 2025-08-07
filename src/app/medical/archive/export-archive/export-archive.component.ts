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
  // DATOS ORIGINALES - NO SE MODIFICAN DESPUÉS DE LA CARGA
  private allArchives: any[] = [];
  backups: any[] = [];

  // CACHE Y OPTIMIZACIÓN DE FILTROS
  private filteredCache: any[] = [];
  private lastFilterHash: string = '';
  
  // PAGINACIÓN VIRTUAL PARA RENDERIZADO
  displayedArchives: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 50; // MOSTRAR SOLO 50 REGISTROS POR PÁGINA
  totalPages: number = 0;
  totalFilteredRecords: number = 0;

  // DATOS DE FILTROS PRE-CALCULADOS
  states: any[] = [];
  municipalities: any[] = [];
  locations: any[] = [];
  genders: any[] = [];

  // FILTROS SELECCIONADOS
  selectedState: string = '';
  selectedMunicipality: string = '';
  selectedLocation: string = '';
  selectedGender: string = '';
  selectedYear: string = '';
  selectedMonth: string = '';

  // ÍNDICES OPTIMIZADOS PARA BÚSQUEDA RÁPIDA
  private stateIndex: Map<string, any[]> = new Map();
  private municipalityIndex: Map<string, any[]> = new Map();
  private genderIndex: Map<string, any[]> = new Map();
  private yearIndex: Map<string, any[]> = new Map();
  private monthIndex: Map<string, any[]> = new Map();

  // Opciones de años y meses
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

  loading: boolean = false;
  isLoadingPage: boolean = false; 

  constructor(
    private archiveService: ArchiveService,
    private translate: TranslateService
  ) {
    const lang = localStorage.getItem('language') || 'en';
    this.translate.use(lang);
  }

  ngOnInit(): void {
    this.loadArchives();
    this.loadBackups();
    this.loadGenders();
    this.initializeYears();
  }

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
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  }

  private initializeYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 2000; // Año inicial
    this.years = [];
    for (let year = currentYear; year >= startYear; year--) {
      this.years.push(year);
    }
  }

  private loadGenders(): void {
    this.archiveService.listGenders().subscribe({
      next: (res: any) => this.genders = res,
      error: err => console.error('Error loading genders:', err)
    });
  }

  loadArchives(): void {
    this.loading = true;
    this.archiveService.getAllArchives().subscribe({
      next: (res: any) => {
        // ALMACENAR DATOS ORIGINALES
        this.allArchives = Array.isArray(res.data) ? res.data : [];
        
        // CONSTRUIR ÍNDICES PARA BÚSQUEDA OPTIMIZADA
        this.buildSearchIndexes();
        
        // EXTRAER FILTROS ÚNICOS
        this.extractUniqueFilters();
        
        // APLICAR FILTROS INICIALES
        this.applyFiltersOptimized();
        
        this.loading = false;
        console.log(`✅ Cargados ${this.allArchives.length} registros con índices optimizados`);
      },
      error: err => {
        console.error('Error loading archives:', err);
        this.loading = false;
      }
    });
  }

  /**
   * CONSTRUYE ÍNDICES PARA BÚSQUEDA OPTIMIZADA
   * Esto permite filtrar en O(1) en lugar de O(n)
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

    console.log(`🚀 Índices construidos: Estados(${this.stateIndex.size}), Municipios(${this.municipalityIndex.size}), Géneros(${this.genderIndex.size}), Años(${this.yearIndex.size}), Meses(${this.monthIndex.size})`);
  }

  /**
   * EXTRAE FILTROS ÚNICOS DE MANERA OPTIMIZADA
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

  loadBackups(): void {
    this.archiveService.listBackups().subscribe({
      next: (res: any) => this.backups = res.data,
      error: err => console.error('Error cargando respaldos:', err)
    });
  }

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
      console.log(`🏙️ Estado seleccionado: ${stateKey}, municipios encontrados: ${this.municipalities.length}`);
    } else {
      this.municipalities = [];
    }
    
    this.applyFiltersOptimized();
  }

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
      console.log(`🏘️ Municipio seleccionado: ${municipalityKey}, localidades encontradas: ${this.locations.length}`);
    } else {
      this.locations = [];
    }
    
    this.applyFiltersOptimized();
  }

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
  applyFiltersOptimized(): void {
    const filterHash = this.generateFilterHash();
    
    // SI EL HASH ES EL MISMO, USAR CACHE (INCLUSO SI EL RESULTADO ES 0)
    if (filterHash === this.lastFilterHash && this.lastFilterHash !== '') {
      this.updatePagination();
      return;
    }

    console.time('Filtrado optimizado');
    
    let candidateSet: Set<any> = new Set();
    let firstFilter = true;

    // FILTRO POR ESTADO - USAR ÍNDICE CON STRING
    if (this.selectedState) {
      const stateKey = String(this.selectedState);
      const stateResults = this.stateIndex.get(stateKey) || [];
      console.log(`🔍 Filtro Estado: Buscando "${stateKey}", encontrados ${stateResults.length} registros`);
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
      console.log(`🔍 Filtro Municipio: Buscando "${municipalityKey}", encontrados ${municipalityResults.length} registros`);
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
      console.log(`🔍 Filtro Localidad: Buscando "${locationKey}", encontrados ${locationResults.length} registros`);
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
      console.log(`🔍 Filtro Género: Buscando "${genderKey}", encontrados ${genderResults.length} registros`);
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
      console.log(`🔍 Filtro Año: Buscando "${yearKey}", encontrados ${yearResults.length} registros`);
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
      console.log(`🔍 Filtro Mes: Buscando "${monthKey}", encontrados ${monthResults.length} registros`);
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
    
    console.timeEnd('Filtrado optimizado');
    console.log(`🎯 Filtrado: ${this.totalFilteredRecords} registros de ${this.allArchives.length}`);
    
    // RESETEAR PAGINACIÓN Y ACTUALIZAR VISTA
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * GENERA HASH ÚNICO DE LOS FILTROS ACTUALES
   */
  private generateFilterHash(): string {
    return `${this.selectedState}-${this.selectedMunicipality}-${this.selectedLocation}-${this.selectedGender}-${this.selectedYear}-${this.selectedMonth}`;
  }

  /**
   * ACTUALIZA LA PAGINACIÓN Y LOS REGISTROS MOSTRADOS
   */
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.totalFilteredRecords / this.itemsPerPage);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    this.displayedArchives = this.filteredCache.slice(startIndex, endIndex);
    
    console.log(`📄 Página ${this.currentPage}/${this.totalPages} - Mostrando registros ${startIndex + 1}-${Math.min(endIndex, this.totalFilteredRecords)} de ${this.totalFilteredRecords}`);
  }

  /**
   * MÉTODO PÚBLICO PARA OBTENER REGISTROS FILTRADOS (PAGINADOS)
   */
  getDisplayedArchives(): any[] {
    // LOG PARA DEBUGGEAR LA ACTUALIZACIÓN DE LA VISTA
    if (this.displayedArchives.length !== (this.displayedArchives || []).length) {
      console.log(`🔄 Vista actualizada: ${this.displayedArchives.length} registros mostrados`);
    }
    return this.displayedArchives;
  }

  /**
   * MÉTODO PÚBLICO PARA OBTENER TODOS LOS REGISTROS FILTRADOS (PARA EXPORTACIÓN)
   */
  getAllFilteredArchives(): any[] {
    return this.filteredCache;
  }

  /**
   * MÉTODOS DE NAVEGACIÓN DE PÁGINAS
   */
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

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * MÉTODO LEGACY MANTENIDO PARA COMPATIBILIDAD (AHORA OPTIMIZADO)
   */

  filteredArchives(): any[] {
    // MÉTODO LEGACY - AHORA DELEGA A LA VERSIÓN OPTIMIZADA
    return this.getAllFilteredArchives();
  }

  exportToExcel(): void {
    const filteredData = this.getAllFilteredArchives(); // USAR TODOS LOS REGISTROS FILTRADOS
    
    if (filteredData.length === 0) {
      alert('No hay datos para exportar con los filtros aplicados');
      return;
    }

    console.log(`📊 Exportando ${filteredData.length} registros a Excel...`);

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
        console.log('✅ Respaldo Excel enviado al backend');
        this.loadBackups(); // Recarga la lista de respaldos
      },
      error: err => console.error('❌ Error enviando respaldo Excel:', err)
    });
  }

  exportToPDF(): void {
    const filteredData = this.getAllFilteredArchives(); // USAR TODOS LOS REGISTROS FILTRADOS
    
    if (filteredData.length === 0) {
      alert('No hay datos para exportar con los filtros aplicados');
      return;
    }

    console.log(`📄 Exportando ${filteredData.length} registros a PDF...`);

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
        console.log('✅ Respaldo PDF enviado al backend');
        this.loadBackups(); // Recarga la lista de respaldos
      },
      error: err => console.error('❌ Error enviando respaldo PDF:', err)
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedState || 
              this.selectedMunicipality || 
              this.selectedLocation || 
              this.selectedGender || 
              this.selectedYear || 
              this.selectedMonth);
  }

  downloadBackup(filename: string): void {
    this.archiveService.downloadBackup(filename).subscribe(blob => {
      FileSaver.saveAs(blob, filename);
    });
  }

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
    
    console.log('🗂️ Generando nombre de archivo:');
    console.log(`   Filtros activos: ${this.hasActiveFilters() ? 'Sí' : 'No'}`);
    console.log(`   Nombre base: ${baseName}`);
    console.log(`   Versión: V${version}`);
    console.log(`   Nombre final: ${finalFilename}`);

    return finalFilename;
  }

  // Método para mostrar un resumen de los filtros aplicados
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
  getPaginationInfo(): string {
    if (this.totalFilteredRecords === 0) return 'No hay registros';
    
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalFilteredRecords);
    return `Mostrando ${start}-${end} de ${this.totalFilteredRecords} registros`;
  }

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
  onFilterChange(filterType: string): void {
    console.log(`🔍 Filtro cambiado: ${filterType}`);
    
    // APLICAR FILTROS INMEDIATAMENTE
    this.applyFiltersOptimized();
    
    // LOG PARA VERIFICAR QUE LA VISTA SE ACTUALICE
    console.log(`📊 Después del filtro: ${this.totalFilteredRecords} registros filtrados, mostrando ${this.displayedArchives.length} en página ${this.currentPage}`);
  }

  /**
   * MÉTODOS TRACKBY PARA OPTIMIZAR RENDERIZADO DE LISTAS
   */
  trackByStateId(index: number, item: any): any {
    return item.id;
  }

  trackByMunicipalityId(index: number, item: any): any {
    return item.id;
  }

  trackByLocationId(index: number, item: any): any {
    return item.id;
  }

  trackByGenderId(index: number, item: any): any {
    return item.id;
  }

  trackByYear(index: number, item: number): number {
    return item;
  }

  trackByMonthValue(index: number, item: any): string {
    return item.value;
  }

  trackByArchiveId(index: number, item: any): any {
    return item.id || item.archive_number;
  }
}
