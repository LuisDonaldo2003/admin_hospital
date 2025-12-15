import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { GeneralMedicalService, GeneralMedical } from '../service/general-medical.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PermissionService } from 'src/app/shared/services/permission.service';

@Component({
  selector: 'app-list-general-medical',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './list-general-medical.component.html',
  styleUrls: ['./list-general-medical.component.scss']
})
export class ListGeneralMedicalComponent implements OnInit {
  public generalMedicalList: GeneralMedical[] = [];
  dataSource!: MatTableDataSource<GeneralMedical>;

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

  public general_medicals: GeneralMedical[] = [];
  public general_medical_selected: GeneralMedical | null = null;

  constructor(
    public generalMedicalService: GeneralMedicalService,
    private translate: TranslateService,
    public permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.getTableData();
  }

  private getTableData(): void {
    this.generalMedicalList = [];
    this.serialNumberArray = [];

    this.generalMedicalService.listGeneralMedicals().subscribe({
      next: (resp: any) => {
        this.totalData = resp.data.length;
        this.general_medicals = resp.data;
        this.getTableDataGeneral();
      },
      error: (error: any) => {
        console.error('Error loading general medicals:', error);
      }
    });
  }

  getTableDataGeneral() {
    this.generalMedicalList = [];
    this.serialNumberArray = [];

    this.general_medicals.map((res: GeneralMedical, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
        this.generalMedicalList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });

    this.dataSource = new MatTableDataSource<GeneralMedical>(this.generalMedicalList);
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  searchData(value: string): void {
    this.searchDataValue = value;
    if (!value) {
      this.getTableData();
      return;
    }

    const lowerValue = value.toLowerCase();
    this.generalMedicalList = this.general_medicals.filter((item: GeneralMedical) => {
      return (
        item.nombre?.toLowerCase().includes(lowerValue) ||
        item.descripcion?.toLowerCase().includes(lowerValue)
      );
    });

    this.dataSource = new MatTableDataSource<GeneralMedical>(this.generalMedicalList);
    this.totalData = this.generalMedicalList.length;
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  sortData(sort: any) {
    const data = this.generalMedicalList.slice();
    if (!sort.active || sort.direction === '') {
      this.generalMedicalList = data;
    } else {
      this.generalMedicalList = data.sort((a: GeneralMedical, b: GeneralMedical) => {
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

  selectGeneralMedical(generalMedical: GeneralMedical): void {
    this.general_medical_selected = generalMedical;
  }

  deleteGeneralMedical(): void {
    if (!this.general_medical_selected) return;

    this.generalMedicalService.deleteGeneralMedical(this.general_medical_selected.id).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.general_medicals = this.general_medicals.filter(
            (item: GeneralMedical) => item.id !== this.general_medical_selected!.id
          );
          this.getTableData();
        }
      },
      error: (error: any) => {
        console.error('Error deleting general medical:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  canEditGeneralMedical(): boolean {
    return this.permissionService.hasPermission('appointments_edit_general_medical');
  }

  canDeleteGeneralMedical(): boolean {
    return this.permissionService.hasPermission('appointments_delete_general_medical');
  }
}
