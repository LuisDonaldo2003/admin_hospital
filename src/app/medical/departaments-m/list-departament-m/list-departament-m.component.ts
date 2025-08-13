import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { DepartamentMService } from '../service/departament-m.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-list-departament-m',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './list-departament-m.component.html',
  styleUrl: './list-departament-m.component.scss'
})
export class ListDepartamentMComponent {

  // Lista de departamentos mostrados en la tabla
  public departamentsList: any = [];
  // Fuente de datos para la tabla de Angular Material
  dataSource!: MatTableDataSource<any>;

  // Controla la visibilidad del filtro
  public showFilter = false;
  // Valor actual del campo de búsqueda
  public searchDataValue = '';
  // Último índice mostrado
  public lastIndex = 0;
  // Cantidad de registros por página
  public pageSize = 20;
  // Total de registros
  public totalData = 0;
  // Índice de inicio para paginación
  public skip = 0; // MIN
  // Índice de fin para paginación
  public limit: number = this.pageSize; // MAX
  // Índice de página actual
  public pageIndex = 0;
  // Array de números de serie para la tabla
  public serialNumberArray: Array<number> = [];
  // Página actual
  public currentPage = 1;
  // Array de números de página para paginación
  public pageNumberArray: Array<number> = [];
  // Selección de páginas (skip/limit por página)
  public pageSelection: Array<any> = [];
  // Total de páginas calculadas
  public totalPages = 0;

  // Lista general de departamentos (sin paginación)
  public departament_generals: any = [];
  // Departamento seleccionado para acciones (editar/eliminar)
  public departament_selected: any;

  /**
   * Inyecta el servicio de departamentos y el servicio de traducción
   */
  constructor(
    public departamentsService: DepartamentMService,
    private translate: TranslateService
  ) {}

  /**
   * Inicializa el componente y carga los datos de la tabla
   */
  ngOnInit() {
    this.getTableData();
  }

  /**
   * Obtiene los datos de departamentos desde el backend y los ordena
   */
  private getTableData(): void {
    this.departamentsList = [];
    this.serialNumberArray = [];

    this.departamentsService.listDepartaments().subscribe((resp: any) => {
      this.totalData = resp.departaments.length;
      this.departament_generals = resp.departaments.sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );
      this.getTableDataGeneral();
    })
  }

  /**
   * Prepara los datos para la tabla y la paginación
   */
  getTableDataGeneral() {
    this.departamentsList = [];
    this.serialNumberArray = [];

    this.departament_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
        this.departamentsList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.departamentsList);
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  /**
   * Selecciona un departamento para acciones (editar/eliminar)
   */
  selectDepartament(rol: any) {
    this.departament_selected = rol;
  }

  /**
   * Elimina el departamento seleccionado y actualiza la tabla
   */
  deleteDepartament() {
    this.departamentsService.deleteDepartament(this.departament_selected.id).subscribe((resp: any) => {
      let INDEX = this.departamentsList.findIndex((item: any) => item.id == this.departament_selected.id);
      if (INDEX != -1) {
        this.departamentsList.splice(INDEX, 1);

        // Oculta el modal y limpia selección
        $('#delete_patient').hide();
        $("#delete_patient").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");

        this.departament_selected = null;
      }
    })
  }

  /**
   * Filtra los datos de la tabla según el valor de búsqueda
   */
  public searchData(value: any): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.departamentsList = this.dataSource.filteredData;
  }

  /**
   * Ordena los datos de la tabla según la columna seleccionada
   */
  public sortData(sort: any) {
    const data = this.departamentsList.slice();

    if (!sort.active || sort.direction === '') {
      this.departamentsList = data;
    } else {
      this.departamentsList = data.sort((a: any, b: any) => {
        const aValue = (a as any)[sort.active];
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  /**
   * Cambia de página en la paginación (siguiente/anterior)
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
   * Navega a una página específica en la paginación
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
   * Reinicia la paginación y el filtro de búsqueda
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
   * Calcula el total de páginas y la selección de paginación
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
}
