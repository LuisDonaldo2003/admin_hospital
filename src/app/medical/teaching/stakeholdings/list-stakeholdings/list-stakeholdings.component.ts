import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogsService, CatalogItem } from '../../services/catalogs.service';
import { PermissionService } from 'src/app/shared/services/permission.service';

@Component({
  selector: 'app-list-stakeholdings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './list-stakeholdings.component.html',
  styleUrls: ['./list-stakeholdings.component.scss']
})
export class ListStakeholdingsComponent implements OnInit {
  private catalogsService = inject(CatalogsService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  public permissionService = inject(PermissionService);
  public selectedLang: string = 'en';

  public participaciones: CatalogItem[] = [];
  public loading = false;
  public searchDataValue = '';
  public itemToDelete: CatalogItem | null = null;
  public text_success: string = '';
  public text_validation: string = '';

  // Paginación
  public pageSize = 20;
  public totalData = 0;
  public skip = 0;
  public limit = this.pageSize;
  public currentPage = 1;
  public pageIndex = 0;
  public pageNumberArray: number[] = [];
  public pageSelection: Array<{ skip: number, limit: number }> = [];
  public totalPages = 0;
  public serialNumberArray: number[] = [];
  public participacionesAll: CatalogItem[] = [];

  constructor() {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit(): void {
    this.loadParticipaciones();
  }

  addStakeholding(): void {
    this.router.navigate(['/teaching/add_stakeholding']);
  }

  editStakeholding(item: CatalogItem): void {
    this.router.navigate(['/teaching/edit_stakeholding', item.id]);
  }

  loadParticipaciones(): void {
    this.loading = true;
    this.catalogsService.getParticipaciones().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.participacionesAll = response.data;
          this.totalData = this.participacionesAll.length;
          this.PageSize();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando participaciones:', err);
        this.loading = false;
      }
    });
  }

  getTableDataGeneral() {
    this.participaciones = [];
    this.serialNumberArray = [];

    const search = this.searchDataValue?.trim().toLowerCase() || '';
    const source: CatalogItem[] = search
      ? this.participacionesAll.filter(a => (
          (a.nombre || '').toLowerCase().includes(search) ||
          (a.descripcion || '').toLowerCase().includes(search)
        ))
      : this.participacionesAll;

    this.totalData = source.length;

    source.forEach((res: CatalogItem, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
        this.participaciones.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.calculateTotalPages(this.totalData, this.pageSize);
  }

  public searchData(value: string): void {
    this.searchDataValue = value || '';
    this.skip = 0;
    this.limit = this.pageSize;
    this.currentPage = 1;
    this.getTableDataGeneral();
  }

  getMoreData(event: string): void {
    if (event == 'next') {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.pageIndex = this.currentPage - 1;
        this.skip = this.pageSize * this.pageIndex;
        this.limit = this.pageSize * (this.pageIndex + 1);
        this.getTableDataGeneral();
      }
    } else if (event == 'previous') {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.pageIndex = this.currentPage - 1;
        this.skip = this.pageSize * this.pageIndex;
        this.limit = this.pageSize * (this.pageIndex + 1);
        this.getTableDataGeneral();
      }
    }
  }

  moveToPage(pageNumber: number): void {
    if (!this.pageSelection || !this.pageSelection[pageNumber - 1]) return;
    this.currentPage = pageNumber;
    this.pageIndex = pageNumber - 1;
    this.skip = this.pageSelection[pageNumber - 1].skip;
    this.limit = this.pageSelection[pageNumber - 1].limit;
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
    this.pageSelection = [];
    this.totalPages = Math.ceil(totalData / pageSize) || 0;
    for (let i = 1; i <= this.totalPages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;
      this.pageNumberArray.push(i);
      this.pageSelection.push({ skip: skip, limit: limit });
    }
  }

  confirmDelete(): void {
    if (!this.itemToDelete) return;

    this.catalogsService.deleteParticipacion(this.itemToDelete.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.text_success = 'Participación eliminada correctamente';
          this.itemToDelete = null;
          this.loadParticipaciones();
        }
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.text_validation = err.error?.message || 'Error al eliminar';
      }
    });
  }

  toggleStatus(item: CatalogItem): void {
    this.catalogsService.toggleParticipacionStatus(item.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadParticipaciones();
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('Error al cambiar estado');
      }
    });
  }

  /**
   * Verifica si el usuario tiene permiso para editar
   */
  canEdit(): boolean {
    return this.permissionService.hasPermission('edit_stakeholding');
  }

  /**
   * Verifica si el usuario tiene permiso para eliminar
   */
  canDelete(): boolean {
    return this.permissionService.hasPermission('delete_stakeholding');
  }
}
