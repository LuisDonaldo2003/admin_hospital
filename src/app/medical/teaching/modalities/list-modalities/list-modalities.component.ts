import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogsService, CatalogItem } from '../../services/catalogs.service';

@Component({
  selector: 'app-list-modalities',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './list-modalities.component.html',
  styleUrls: ['./list-modalities.component.scss']
})
export class ListModalitiesComponent implements OnInit {
  private catalogsService = inject(CatalogsService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  public selectedLang: string = 'en';

  public modalidades: CatalogItem[] = [];
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
  public modalidadesAll: CatalogItem[] = [];

  constructor() {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit(): void {
    this.loadModalidades();
  }

  addModality(): void {
    this.router.navigate(['/teaching/add_modality']);
  }

  editModality(item: CatalogItem): void {
    this.router.navigate(['/teaching/edit_modality', item.id]);
  }

  loadModalidades(): void {
    this.loading = true;
    this.catalogsService.getModalidades().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.modalidadesAll = response.data;
          this.totalData = this.modalidadesAll.length;
          this.PageSize();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando modalidades:', err);
        this.loading = false;
      }
    });
  }

  getTableDataGeneral() {
    this.modalidades = [];
    this.serialNumberArray = [];

    const search = this.searchDataValue?.trim().toLowerCase() || '';
    const source: CatalogItem[] = search
      ? this.modalidadesAll.filter(a => (
          (a.nombre || '').toLowerCase().includes(search) ||
          (a.codigo || '').toLowerCase().includes(search) ||
          (a.descripcion || '').toLowerCase().includes(search)
        ))
      : this.modalidadesAll;

    this.totalData = source.length;

    source.forEach((res: CatalogItem, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
        this.modalidades.push(res);
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

    this.catalogsService.deleteModalidad(this.itemToDelete.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.text_success = 'Modalidad eliminada correctamente';
          this.itemToDelete = null;
          this.loadModalidades();
        }
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.text_validation = err.error?.message || 'Error al eliminar';
      }
    });
  }

  toggleStatus(item: CatalogItem): void {
    this.catalogsService.toggleModalidadStatus(item.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadModalidades();
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('Error al cambiar estado');
      }
    });
  }
}
