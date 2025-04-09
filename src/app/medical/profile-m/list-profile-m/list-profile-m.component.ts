import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { ProfileMService } from '../service/profile-m.service';

@Component({
  selector: 'app-list-profile-m',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule
  ],
  templateUrl: './list-profile-m.component.html',
  styleUrl: './list-profile-m.component.scss'
})
export class ListProfileMComponent {

  public profileList: any = [];
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

  public profile_generals: any = [];
  public profile_selected: any;

  constructor(
    public profileService: ProfileMService,
  ) {}

  ngOnInit() {
    this.getTableData();
  }

  private getTableData(): void {
    this.profileList = [];
    this.serialNumberArray = [];

    this.profileService.listProfile().subscribe((resp: any) => {
      console.log(resp);

      this.totalData = resp.profile.length;
      this.profile_generals = resp.profile;
      this.getTableDataGeneral();
    })
  }

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

  selectProfile(rol: any) {
    this.profile_selected = rol;
  }

  deleteProfile() {
    this.profileService.deleteProfile(this.profile_selected.id).subscribe((resp: any) => {
      console.log(resp);
      let INDEX = this.profileList.findIndex((item: any) => item.id == this.profile_selected.id);
      if (INDEX != -1) {
        this.profileList.splice(INDEX, 1);

        $('#delete_patient').hide();
        $("#delete_patient").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");

        this.profile_selected = null;
      }
    })
  }

  public searchData(value: any): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.profileList = this.dataSource.filteredData;
  }

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
