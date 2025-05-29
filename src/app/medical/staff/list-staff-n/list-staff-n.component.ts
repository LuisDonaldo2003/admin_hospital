import { Component } from '@angular/core';
import { StaffService } from '../service/staff.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  public usersList: any = [];
  dataSource!: MatTableDataSource<any>;

  public searchDataValue = '';
  public pageSize = 10;
  public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  public role_generals: any = [];
  public staff_selected: any;

  public selectedLang: string;

  constructor(
    public staffService: StaffService,
    private translate: TranslateService
  ) {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit() {
    this.getTableData();
  }

  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

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

  selectUser(user: any) {
    this.staff_selected = user;
  }

  deleteUser() {
    this.staffService.deleteUser(this.staff_selected.id).subscribe(() => {
      const index = this.usersList.findIndex((item: any) => item.id === this.staff_selected.id);
      if (index !== -1) {
        this.usersList.splice(index, 1);
        this.staff_selected = null;
      }
    });
  }

  public searchData(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.usersList = this.dataSource.filteredData;
  }

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

  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.pageIndex = pageNumber - 1;
    this.skip = this.pageSelection[pageNumber - 1].skip;
    this.limit = this.pageSelection[pageNumber - 1].limit;
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
    this.totalPages = Math.ceil(totalData / pageSize);
    for (let i = 1; i <= this.totalPages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;
      this.pageNumberArray.push(i);
      this.pageSelection.push({ skip: skip, limit: limit });
    }
  }
}
