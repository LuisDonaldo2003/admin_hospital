// Importación de módulos y servicios necesarios para el componente de listado de roles de usuario
import { Component, OnInit, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { RolesService } from '../service/roles.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PermissionService } from 'src/app/shared/services/permission.service';

// Interfaces para tipado
interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
  permission_pluck?: string[]; // Lista de nombres de permisos asociados al rol
  users_count?: number;
  created_at?: string; // Fecha de creación del rol
}

interface PageSelection {
  skip: number;
  limit: number;
}

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
export class ListRoleUserComponent implements OnInit {
  /**
   * Lista de roles de usuario mostrados en la tabla
   */
  public rolesList: Role[] = [];
  /**
   * Fuente de datos para la tabla de Angular Material
   */
  dataSource!: MatTableDataSource<Role>;

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
  public pageSelection: PageSelection[] = [];
  /**
   * Total de páginas calculadas
   */
  public totalPages = 0;

  /**
   * Lista general de roles de usuario (sin paginación)
   */
  public role_generals: Role[] = [];
  /**
   * Rol seleccionado para acciones (editar/eliminar)
   */
  public role_selected: Role | null = null;

  /**
   * Idioma seleccionado actualmente
   */
  public selectedLang: string;

  // Inyección moderna de dependencias
  public roleService = inject(RolesService);
  private translate = inject(TranslateService);
  public permissionService = inject(PermissionService);

  constructor() {
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

    this.roleService.listRoles().subscribe((resp: any) => {
      this.totalData = resp.roles.length;
      this.role_generals = resp.roles
        .map((role: any) => ({
          ...role,
          permissions: role.permission_pluck || []
        }))
        .sort((a: Role, b: Role) => a.name.localeCompare(b.name));

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
   * Selecciona un rol para edición o eliminación
   */
  selectRole(rol: Role): void {
    this.role_selected = rol;
  }

  /**
   * Elimina el rol seleccionado y actualiza la tabla
   */
  deleteRol(): void {
    if (!this.role_selected) {
      console.error('No se ha seleccionado ningún rol');
      return;
    }

    this.roleService.deleteRoles(this.role_selected.id).subscribe(() => {
      // Actualizar el array general primero
      const INDEX_GENERAL = this.role_generals.findIndex((item: Role) => item.id === this.role_selected!.id);
      if (INDEX_GENERAL !== -1) {
        this.role_generals.splice(INDEX_GENERAL, 1);
        this.totalData = this.role_generals.length;
      }

      // Recalcular la paginación y recargar los datos
      this.getTableDataGeneral();
      this.role_selected = null;
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