// Importación de módulos y servicios necesarios para el componente de listado de staff
import { Component } from '@angular/core';
import { StaffService } from '../service/staff.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TranslateModule
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
   * Fuente de datos para la tabla de Angular Material
   */
  dataSource!: MatTableDataSource<any>;

  /**
   * Valor actual del campo de búsqueda
   */
  public searchDataValue = '';
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
      this.role_generals = resp.users.sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );
      this.getTableDataGeneral();
    });
  }

  /**
   * Prepara los datos paginados para mostrar en la tabla
   */
  getTableDataGeneral() {
    this.usersList = [];
    this.serialNumberArray = [];

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
      const index = this.usersList.findIndex((item: any) => item.id === this.staff_selected.id);
      if (index !== -1) {
        this.usersList.splice(index, 1);
        this.staff_selected = null;
      }
    });
  }

  /**
   * Filtra los datos de la tabla según el valor de búsqueda
   */
  public searchData(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.usersList = this.dataSource.filteredData;
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
}
