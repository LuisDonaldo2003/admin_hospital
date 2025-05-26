import { Component, OnInit } from '@angular/core';
import { ArchiveService } from '../service/archive.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-list-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './list-archive.component.html',
  styleUrls: ['./list-archive.component.scss']
})
export class ListArchiveComponent implements OnInit {
  public archives: any[] = [];
  public archive_selected: any;

  public archiveNumberSearch = '';
  public nameSearch = '';
  public selectedGender = '';

  public states: any[] = [];
  public municipalities: any[] = [];
  public locations: any[] = [];
  public genders: any[] = [];

  public selectedState: string = '';
  public selectedMunicipality: string = '';
  public selectedLocation: string = '';

  public totalRecords = 0;

  constructor(private archiveService: ArchiveService) {}

  ngOnInit(): void {
    this.loadArchives();
  }

  loadArchives(): void {
    this.archiveService.listArchives().subscribe({
      next: (res: any) => {
        this.archives = Array.isArray(res.data) ? res.data : [];
        this.totalRecords = res.total || 0;


        this.states = [...new Map(
          this.archives
            .filter(a => a.location?.municipality?.state?.id !== undefined)
            .map(a => [a.location.municipality.state.id, a.location.municipality.state] as [number, any])
        ).values()];

        this.genders = [...new Map(
          this.archives
            .filter(a => a.gender?.id !== undefined)
            .map(a => [a.gender.id, a.gender] as [number, any])
        ).values()];
      },
      error: (err) => console.error('Error al cargar archivos:', err)
    });
  }

  onStateChange(): void {
    this.selectedMunicipality = '';
    this.selectedLocation = '';

    this.municipalities = this.archives
      .filter(a => a.location?.municipality?.state?.id == this.selectedState)
      .map(a => a.location?.municipality)
      .filter((v, i, a) => v && a.findIndex(t => t.id === v.id) === i);
  }

  onMunicipalityChange(): void {
    this.selectedLocation = '';

    this.locations = this.archives
      .filter(a => a.location?.municipality?.id == this.selectedMunicipality)
      .map(a => a.location)
      .filter((v, i, a) => v && a.findIndex(t => t.id === v.id) === i);
  }

  filteredArchives(): any[] {
    return this.archives.filter(a =>
      (!this.archiveNumberSearch || a.archive_number?.toString().includes(this.archiveNumberSearch)) &&
      (!this.nameSearch || `${a.name ?? ''} ${a.last_name_father ?? ''} ${a.last_name_mother ?? ''}`.toLowerCase().includes(this.nameSearch.toLowerCase())) &&
      (!this.selectedGender || a.gender?.id == this.selectedGender) &&
      (!this.selectedState || a.location?.municipality?.state?.id == this.selectedState) &&
      (!this.selectedMunicipality || a.location?.municipality?.id == this.selectedMunicipality) &&
      (!this.selectedLocation || a.location?.id == this.selectedLocation)
    );
  }

  selectArchive(archive: any): void {
    this.archive_selected = archive;
  }

  deleteArchive(): void {
    if (!this.archive_selected) return;
    this.archiveService.deleteArchive(this.archive_selected.archive_number).subscribe(() => {
      this.archives = this.archives.filter(a => a.archive_number !== this.archive_selected.archive_number);
      this.totalRecords = this.archives.length;
      this.archive_selected = null;
    });
  }
}
