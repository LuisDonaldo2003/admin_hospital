import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { ContractTypesService } from '../service/contract-types.service';
import { TranslateModule } from '@ngx-translate/core'; // <-- IMPORTA ESTO
import { PermissionService } from 'src/app/shared/services/permission.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-list-contract',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    TranslateModule // <-- AGREGA AQUÍ
  ],
  templateUrl: './list-contract.component.html',
  styleUrl: './list-contract.component.scss'
})
export class ListContractComponent {

  // Lista de contratos mostrados en la tabla
  public contractList: any = [];
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

  // Lista general de contratos (sin paginación)
  public contract_generals: any = [];
  // Contrato seleccionado para acciones (editar/eliminar)
  public contract_selected: any;

  /**
   * Inyecta el servicio de contratos
   */
  constructor(
    public contractService: ContractTypesService,
    public permissionService: PermissionService,
    private driverTourService: DriverTourService,
    
  ) {}

  /**
   * Inicializa el componente y carga los datos de la tabla
   */
  ngOnInit() {
    this.getTableData();
  }

  /**
   * Obtiene los datos de contratos desde el backend y los ordena
   */
  private getTableData(): void {
    this.contractList = [];
    this.serialNumberArray = [];

    this.contractService.listContract().subscribe((resp: any) => {
      this.totalData = resp.contracts.length;
      this.contract_generals = resp.contracts.sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );
      this.getTableDataGeneral();
    })
  }

  /**
   * Prepara los datos para la tabla y la paginación
   */
  getTableDataGeneral() {
    this.contractList = [];
    this.serialNumberArray = [];

    this.contract_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
        this.contractList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.contractList);
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  /**
   * Selecciona un contrato para acciones (editar/eliminar)
   */
  selectDepartament(rol: any) {
    this.contract_selected = rol;
  }


   /**
   * Inicia el tour completo de la lista de contratos
   */
  public startContractTypesListTour(): void {
    this.driverTourService.startContractTypesListTour();
  }


  /**
   * Elimina el contrato seleccionado y actualiza la tabla
   */
  deleteContract() {
    this.contractService.deleteContract(this.contract_selected.id).subscribe((resp: any) => {
      // Actualizar el array general primero
      let INDEX_GENERAL = this.contract_generals.findIndex((item: any) => item.id == this.contract_selected.id);
      if (INDEX_GENERAL != -1) {
        this.contract_generals.splice(INDEX_GENERAL, 1);
        this.totalData = this.contract_generals.length;
      }

      // Recalcular la paginación y recargar los datos
      this.getTableDataGeneral();
      this.contract_selected = null;
    })
  }

  /**
   * Filtra los datos de la tabla según el valor de búsqueda
   */
  public searchData(value: any): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.contractList = this.dataSource.filteredData;
  }

  /**
   * Ordena los datos de la tabla según la columna seleccionada
   */
  public sortData(sort: any) {
    const data = this.contractList.slice();

    if (!sort.active || sort.direction === '') {
      this.contractList = data;
    } else {
      this.contractList = data.sort((a: any, b: any) => {
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

  /**
   * Verifica si el usuario tiene permiso para editar contratos
   */
  canEditContract(): boolean {
    return this.permissionService.hasPermission('edit_contract');
  }

  /**
   * Verifica si el usuario tiene permiso para eliminar contratos
   */
  canDeleteContract(): boolean {
    return this.permissionService.hasPermission('delete_contract');
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
