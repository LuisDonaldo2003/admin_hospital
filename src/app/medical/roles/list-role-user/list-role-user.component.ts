// Importación de módulos y servicios necesarios para el componente de listado de roles de usuario
import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RolesService } from '../service/roles.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PermissionService } from 'src/app/shared/services/permission.service';

/**
 * Componente para listar roles de usuario con paginación, búsqueda y acciones.
 */
@Component({
  selector: 'app-list-role-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './list-role-user.component.html',
  styleUrls: ['./list-role-user.component.scss']
})
export class ListRoleUserComponent {
  /**
   * Lista de roles de usuario mostrados en la tabla
   */
  public rolesList: any = [];
  /**
   * Fuente de datos para la tabla de Angular Material
   */
  dataSource!: MatTableDataSource<any>;

  /**
   * Bandera para mostrar el filtro de búsqueda
   */
  public showFilter = false;
  /**
   * Valor actual del campo de búsqueda
   */
  public searchDataValue = '';
  /**
   * Último índice de la tabla
   */
  public lastIndex = 0;
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
   * Lista general de roles de usuario (sin paginación)
   */
  public role_generals: any = [];
  /**
   * Rol seleccionado para acciones (editar/eliminar)
   */
  public role_selected: any;

  /**
   * Idioma seleccionado actualmente
   */
  public selectedLang: string;

  /**
   * Constructor que inyecta el servicio de roles y traducción
   */
  constructor(
    public RoleService: RolesService,
    private translate: TranslateService,
    public permissionService: PermissionService
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
   * Obtiene los datos de roles desde el servicio y los prepara para la tabla
   */
  private getTableData(): void {
    this.rolesList = [];
    this.serialNumberArray = [];

    this.RoleService.listRoles().subscribe((resp: any) => {
      this.totalData = resp.roles.length;
      this.role_generals = resp.roles
        .map((role: any) => ({
          ...role,
          permissions: role.permission_pluck || []
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      this.getTableDataGeneral();
    });
  }

  /**
   * Prepara los datos paginados para mostrar en la tabla
   */
  getTableDataGeneral() {
    this.rolesList = [];
    this.serialNumberArray = [];

    this.role_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
        this.rolesList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.rolesList);
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  /**
   * Selecciona un rol para acciones (editar/eliminar)
   */
  selectRole(rol: any) {
    this.role_selected = rol;
  }

  /**
   * Elimina el rol seleccionado y actualiza la tabla
   */
  deleteRol() {
    this.RoleService.deleteRoles(this.role_selected.id).subscribe((resp: any) => {
      let INDEX = this.rolesList.findIndex((item: any) => item.id == this.role_selected.id);
      if (INDEX != -1) {
        this.rolesList.splice(INDEX, 1);

        // Cierra el modal de forma completamente controlada
        const modalId = `delete_role-${this.role_selected.id}`;
        const modalElement = document.getElementById(modalId);
        
        if (modalElement) {
          // Método 1: Usar Bootstrap API si está disponible
          const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
          if (bootstrapModal) {
            bootstrapModal.hide();
          } else {
            // Método 2: Cierre manual seguro
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            modalElement.setAttribute('aria-hidden', 'true');
          }
        }
        
        // Limpieza del DOM sin afectar las clases de tema
        setTimeout(() => {
          // Elimina solo la clase específica del modal
          document.body.classList.remove('modal-open');
          
          // Elimina backdrops específicos
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(backdrop => backdrop.remove());
          
          // Restaura overflow del body sin afectar otras clases
          document.body.style.removeProperty('overflow');
          document.body.style.removeProperty('padding-right');
        }, 150);

        this.role_selected = null;
      }
    });
  }

  /**
   * Filtra los datos de la tabla según el valor de búsqueda
   */
  public searchData(value: any): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.rolesList = this.dataSource.filteredData;
  }

  /**
   * Ordena los datos de la tabla según la columna seleccionada
   */
  public sortData(sort: any) {
    const data = this.rolesList.slice();

    if (!sort.active || sort.direction === '') {
      this.rolesList = data;
    } else {
      this.rolesList = data.sort((a: any, b: any) => {
        const aValue = (a as any)[sort.active];
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  /**
   * Obtiene más datos para la tabla al cambiar de página
   */
  public getMoreData(event: string): void {
    if (event == 'next') {
      this.currentPage++;
      this.pageIndex = this.currentPage - 1;
      this.limit += this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableDataGeneral();
    } else if (event == 'previous') {
      this.currentPage--;
      this.pageIndex = this.currentPage - 1;
      this.limit -= this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableDataGeneral();
    }
  }

  /**
   * Mueve a una página específica en la paginación
   */
  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.skip = this.pageSelection[pageNumber - 1].skip;
    this.limit = this.pageSelection[pageNumber - 1].limit;
    if (pageNumber > this.currentPage) {
      this.pageIndex = pageNumber - 1;
    } else if (pageNumber < this.currentPage) {
      this.pageIndex = pageNumber + 1;
    }
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
    this.totalPages = totalData / pageSize;
    if (this.totalPages % 1 != 0) {
      this.totalPages = Math.trunc(this.totalPages + 1);
    }
    for (var i = 1; i <= this.totalPages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;
      this.pageNumberArray.push(i);
      this.pageSelection.push({ skip: skip, limit: limit });
    }
  }

  /**
   * Verifica si el usuario tiene permiso para editar roles
   */
  canEditRole(): boolean {
    return this.permissionService.hasPermission('edit_rol');
  }

  /**
   * Verifica si el usuario tiene permiso para eliminar roles
   */
  canDeleteRole(): boolean {
    return this.permissionService.hasPermission('delete_rol');
  }

  /**
   * Verifica si un rol es protegido (no se puede editar ni eliminar)
   * Los roles protegidos son: Director General y Subdirector General
   */
  isProtectedRole(roleId: number, roleName: string): boolean {
    // ID 1 siempre es Director General
    if (roleId === 1) {
      return true;
    }
    
    // Verificar por nombre de rol (normalizado)
    const protectedRoles = ['director general', 'subdirector general'];
    const normalizedRoleName = roleName.toLowerCase().trim();
    
    return protectedRoles.includes(normalizedRoleName);
  }
}