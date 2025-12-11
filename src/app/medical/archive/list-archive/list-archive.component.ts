// Importaciones principales de Angular y librerías necesarias
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchiveService } from '../service/archive.service';
import { DriverTourService } from '../../../shared/services/driver-tour.service';
import { PermissionService } from 'src/app/shared/services/permission.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, switchMap, of, catchError, finalize, tap } from 'rxjs';

// Interfaces para mejor tipado
// Interfaz para los filtros disponibles en la búsqueda de archivos
interface FilterOptions {
  archiveNumberSearch: string;
  nameSearch: string;
  selectedGender: string;
  locationTextSearch: string;  // Búsqueda por texto de localidad
  municipalityTextSearch: string;  // Búsqueda por texto de municipio
  stateTextSearch: string;  // Búsqueda por texto de estado
  // Filtros de fecha
  dateFilterType: string;
  specificYear: string;
  specificMonth: string;
  specificDay: string;
  dateFrom: string;
  dateTo: string;
}

// Interfaz para los elementos de catálogo (género, estado, municipio, etc.)
interface CatalogItem {
  id: string | number;
  name: string;
}

// Interfaz para los datos de cada archivo/paciente
interface ArchiveData {
  archive_number: string;
  name: string;
  last_name_father: string;
  last_name_mother: string;
  age: number;
  age_unit?: string;
  gender?: CatalogItem;
  address?: string;
  location_text?: string; // Campo para texto plano de localidad
  municipality_text?: string; // Campo para texto plano de municipio
  state_text?: string; // Campo para texto plano de estado
  admission_date?: string;
  contact_name?: string;
  contact_last_name_father?: string;
  contact_last_name_mother?: string;
  is_original_search?: boolean; // Marca si este es el expediente buscado originalmente
}

// Decorador principal del componente de listado de archivos
@Component({
  selector: 'app-list-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './list-archive.component.html',
  styleUrls: ['./list-archive.component.scss']
})
export class ListArchiveComponent implements OnInit, OnDestroy {
  // Datos principales
  // Lista de archivos/pacientes mostrados en la tabla
  public displayedArchives: ArchiveData[] = [];
  // Archivo/paciente seleccionado para acciones (editar/eliminar)
  public archive_selected: ArchiveData | null = null;

  // Filtros de búsqueda
  // Filtros de búsqueda principales
  public archiveNumberSearch = '';
  public nameSearch = '';
  public selectedGender = '';
  public locationTextSearch = '';
  public municipalityTextSearch = '';
  public stateTextSearch = '';

  // Filtros de fecha avanzados
  // Filtros avanzados de fecha
  public dateFilterType = ''; // 'year', 'month', 'day', 'range', 'specific'
  public specificYear = '';
  public specificMonth = '';
  public specificDay = '';
  public dateFrom = '';
  public dateTo = '';

  // Controlar dropdowns abiertos
  // Índice del dropdown abierto en la tabla de acciones
  public openDropdownIndex: number | null = null;

  // Opciones para los selectores de fecha
  // Opciones para los selectores de fecha
  public years: number[] = [];
  // Meses disponibles para filtro de fecha
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
  // Días disponibles para filtro de fecha
  public days: number[] = [];

  // Catálogos (solo géneros necesarios)
  public genders: CatalogItem[] = [];

  // Paginación
  // Variables de paginación
  public totalRecords = 0;
  public currentPage = 1;
  public pageSize = 50;
  public totalPages = 0;

  // Estados de carga
  // Estados de carga para mostrar spinners y deshabilitar controles
  public isLoading = false;
  public isLoadingCatalogs = false;
  // Idioma seleccionado para traducción
  public selectedLang: string;

  // Subjects para manejo de búsquedas con debounce
  // Subject para manejar búsquedas con debounce
  private searchSubject = new Subject<void>();
  // Subject para destruir suscripciones al destruir el componente
  private destroy$ = new Subject<void>();

  // Cache para evitar peticiones repetidas
  // Cache para catálogos ya cargados y evitar peticiones repetidas
  private catalogCache = new Map<string, CatalogItem[]>();

  // Timeout para debounce de rango de fechas
  // Timeout para debounce en el filtro de rango de fechas
  private dateRangeTimeout: any;

  /**
   * Constructor: inicializa servicios, idioma y configura debounce de búsqueda
   */
  constructor(
    private archiveService: ArchiveService,
    private translate: TranslateService,
    private driverTourService: DriverTourService,
    public permissionService: PermissionService
  ) {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
    // Configura el debounce para las búsquedas
    this.setupSearchDebounce();
  }

  /**
   * ngOnInit: carga catálogos, inicializa opciones de fecha y carga archivos
   */
  ngOnInit(): void {
    this.loadCatalogs();
    this.initializeDateOptions();
    this.loadArchives();

    // Verificar si mostrar el tour automáticamente
    this.checkAndShowWelcomeTour();
  }

  /**
   * ngOnDestroy: limpia timeouts y destruye subjects para evitar fugas de memoria
   */
  ngOnDestroy(): void {
    if (this.dateRangeTimeout) {
      clearTimeout(this.dateRangeTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa las opciones de fecha (años y días vacíos)
   */
  private initializeDateOptions(): void {
    this.years = [];
    this.days = [];
  }

  /**
   * Configura el debounce para las búsquedas rápidas
   */
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadArchives();
      });
  }

  /**
   * Carga los catálogos de géneros y estados, usando cache si ya existen
   */
  private loadCatalogs(): void {
    this.isLoadingCatalogs = true;
    // Solo géneros
    if (!this.catalogCache.has('genders')) {
      this.archiveService.listGenders()
        .pipe(
          tap((res: any) => this.catalogCache.set('genders', res)),
          takeUntil(this.destroy$),
          finalize(() => this.isLoadingCatalogs = false)
        )
        .subscribe((res: any) => this.genders = res);
    } else {
      this.genders = this.catalogCache.get('genders') || [];
      this.isLoadingCatalogs = false;
    }
  }

  /**
   * Cambia el idioma de la interfaz y lo guarda en localStorage
   */
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  // Método optimizado para cargar archivos
  /**
   * Carga los archivos/pacientes aplicando los filtros y paginación
   */
  private loadArchives(): void {
    this.isLoading = true;
    const skip = (this.currentPage - 1) * this.pageSize;
    const filters: FilterOptions = {
      archiveNumberSearch: this.archiveNumberSearch.trim(),
      nameSearch: this.nameSearch.trim(),
      selectedGender: this.selectedGender,
      locationTextSearch: this.locationTextSearch.trim(),
      municipalityTextSearch: this.municipalityTextSearch.trim(),
      stateTextSearch: this.stateTextSearch.trim(),
      dateFilterType: this.dateFilterType,
      specificYear: this.specificYear,
      specificMonth: this.specificMonth,
      specificDay: this.specificDay,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };
    this.archiveService.listArchivesWithFilters(filters, skip, this.pageSize)
      .pipe(
        catchError(() => {
          // Si ocurre error, retorna lista vacía y total 0
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
  // Último valor buscado por número de expediente para evitar llamadas repetidas
  private lastArchiveSearchValue = '';
  /**
   * Dispara búsqueda por número de expediente, solo si cambia el valor
   */
  public onArchiveNumberSearch(): void {
    const val = this.archiveNumberSearch.trim();
    if (val === this.lastArchiveSearchValue) return;
    this.lastArchiveSearchValue = val;
    this.searchSubject.next();
  }

  // Método específico para búsqueda por nombre (con validación)
  // Último valor buscado por nombre para evitar llamadas repetidas
  private lastNameSearchValue = '';
  /**
   * Dispara búsqueda por nombre, solo si cambia el valor y tiene longitud válida
   */
  public onNameSearch(): void {
    const val = this.nameSearch.trim();
    if (val === this.lastNameSearchValue) return;
    this.lastNameSearchValue = val;
    if (val.length === 0 || val.length >= 2) {
      this.searchSubject.next();
    }
  }

  // Métodos públicos para triggear búsquedas
  /**
   * Dispara búsqueda genérica (usado en otros filtros)
   */
  public onSearchChange(): void {
    this.searchSubject.next();
  }

  /**
   * Aplica los filtros y recarga la página 1
   */
  public onFilterChange(): void {
    this.currentPage = 1;
    this.loadArchives();
  }

  /**
   * Cambia la página actual y recarga los archivos
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadArchives();
    }
  }

  /**
   * Calcula el rango de páginas para la paginación (con puntos suspensivos)
   */
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

  /**
   * Selecciona un archivo/paciente para acciones (editar/eliminar)
   */
  selectArchive(archive: ArchiveData): void {
    this.archive_selected = archive;
  }

  /**
   * Elimina el archivo/paciente seleccionado y actualiza la lista
   */
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
  /**
   * Maneja el cambio de tipo de filtro de fecha y limpia los valores relacionados
   */
  public onDateFilterTypeChange(): void {
    // Limpiar filtros de fecha al cambiar el tipo
    this.specificYear = '';
    this.specificMonth = '';
    this.specificDay = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.days = []; // Limpiar días también

    // Generar años solo para year y day
    if (this.dateFilterType === 'year' || this.dateFilterType === 'day') {
      this.generateYears();
    }

    this.onFilterChange();
  }

  // Generar años disponibles
  /**
   * Genera el arreglo de años disponibles para los filtros de fecha
   */
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
  /**
   * Actualiza el arreglo de días según el año y mes seleccionados
   */
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

  /**
   * Maneja el cambio en los selectores de fecha y aplica el filtro
   */
  public onDateFilterChange(): void {
    // Actualizar días disponibles cuando cambia año o mes solo para filtro de día
    if (this.dateFilterType === 'day') {
      this.updateDaysForSelectedMonth();
    }

    // Filtro por mes: permitir año opcional (no borrar si ya existe)
    if (this.dateFilterType === 'month' && !this.specificMonth) {
      // Si se limpia el mes, también limpiar año/día relacionados
      this.specificYear = '';
      this.specificDay = '';
    }

    // ...log eliminado...

    // Aplicar filtro inmediatamente para selectores
    this.onFilterChange();
  }

  // Método específico para rangos de fecha que solo se ejecuta en blur
  /**
   * Aplica el filtro de rango de fechas al perder foco
   */
  public onDateRangeChange(): void {
    if (this.dateFilterType === 'range' && (this.dateFrom || this.dateTo)) {
      setTimeout(() => {
        this.onFilterChange();
      }, 100);
    }
  }

  // Debounce para inputs de rango de fecha
  /**
   * Maneja el debounce para los inputs de rango de fecha
   */
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
  /**
   * Limpia todos los filtros y recarga la lista desde la página 1
   */
  public clearAllFilters(): void {
    this.archiveNumberSearch = '';
    this.nameSearch = '';
    this.selectedGender = '';
    this.locationTextSearch = '';
    this.municipalityTextSearch = '';
    this.stateTextSearch = '';
    // Importante: reiniciar últimos valores buscados para permitir repetir la misma búsqueda después de limpiar
    this.lastArchiveSearchValue = '';
    this.lastNameSearchValue = '';

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
  /**
   * Verifica si hay algún filtro activo
   */
  public get hasActiveFilters(): boolean {
    return !!(
      this.archiveNumberSearch.trim() ||
      this.nameSearch.trim() ||
      this.selectedGender ||
      this.locationTextSearch.trim() ||
      this.municipalityTextSearch.trim() ||
      this.stateTextSearch.trim() ||
      this.dateFilterType ||
      this.specificYear ||
      this.specificMonth ||
      this.specificDay ||
      this.dateFrom ||
      this.dateTo
    );
  }

  // TrackBy function para optimizar el renderizado de la tabla
  /**
  /**
   * TrackBy para optimizar el renderizado de la tabla
   */
  public trackByArchiveNumber(index: number, item: ArchiveData): string {
    return item.archive_number;
  }

  // Método para manejar dropdowns y evitar sobreposición
  /**
   * Maneja la apertura/cierre de dropdowns de acciones en la tabla
   */
  public onDropdownToggle(index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Si el dropdown actual ya está abierto, cerrarlo
    if (this.openDropdownIndex === index) {
      this.openDropdownIndex = null;
    } else {
      // Cerrar cualquier dropdown abierto y abrir el nuevo
      this.openDropdownIndex = index;
    }
  }

  // Método para cerrar todos los dropdowns
  /**
   * Cierra todos los dropdowns de acciones
   */
  public closeAllDropdowns(): void {
    this.openDropdownIndex = null;
  }

  // Verificar si un dropdown específico está abierto
  /**
   * Verifica si un dropdown específico está abierto
   */
  public isDropdownOpen(index: number): boolean {
    return this.openDropdownIndex === index;
  }

  // ================================
  // MÉTODOS DE TOUR GUIADO
  // ================================

  /**
   * Verifica si debe mostrar el tour de bienvenida automáticamente
   */
  private checkAndShowWelcomeTour(): void {
    // Solo mostrar el tour automáticamente si es la primera vez
    if (!this.driverTourService.isTourCompleted('archive-list-welcome')) {
      setTimeout(() => {
        this.startArchiveListTour();
        // Marcar como completado el tour de bienvenida automático
        const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]');
        completedTours.push('archive-list-welcome');
        localStorage.setItem('completedTours', JSON.stringify(completedTours));
      }, 1000);
    }
  }

  /**
   * Inicia el tour completo de la lista de archivos
   */
  public startArchiveListTour(): void {
    this.driverTourService.startArchiveListTour();
  }

  /**
   * Destaca una funcionalidad específica con un tour rápido
   */
  public highlightFeature(element: string, titleKey: string, descKey: string): void {
    const title = this.translate.instant(titleKey);
    const description = this.translate.instant(descKey);
    this.driverTourService.highlightElement(element, title, description);
  }

  /**
   * Reinicia todos los tours (útil para testing)
   */
  public resetTours(): void {
    this.driverTourService.resetAllTours();
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
   * Verifica si el usuario tiene permiso para editar archivos
   */
  canEditArchive(): boolean {
    return this.permissionService.hasPermission('edit_archive');
  }

  /**
   * Verifica si el usuario tiene permiso para eliminar archivos
   */
  canDeleteArchive(): boolean {
    return this.permissionService.hasPermission('delete_archive');
  }
}
