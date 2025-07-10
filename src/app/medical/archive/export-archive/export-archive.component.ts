import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArchiveService } from '../service/archive.service';

@Component({
  selector: 'app-export-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './export-archive.component.html',
  styleUrls: ['./export-archive.component.scss']
})
export class ExportArchiveComponent implements OnInit {
  archives: any[] = [];
  backups: any[] = [];

  states: any[] = [];
  municipalities: any[] = [];
  locations: any[] = [];

  selectedState: string = '';
  selectedMunicipality: string = '';
  selectedLocation: string = '';

  loading: boolean = false; 

  constructor(
    private archiveService: ArchiveService,
    private translate: TranslateService
  ) {
    const lang = localStorage.getItem('language') || 'en';
    this.translate.use(lang);
  }

  ngOnInit(): void {
    this.loadArchives();
    this.loadBackups();
  }

  loadArchives(): void {
    this.loading = true;
    this.archiveService.getAllArchives().subscribe({
      next: (res: any) => {
        this.archives = Array.isArray(res.data) ? res.data : [];

        // Estados únicos
        this.states = [...new Map(
          this.archives
            .filter(a => a.location?.municipality?.state?.id)
            .map(a => [a.location.municipality.state.id, a.location.municipality.state])
        ).values()];

        this.loading = false;
      },
      error: err => {
        console.error('Error loading archives:', err);
        this.loading = false;
      }
    });
  }

  loadBackups(): void {
    this.archiveService.listBackups().subscribe({
      next: (res: any) => this.backups = res.data,
      error: err => console.error('Error cargando respaldos:', err)
    });
  }

  onStateChange(): void {
    this.selectedMunicipality = '';
    this.selectedLocation = '';
    this.municipalities = this.archives
      .filter(a => a.location?.municipality?.state?.id == this.selectedState)
      .map(a => a.location?.municipality)
      .filter((v, i, arr) => v && arr.findIndex(t => t.id === v.id) === i);
  }

  onMunicipalityChange(): void {
    this.selectedLocation = '';
    this.locations = this.archives
      .filter(a => a.location?.municipality?.id == this.selectedMunicipality)
      .map(a => a.location)
      .filter((v, i, arr) => v && arr.findIndex(t => t.id === v.id) === i);
  }

  filteredArchives(): any[] {
    return this.archives.filter(a =>
      (!this.selectedState || a.location?.municipality?.state?.id == this.selectedState) &&
      (!this.selectedMunicipality || a.location?.municipality?.id == this.selectedMunicipality) &&
      (!this.selectedLocation || a.location?.id == this.selectedLocation)
    );
  }

  exportToExcel(): void {
    const exportData = this.filteredArchives().map((a: any) => ({
      'No.': a.archive_number,
      'Nombre': `${a.name} ${a.last_name_father ?? ''} ${a.last_name_mother ?? ''}`,
      'Edad': a.age,
      'Género': a.gender?.name ?? 'N/A',
      'Dirección': a.address ?? 'N/A',
      'Localidad': a.location?.name ?? 'N/A',
      'Municipio': a.location?.municipality?.name ?? 'N/A',
      'Estado': a.location?.municipality?.state?.name ?? 'N/A',
      'Fecha de ingreso': a.admission_date ?? 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = { Sheets: { 'Pacientes': worksheet }, SheetNames: ['Pacientes'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const filename = this.getBackupFilename('excel');
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, filename);

    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('type', 'excel');

    this.archiveService.uploadBackup(formData).subscribe({
      next: () => {
        console.log('Respaldo enviado al backend');
        this.loadBackups(); // Recarga la lista de respaldos
      },
      error: err => console.error('Error enviando respaldo:', err)
    });
  }

  exportToPDF(): void {
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text('Lista de Pacientes', 14, 20);

    const exportData = this.filteredArchives().map((a: any, index: number) => [
      index + 1,
      `${a.name ?? ''} ${a.last_name_father ?? ''} ${a.last_name_mother ?? ''}`,
      a.age ?? 'N/A',
      a.gender?.name ?? 'N/A',
      a.address ?? 'N/A',
      a.location?.name ?? 'N/A',
      a.location?.municipality?.name ?? 'N/A',
      a.location?.municipality?.state?.name ?? 'N/A',
      a.admission_date ?? 'N/A'
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['#', 'Nombre', 'Edad', 'Género', 'Dirección', 'Localidad', 'Municipio', 'Estado', 'Fecha de ingreso']],
      body: exportData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    const filename = this.getBackupFilename('pdf');
    const pdfBlob = doc.output('blob');
    FileSaver.saveAs(pdfBlob, filename);

    const formData = new FormData();
    formData.append('file', pdfBlob, filename);
    formData.append('type', 'pdf');

    this.archiveService.uploadBackup(formData).subscribe({
      next: () => {
        console.log('Respaldo PDF enviado al backend');
        this.loadBackups(); // Recarga la lista de respaldos
      },
      error: err => console.error('Error enviando respaldo PDF:', err)
    });
  }

  downloadBackup(filename: string): void {
    this.archiveService.downloadBackup(filename).subscribe(blob => {
      FileSaver.saveAs(blob, filename);
    });
  }

  getBackupFilename(type: 'excel' | 'pdf'): string {
    const now = new Date();
    const month = now.toLocaleString('es-MX', { month: 'long' });
    const year = now.getFullYear();
    // Filtra los respaldos existentes de este mes, año y tipo
    const regex = new RegExp(`Pacientes_${month}_${year}V(\\d+)\\.${type === 'excel' ? 'xlsx' : 'pdf'}`, 'i');
    const currentBackups = this.backups.filter(b => regex.test(b.filename));
    const version = currentBackups.length + 1;
    return `Pacientes_${month}_${year}V${version}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
  }
}
