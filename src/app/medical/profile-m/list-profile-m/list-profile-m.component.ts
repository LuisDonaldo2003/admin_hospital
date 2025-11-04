// Importación de módulos y servicios necesarios para el componente de listado de perfiles médicos
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { ProfileMService } from '../service/profile-m.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PermissionService } from 'src/app/shared/services/permission.service';

/**
 * Componente para listar perfiles médicos con paginación, búsqueda y acciones.
 */
@Component({
  selector: 'app-list-profile-m',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './list-profile-m.component.html',
  styleUrl: './list-profile-m.component.scss'
})
export class ListProfileMComponent {
  /**
   * Lista de perfiles médicos mostrados en la tabla
   */
  public profileList: any = [];
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
  public pageSize = 20;
  /**
   * Total de registros disponibles
   */
  public totalData = 0;
  /**
   * Índice de inicio para paginación
   */
  public skip = 0; // MIN
  /**
   * Límite máximo para paginación
   */
  public limit: number = this.pageSize; // MAX
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
   * Lista general de perfiles médicos (sin paginación)
   */
  public profile_generals: any = [];
  /**
   * Perfil seleccionado para acciones (editar/eliminar)
   */
  public profile_selected: any;

  /**
   * Constructor que inyecta el servicio de perfiles y traducción
   */
  constructor(
    public profileService: ProfileMService,
    private translate: TranslateService,
    public permissionService: PermissionService
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Carga los datos iniciales de la tabla
   */
  ngOnInit() {
    this.getTableData();
  }

  /**
   * Obtiene los datos de perfiles desde el servicio y los prepara para la tabla
   */
  private getTableData(): void {
    this.profileList = [];
    this.serialNumberArray = [];

    this.profileService.listProfile().subscribe((resp: any) => {
      // Asigna el total de perfiles y los ordena alfabéticamente
      this.totalData = resp.profiles.length;
      this.profile_generals = resp.profiles.sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );
      this.getTableDataGeneral();
    });
  }

  /**
   * Prepara los datos paginados para mostrar en la tabla
   */
  getTableDataGeneral() {
    this.profileList = [];
    this.serialNumberArray = [];

    this.profile_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
        this.profileList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.profileList);
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  /**
   * Selecciona un perfil para acciones (editar/eliminar)
   */
  selectProfile(rol: any) {
    this.profile_selected = rol;
  }

  /**
   * Elimina el perfil seleccionado y actualiza la tabla
   */
  deleteProfile() {
    this.profileService.deleteProfile(this.profile_selected.id).subscribe((resp: any) => {
      // Actualizar el array general primero
      let INDEX_GENERAL = this.profile_generals.findIndex((item: any) => item.id == this.profile_selected.id);
      if (INDEX_GENERAL != -1) {
        this.profile_generals.splice(INDEX_GENERAL, 1);
        this.totalData = this.profile_generals.length;
      }

      // Recalcular la paginación y recargar los datos
      this.getTableDataGeneral();
      this.profile_selected = null;
    })
  }

  /**
   * Filtra los datos de la tabla según el valor de búsqueda
   */
  public searchData(value: any): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.profileList = this.dataSource.filteredData;
  }

  /**
   * Ordena los datos de la tabla según la columna seleccionada
   */
  public sortData(sort: any) {
    const data = this.profileList.slice();

    if (!sort.active || sort.direction === '') {
      this.profileList = data;
    } else {
      this.profileList = data.sort((a: any, b: any) => {
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
   * Verifica si el usuario tiene permiso para editar perfiles
   */
  canEditProfile(): boolean {
    return this.permissionService.hasPermission('edit_profile-m');
  }

  /**
   * Verifica si el usuario tiene permiso para eliminar perfiles
   */
  canDeleteProfile(): boolean {
    return this.permissionService.hasPermission('delete_profile-m');
  }

  /**
   * Formatea una fecha para mostrar solo la fecha sin hora
   * @param dateString Fecha en formato string
   * @returns Fecha formateada sin hora
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString.split(' ')[0] || dateString;
    }
  }
}
