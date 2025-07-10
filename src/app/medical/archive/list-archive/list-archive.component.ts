import { Component, OnInit } from '@angular/core';
import { ArchiveService } from '../service/archive.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-list-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './list-archive.component.html',
  styleUrls: ['./list-archive.component.scss']
})
export class ListArchiveComponent implements OnInit {
  public displayedArchives: any[] = [];
  public archive_selected: any;

  public archiveNumberSearch = '';
  public nameSearch = '';
  public selectedGender = '';
  public selectedState = '';
  public selectedMunicipality = '';
  public selectedLocation = '';

  public states: any[] = [];
  public municipalities: any[] = [];
  public locations: any[] = [];
  public genders: any[] = [];

  public totalRecords = 0;
  public currentPage = 1;
  public pageSize = 50;
  public totalPages = 0;

  public selectedLang: string;

  constructor(
    private archiveService: ArchiveService,
    private translate: TranslateService
  ) {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit(): void {
    // Cargar catálogos independientes
    this.archiveService.listStates().subscribe((res: any) => this.states = res);
    this.archiveService.listGenders().subscribe((res: any) => this.genders = res);
    this.loadArchives();
  }

  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  loadArchives(): void {
    const skip = (this.currentPage - 1) * this.pageSize;
    const filters = {
      archiveNumberSearch: this.archiveNumberSearch,
      nameSearch: this.nameSearch,
      selectedGender: this.selectedGender,
      selectedState: this.selectedState,
      selectedMunicipality: this.selectedMunicipality,
      selectedLocation: this.selectedLocation
    };

    this.archiveService.listArchivesWithFilters(filters, skip, this.pageSize).subscribe({
      next: (res: any) => {
        this.displayedArchives = res.data || [];
        this.totalRecords = res.total || 0;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
      },
      error: (err) => {
        console.error('Error al cargar archivos:', err);
        this.displayedArchives = [];
        this.totalRecords = 0;
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadArchives();
    }
  }

  get paginationRange(): (number | string)[] {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, this.currentPage - delta);
    const right = Math.min(this.totalPages - 1, this.currentPage + delta);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) {
      range.push(i);
    }
    if (right < this.totalPages - 1) range.push('...');
    if (this.totalPages > 1) range.push(this.totalPages);

    return range;
  }

  onStateChange(): void {
    this.selectedMunicipality = '';
    this.selectedLocation = '';
    this.municipalities = [];
    this.locations = [];

    if (this.selectedState) {
      this.archiveService.listMunicipalities(this.selectedState).subscribe((res: any) => {
        this.municipalities = res;
      });
    }

    this.changePage(1);
  }

  onMunicipalityChange(): void {
    this.selectedLocation = '';
    this.locations = [];

    if (this.selectedMunicipality) {
      this.archiveService.listLocations(this.selectedMunicipality).subscribe((res: any) => {
        this.locations = res;
      });
    }

    this.changePage(1);
  }

  selectArchive(archive: any): void {
    this.archive_selected = archive;
  }

  deleteArchive(): void {
    if (!this.archive_selected) return;
    this.archiveService.deleteArchive(this.archive_selected.archive_number).subscribe(() => {
      this.displayedArchives = this.displayedArchives.filter(a => a.archive_number !== this.archive_selected.archive_number);
      this.totalRecords--;
      this.archive_selected = null;
      this.loadArchives();
    });
  }
}
