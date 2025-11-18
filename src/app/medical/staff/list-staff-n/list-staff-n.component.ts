// Importación de módulos y servicios necesarios para el componente de listado de staff
import { Component } from '@angular/core';
import { StaffService } from '../service/staff.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HasPermissionDirective } from 'src/app/shared/directives/has-permission.directive';

/**
 * Componente para listar los usuarios del staff con paginación, búsqueda y acciones.
 */
@Component({
  selector: 'app-list-staff-n',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    TranslateModule,
    HasPermissionDirective
  ],
  templateUrl: './list-staff-n.component.html',
  styleUrl: './list-staff-n.component.scss'
})
export class ListStaffNComponent {
  /**
   * Lista de usuarios del staff mostrados en la tabla
   */
  public usersList: any = [];
  /**
   * Lista completa de usuarios sin filtrar (origen)
   */
  public allUsers: any = [];
  /**
   * Fuente de datos para la tabla de Angular Material
   */
  dataSource!: MatTableDataSource<any>;

  /**
   * Valor actual del campo de búsqueda
   */
  public searchDataValue = '';
  /**
   * Filtro por rol seleccionado (nombre de rol)
   */
  public roleFilter: string = '';
  /**
   * Cantidad de registros por página
   */
  public pageSize = 10;
  /**
   * Total de registros disponibles
   */
  public totalData = 0;
  /**
   * Índice de inicio para paginación
   */
  public skip = 0;
  /**
   * Límite máximo para paginación
   */
  public limit: number = this.pageSize;
  /**
   * Índice de la página actual
   */
  public pageIndex = 0;
  /**
   * Arreglo de números de serie para la tabla
   */
  public serialNumberArray: Array<number> = [];
  /**
   * Página actual
   */
  public currentPage = 1;
  /**
   * Arreglo de números de página para la paginación
   */
  public pageNumberArray: Array<number> = [];
  /**
   * Selección de páginas con sus rangos
   */
  public pageSelection: Array<any> = [];
  /**
   * Total de páginas calculadas
   */
  public totalPages = 0;

  /**
   * Lista general de usuarios (sin paginación)
   */
  public role_generals: any = [];
  /**
   * Lista de roles extraída de los usuarios (para filtro)
   */
  public roleList: string[] = [];
  /**
   * Indica si la lista está invertida
   */
  public inverted: boolean = false;
  /**
   * Usuario seleccionado para acciones (editar/eliminar)
   */
  public staff_selected: any;

  /**
   * Idioma seleccionado actualmente
   */
  public selectedLang: string;

  /**
   * Constructor que inyecta el servicio de staff y traducción
   */
  constructor(
    public staffService: StaffService,
    private translate: TranslateService
  ) {
    // Establece el idioma inicial
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los datos iniciales de la tabla
   */
  ngOnInit() {
    this.getTableData();
  }

  /**
   * Alterna el idioma entre español e inglés y lo guarda en localStorage
   */
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  /**
   * Obtiene los datos de usuarios desde el servicio y los prepara para la tabla
   */
  private getTableData(): void {
    this.usersList = [];
    this.serialNumberArray = [];

    this.staffService.listUsers().subscribe((resp: any) => {
      this.totalData = resp.users.length;
      // Guardar copia completa
      this.allUsers = resp.users.slice();

      // Extraer lista única de roles
      const rolesSet = new Set<string>();
      this.allUsers.forEach((u: any) => {
        const r = u.role?.name || '';
        if (r) rolesSet.add(r);
      });
      this.roleList = Array.from(rolesSet).sort();

      // Inicializar listado filtrado y paginado
      this.role_generals = this.allUsers.slice().sort((a: any, b: any) => a.name.localeCompare(b.name));
      this.applyFilters();
    });
  }

  /**
   * Prepara los datos paginados para mostrar en la tabla
   */
  getTableDataGeneral() {
    this.usersList = [];
    this.serialNumberArray = [];

    // role_generals ya contiene la lista filtrada y ordenada
    this.role_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
        this.usersList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });

    this.dataSource = new MatTableDataSource<any>(this.usersList);
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  /**
   * Selecciona un usuario para acciones (editar/eliminar)
   */
  selectUser(user: any) {
    this.staff_selected = user;
  }

  /**
   * Elimina el usuario seleccionado y actualiza la tabla
   */
  deleteUser() {
    this.staffService.deleteUser(this.staff_selected.id).subscribe(() => {
      // Actualizar el array general primero
      const INDEX_GENERAL = this.role_generals.findIndex((item: any) => item.id === this.staff_selected.id);
      if (INDEX_GENERAL !== -1) {
        this.role_generals.splice(INDEX_GENERAL, 1);
        this.totalData = this.role_generals.length;
      }

      // Recalcular la paginación y recargar los datos
      this.getTableDataGeneral();
      this.staff_selected = null;
    });
  }

  /**
   * Filtra los datos de la tabla según el valor de búsqueda
   */
  public searchData(value: string): void {
    this.searchDataValue = value || '';
    this.applyFilters();
  }

  /**
   * Aplica filtros de búsqueda y rol sobre la lista completa
   */
  public applyFilters(): void {
    const q = (this.searchDataValue || '').trim().toLowerCase();
    const role = (this.roleFilter || '').trim().toLowerCase();

    let filtered = this.allUsers.slice();

    if (q) {
      filtered = filtered.filter((u: any) => {
        const full = ((u.name || '') + ' ' + (u.surname || '') + ' ' + (u.email || '')).toLowerCase();
        return full.indexOf(q) !== -1;
      });
    }

    if (role) {
      filtered = filtered.filter((u: any) => (u.role?.name || '').toLowerCase() === role);
    }

    // Ordenar por nombre (respetar inversión)
    filtered = filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
    if (this.inverted) filtered = filtered.reverse();

    this.role_generals = filtered;
    this.totalData = this.role_generals.length;
    // reset paginación
    this.skip = 0;
    this.limit = this.pageSize;
    this.currentPage = 1;
    this.pageSelection = [];
    this.getTableDataGeneral();
  }

  /**
   * Cambia el filtro de rol y reaplica filtros
   */
  public onRoleFilterChange(value: string): void {
    this.roleFilter = value;
    this.applyFilters();
  }

  /**
   * Invierte el orden actual de la lista y reaplica paginación
   */
  public toggleReverseOrder(): void {
    this.inverted = !this.inverted;
    this.role_generals = this.role_generals.slice().reverse();
    this.getTableDataGeneral();
  }

  /**
   * Ordena los datos de la tabla según la columna seleccionada
   */
  public sortData(sort: any): void {
    const data = this.usersList.slice();
    if (!sort.active || sort.direction === '') {
      this.usersList = data;
    } else {
      this.usersList = data.sort((a: any, b: any) => {
        const aValue = a[sort.active];
        const bValue = b[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  /**
   * Obtiene más datos para la tabla al cambiar de página
   */
  public getMoreData(event: string): void {
    if (event === 'next') {
      this.currentPage++;
    } else if (event === 'previous') {
      this.currentPage--;
    }
    this.pageIndex = this.currentPage - 1;
    this.skip = this.pageIndex * this.pageSize;
    this.limit = this.skip + this.pageSize;
    this.getTableDataGeneral();
  }

  /**
   * Mueve a una página específica en la paginación
   */
  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.pageIndex = pageNumber - 1;
    this.skip = this.pageSelection[pageNumber - 1].skip;
    this.limit = this.pageSelection[pageNumber - 1].limit;
    this.getTableDataGeneral();
  }

  /**
   * Reinicia la paginación y búsqueda de la tabla
   */
  public PageSize(): void {
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.searchDataValue = '';
    this.getTableDataGeneral();
  }

  /**
   * Calcula el total de páginas y prepara los rangos para la paginación
   */
  private calculateTotalPages(totalData: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalPages = Math.ceil(totalData / pageSize);
    for (let i = 1; i <= this.totalPages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;
      this.pageNumberArray.push(i);
      this.pageSelection.push({ skip: skip, limit: limit });
    }
  }

  /**
   * Verifica si un usuario es protegido (no se puede editar ni eliminar)
   * Los usuarios protegidos son: Director General (id 1) y Subdirector General (por rol)
   */
  isProtectedUser(userId: number, userRole: string): boolean {
    // ID 1 siempre es Director General
    if (userId === 1) {
      return true;
    }
    
    // Verificar por nombre de rol (normalizado)
    const protectedRoles = ['director general', 'subdirector general'];
    const normalizedRoleName = userRole?.toLowerCase().trim() || '';
    
    return protectedRoles.includes(normalizedRoleName);
  }
}
