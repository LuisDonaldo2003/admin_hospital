import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { DepartamentMService } from '../service/departament-m.service';

@Component({
  selector: 'app-list-departament-m',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule
  ],
  templateUrl: './list-departament-m.component.html',
  styleUrl: './list-departament-m.component.scss'
})
export class ListDepartamentMComponent {

  public departamentsList: any = [];
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public searchDataValue = '';
  public lastIndex = 0;
  public pageSize = 20;
  public totalData = 0;
  public skip = 0; // MIN
  public limit: number = this.pageSize; // MAX
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  public departament_generals: any = [];
  public departament_selected: any;

  constructor(
    public departamentsService: DepartamentMService,
  ) {}

  ngOnInit() {
    this.getTableData();
  }

  private getTableData(): void {
    this.departamentsList = [];
    this.serialNumberArray = [];

    this.departamentsService.listDepartaments().subscribe((resp: any) => {
      console.log(resp);

      this.totalData = resp.departaments.length;
      this.departament_generals = resp.departaments;
      this.getTableDataGeneral();
    })
  }

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

  selectDepartament(rol: any) {
    this.departament_selected = rol;
  }

  deleteDepartament() {
    this.departamentsService.deleteDepartament(this.departament_selected.id).subscribe((resp: any) => {
      console.log(resp);
      let INDEX = this.departamentsList.findIndex((item: any) => item.id == this.departament_selected.id);
      if (INDEX != -1) {
        this.departamentsList.splice(INDEX, 1);

        $('#delete_patient').hide();
        $("#delete_patient").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");

        this.departament_selected = null;
      }
    })
  }

  public searchData(value: any): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.departamentsList = this.dataSource.filteredData;
  }

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

  public PageSize(): void {
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.searchDataValue = '';
    this.getTableDataGeneral();
  }

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
