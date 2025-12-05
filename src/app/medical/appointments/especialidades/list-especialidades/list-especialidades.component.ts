import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { EspecialidadService, Especialidad } from '../service/especialidad.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PermissionService } from 'src/app/shared/services/permission.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-list-especialidades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './list-especialidades.component.html',
  styleUrls: ['./list-especialidades.component.scss']
})
export class ListEspecialidadesComponent implements OnInit {
  public especialidadList: Especialidad[] = [];
  dataSource!: MatTableDataSource<Especialidad>;

  public showFilter = false;
  public searchDataValue = '';
  public lastIndex = 0;
  public pageSize = 20;
  public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  public especialidad_generals: Especialidad[] = [];
  public especialidad_selected: Especialidad | null = null;

  constructor(
    public especialidadService: EspecialidadService,
    private translate: TranslateService,
    public permissionService: PermissionService,
    private driverTourService: DriverTourService
  ) {}

  ngOnInit(): void {
    this.getTableData();
    this.checkAndStartTour();
  }

  private checkAndStartTour(): void {
    setTimeout(() => {
      if (!this.driverTourService.isTourCompleted('especialidades-list')) {
        this.startTour();
      }
    }, 500);
  }

  startTour(): void {
    this.driverTourService.startEspecialidadesListTour();
  }

  private getTableData(): void {
    this.especialidadList = [];
    this.serialNumberArray = [];

    this.especialidadService.listEspecialidades().subscribe({
      next: (resp: any) => {
        this.totalData = resp.data.length;
        this.especialidad_generals = resp.data;
        this.getTableDataGeneral();
      },
      error: (error: any) => {
        console.error('Error loading especialidades:', error);
      }
    });
  }

  getTableDataGeneral() {
    this.especialidadList = [];
    this.serialNumberArray = [];

    this.especialidad_generals.map((res: Especialidad, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
        this.especialidadList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });

    this.dataSource = new MatTableDataSource<Especialidad>(this.especialidadList);
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  searchData(value: string): void {
    this.searchDataValue = value;
    if (!value) {
      this.getTableData();
      return;
    }

    const lowerValue = value.toLowerCase();
    this.especialidadList = this.especialidad_generals.filter((item: Especialidad) => {
      return (
        item.nombre?.toLowerCase().includes(lowerValue) ||
        item.descripcion?.toLowerCase().includes(lowerValue)
      );
    });

    this.dataSource = new MatTableDataSource<Especialidad>(this.especialidadList);
    this.totalData = this.especialidadList.length;
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  sortData(sort: any) {
    const data = this.especialidadList.slice();
    if (!sort.active || sort.direction === '') {
      this.especialidadList = data;
    } else {
      this.especialidadList = data.sort((a: Especialidad, b: Especialidad) => {
        const aValue = (a as any)[sort.active];
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  getMoreData(event: string): void {
    if (event === 'next') {
      this.currentPage++;
      this.pageIndex = this.currentPage - 1;
      this.limit += this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableDataGeneral();
    } else if (event === 'previous') {
      this.currentPage--;
      this.pageIndex = this.currentPage - 1;
      this.limit -= this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableDataGeneral();
    }
  }

  moveToPage(pageNumber: number): void {
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

  PageSize(): void {
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.getTableDataGeneral();
  }

  private calculateTotalPages(totalData: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalPages = totalData / pageSize;
    if (this.totalPages % 1 !== 0) {
      this.totalPages = Math.trunc(this.totalPages + 1);
    }
    for (let i = 1; i <= this.totalPages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;
      this.pageNumberArray.push(i);
      this.pageSelection.push({ skip: skip, limit: limit });
    }
  }

  selectEspecialidad(especialidad: Especialidad): void {
    this.especialidad_selected = especialidad;
  }

  deleteEspecialidad(): void {
    if (!this.especialidad_selected) return;

    this.especialidadService.deleteEspecialidad(this.especialidad_selected.id).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.especialidad_generals = this.especialidad_generals.filter(
            (item: Especialidad) => item.id !== this.especialidad_selected!.id
          );
          this.getTableData();
        }
      },
      error: (error: any) => {
        console.error('Error deleting especialidad:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  canEditEspecialidad(): boolean {
    return this.permissionService.hasPermission('appointments_especialidades_edit');
  }

  canDeleteEspecialidad(): boolean {
    return this.permissionService.hasPermission('appointments_especialidades_delete');
  }
}
