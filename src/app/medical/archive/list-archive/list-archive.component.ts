import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchiveService } from '../service/archive.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, switchMap, of, catchError, finalize, tap } from 'rxjs';

// Interfaces para mejor tipado
interface FilterOptions {
  archiveNumberSearch: string;
  nameSearch: string;
  selectedGender: string;
  selectedState: string;
  selectedMunicipality: string;
  selectedLocation: string;
  // Nuevos filtros de fecha
  dateFilterType: string;
  specificYear: string;
  specificMonth: string;
  specificDay: string;
  dateFrom: string;
  dateTo: string;
}

interface CatalogItem {
  id: string | number;
  name: string;
}

interface ArchiveData {
  archive_number: string;
  name: string;
  last_name_father: string;
  last_name_mother: string;
  age: number;
  gender?: CatalogItem;
  address?: string;
  location?: {
    id: string | number;
    name: string;
    municipality?: {
      id: string | number;
      name: string;
      state?: CatalogItem;
    };
  };
  location_text?: string; // Campo para texto plano de localidad
  admission_date?: string;
}

@Component({
  selector: 'app-list-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './list-archive.component.html',
  styleUrls: ['./list-archive.component.scss']
})
export class ListArchiveComponent implements OnInit, OnDestroy {
  // Datos principales
  public displayedArchives: ArchiveData[] = [];
  public archive_selected: ArchiveData | null = null;

  // Filtros de búsqueda
  public archiveNumberSearch = '';
  public nameSearch = '';
  public selectedGender = '';
  public selectedState = '';
  public selectedMunicipality = '';
  public selectedLocation = '';
  
  // Filtros de fecha avanzados
  public dateFilterType = ''; // 'year', 'month', 'day', 'range', 'specific'
  public specificYear = '';
  public specificMonth = '';
  public specificDay = '';
  public dateFrom = '';
  public dateTo = '';

  // Opciones para los selectores de fecha
  public years: number[] = [];
  public months = [
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
  public days: number[] = [];

  // Catálogos
  public states: CatalogItem[] = [];
  public municipalities: CatalogItem[] = [];
  public locations: CatalogItem[] = [];
  public genders: CatalogItem[] = [];

  // Paginación
  public totalRecords = 0;
  public currentPage = 1;
  public pageSize = 50;
  public totalPages = 0;

  // Estados de carga
  public isLoading = false;
  public isLoadingCatalogs = false;
  public selectedLang: string;

  // Subjects para manejo de búsquedas con debounce
  private searchSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  // Cache para evitar peticiones repetidas
  private catalogCache = new Map<string, CatalogItem[]>();

  // Timeout para debounce de rango de fechas
  private dateRangeTimeout: any;

  constructor(
    private archiveService: ArchiveService,
    private translate: TranslateService
  ) {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);

    // Configurar búsqueda con debounce
    this.setupSearchDebounce();
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.initializeDateOptions();
    this.loadArchives();
  }

  ngOnDestroy(): void {
    // Limpiar timeout pendiente
    if (this.dateRangeTimeout) {
      clearTimeout(this.dateRangeTimeout);
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeDateOptions(): void {
    // Los años se generarán dinámicamente cuando se seleccione un filtro de fecha
    this.years = [];
    this.days = [];
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(500), // Esperar 500ms después del último cambio
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadArchives();
      });
  }

  private loadCatalogs(): void {
    this.isLoadingCatalogs = true;
    
    // Cargar géneros
    if (!this.catalogCache.has('genders')) {
      this.archiveService.listGenders()
        .pipe(
          tap((res: any) => this.catalogCache.set('genders', res)),
          takeUntil(this.destroy$)
        )
        .subscribe((res: any) => this.genders = res);
    } else {
      this.genders = this.catalogCache.get('genders') || [];
    }

    // Cargar estados
    if (!this.catalogCache.has('states')) {
      this.archiveService.listStates()
        .pipe(
          tap((res: any) => this.catalogCache.set('states', res)),
          takeUntil(this.destroy$),
          finalize(() => this.isLoadingCatalogs = false)
        )
        .subscribe((res: any) => this.states = res);
    } else {
      this.states = this.catalogCache.get('states') || [];
      this.isLoadingCatalogs = false;
    }
  }

  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  // Método optimizado para cargar archivos
  private loadArchives(): void {
    this.isLoading = true;
    const skip = (this.currentPage - 1) * this.pageSize;
    
    const filters: FilterOptions = {
      archiveNumberSearch: this.archiveNumberSearch.trim(),
      nameSearch: this.nameSearch.trim(),
      selectedGender: this.selectedGender,
      selectedState: this.selectedState,
      selectedMunicipality: this.selectedMunicipality,
      selectedLocation: this.selectedLocation,
      dateFilterType: this.dateFilterType,
      specificYear: this.specificYear,
      specificMonth: this.specificMonth,
      specificDay: this.specificDay,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };

    this.archiveService.listArchivesWithFilters(filters, skip, this.pageSize)
      .pipe(
        catchError((error) => {
          console.error('Error al cargar archivos:', error);
          return of({ data: [], total: 0 });
        }),
        finalize(() => this.isLoading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: any) => {
          this.displayedArchives = res.data || [];
          this.totalRecords = res.total || 0;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        }
      });
  }

  // Método específico para búsqueda por número de archivo (inmediata)
  public onArchiveNumberSearch(): void {
    this.currentPage = 1;
    this.loadArchives();
  }

  // Método específico para búsqueda por nombre (con validación)
  public onNameSearch(): void {
    // Si el nombre tiene al menos 2 caracteres o está vacío, buscar
    if (this.nameSearch.trim().length >= 2 || this.nameSearch.trim().length === 0) {
      this.searchSubject.next();
    }
  }

  // Métodos públicos para triggear búsquedas
  public onSearchChange(): void {
    this.searchSubject.next();
  }

  public onFilterChange(): void {
    this.currentPage = 1;
    this.loadArchives();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadArchives();
    }
  }

  get paginationRange(): (number | string)[] {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, this.currentPage - delta);
    const right = Math.min(this.totalPages - 1, this.currentPage + delta);

    if (this.totalPages <= 1) return [];

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) {
      if (i !== 1 && i !== this.totalPages) range.push(i);
    }
    if (right < this.totalPages - 1) range.push('...');
    if (this.totalPages > 1) range.push(this.totalPages);

    return range;
  }

  // Método optimizado para cambio de estado
  public onStateChange(): void {
    // Limpiar filtros dependientes
    this.selectedMunicipality = '';
    this.selectedLocation = '';
    this.municipalities = [];
    this.locations = [];

    if (this.selectedState) {
      const cacheKey = `municipalities_${this.selectedState}`;
      
      if (this.catalogCache.has(cacheKey)) {
        this.municipalities = this.catalogCache.get(cacheKey) || [];
      } else {
        this.archiveService.listMunicipalities(this.selectedState)
          .pipe(
            tap((res: any) => this.catalogCache.set(cacheKey, res)),
            takeUntil(this.destroy$)
          )
          .subscribe((res: any) => {
            this.municipalities = res || [];
          });
      }
    }

    this.onFilterChange();
  }

  // Método optimizado para cambio de municipio
  public onMunicipalityChange(): void {
    // Limpiar filtros dependientes
    this.selectedLocation = '';
    this.locations = [];

    if (this.selectedMunicipality) {
      const cacheKey = `locations_${this.selectedMunicipality}`;
      
      if (this.catalogCache.has(cacheKey)) {
        this.locations = this.catalogCache.get(cacheKey) || [];
      } else {
        this.archiveService.listLocations(this.selectedMunicipality)
          .pipe(
            tap((res: any) => this.catalogCache.set(cacheKey, res)),
            takeUntil(this.destroy$)
          )
          .subscribe((res: any) => {
            this.locations = res || [];
          });
      }
    }

    this.onFilterChange();
  }

  selectArchive(archive: ArchiveData): void {
    this.archive_selected = archive;
  }

  deleteArchive(): void {
    if (!this.archive_selected) return;
    
    this.archiveService.deleteArchive(this.archive_selected.archive_number)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.archive_selected) {
          this.displayedArchives = this.displayedArchives.filter(
            a => a.archive_number !== this.archive_selected!.archive_number
          );
          this.totalRecords--;
          this.archive_selected = null;
          
          // Si quedamos sin registros en la página actual, ir a la anterior
          if (this.displayedArchives.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }
          
          this.loadArchives();
        }
      });
  }

  // Método para cambio de filtro de fecha
  public onDateFilterTypeChange(): void {
    // Limpiar filtros de fecha al cambiar el tipo
    this.specificYear = '';
    this.specificMonth = '';
    this.specificDay = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.days = []; // Limpiar días también
    
    // Generar años disponibles solo cuando se necesite
    if (this.dateFilterType === 'year' || this.dateFilterType === 'month' || this.dateFilterType === 'day') {
      this.generateYears();
    }
    
    this.onFilterChange();
  }

  // Generar años disponibles
  private generateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = [];
    // Generar desde 2000 hasta el año actual + 1
    for (let year = 2000; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
    // Ordenar de más reciente a más antiguo
    this.years.reverse();
  }

  // Método para actualizar días cuando cambia el año o mes
  public updateDaysForSelectedMonth(): void {
    if (this.specificYear && this.specificMonth) {
      const year = parseInt(this.specificYear);
      const month = parseInt(this.specificMonth);
      const daysInMonth = new Date(year, month, 0).getDate();
      
      this.days = [];
      for (let day = 1; day <= daysInMonth; day++) {
        this.days.push(day);
      }
    } else {
      this.days = [];
    }
  }

  public onDateFilterChange(): void {
    // Actualizar días disponibles cuando cambia año o mes solo para filtro de día
    if (this.dateFilterType === 'day') {
      this.updateDaysForSelectedMonth();
    }
    
    // Aplicar filtro inmediatamente para selectores
    this.onFilterChange();
  }

  // Método específico para rangos de fecha que solo se ejecuta en blur
  public onDateRangeChange(): void {
    if (this.dateFilterType === 'range' && (this.dateFrom || this.dateTo)) {
      setTimeout(() => {
        this.onFilterChange();
      }, 100);
    }
  }

  // Debounce para inputs de rango de fecha
  public onDateRangeInputChange(): void {
    if (this.dateRangeTimeout) {
      clearTimeout(this.dateRangeTimeout);
    }
    
    this.dateRangeTimeout = setTimeout(() => {
      if (this.dateFilterType === 'range' && (this.dateFrom || this.dateTo)) {
        // Solo filtrar si hay fechas válidas completas
        const fromValid = !this.dateFrom || this.dateFrom.length === 10;
        const toValid = !this.dateTo || this.dateTo.length === 10;
        
        if (fromValid && toValid) {
          this.onFilterChange();
        }
      }
    }, 1000); // Esperar 1 segundo después de dejar de escribir
  }

  // Método para limpiar todos los filtros (actualizado)
  public clearAllFilters(): void {
    this.archiveNumberSearch = '';
    this.nameSearch = '';
    this.selectedGender = '';
    this.selectedState = '';
    this.selectedMunicipality = '';
    this.selectedLocation = '';
    this.municipalities = [];
    this.locations = [];
    
    // Limpiar filtros de fecha
    this.dateFilterType = '';
    this.specificYear = '';
    this.specificMonth = '';
    this.specificDay = '';
    this.dateFrom = '';
    this.dateTo = '';
    
    this.currentPage = 1;
    this.loadArchives();
  }

  // Método para verificar si hay filtros activos (actualizado)
  public get hasActiveFilters(): boolean {
    return !!(
      this.archiveNumberSearch.trim() ||
      this.nameSearch.trim() ||
      this.selectedGender ||
      this.selectedState ||
      this.selectedMunicipality ||
      this.selectedLocation ||
      this.dateFilterType ||
      this.specificYear ||
      this.specificMonth ||
      this.specificDay ||
      this.dateFrom ||
      this.dateTo
    );
  }

  // TrackBy function para optimizar el renderizado de la tabla
  public trackByArchiveNumber(index: number, item: ArchiveData): string {
    return item.archive_number;
  }
}
