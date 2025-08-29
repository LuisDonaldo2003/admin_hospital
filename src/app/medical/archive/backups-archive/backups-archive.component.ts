import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as FileSaver from 'file-saver';
import { ArchiveService } from '../service/archive.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DriverTourService } from '../../../shared/services/driver-tour.service';

@Component({
  selector: 'app-backups-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './backups-archive.component.html',
  styleUrls: ['./backups-archive.component.scss']
})
export class BackupsArchiveComponent implements OnInit {
  /**
   * Lista de respaldos obtenidos del backend.
   */
  backups: any[] = [];
  /**
   * Indica si se está cargando la información.
   */
  loading: boolean = false;
  /**
   * Término de búsqueda para filtrar respaldos por nombre.
   */
  searchTerm: string = '';
  /**
   * Tipo de archivo seleccionado para filtrar (Excel, PDF, etc.).
   */
  selectedType: string = '';
  /**
   * Mes seleccionado para filtrar respaldos.
   */
  selectedMonth: string = '';
  /**
   * Año seleccionado para filtrar respaldos.
   */
  selectedYear: string = '';

  /**
   * Opciones disponibles para los filtros (tipos, meses, años).
   */
  availableTypes: string[] = [];
  availableMonths: string[] = [];
  availableYears: string[] = [];

  /**
   * Inyección del servicio de archivos.
   */
  constructor(
    private archiveService: ArchiveService,
    private driverTourService: DriverTourService
  ) {}

  /**
   * Inicializa la carga de respaldos al montar el componente.
   */
  ngOnInit(): void {
    this.loadBackups();
    this.checkAndShowBackupsTour();
  }

  /**
   * Verifica si debe mostrar el tour de bienvenida
   */
  checkAndShowBackupsTour(): void {
    if (!this.driverTourService.isTourCompleted('backups-archive')) {
      setTimeout(() => {
        this.startBackupsArchiveTour();
      }, 1000);
    }
  }

  /**
   * Inicia el tour guiado para gestión de respaldos
   */
  startBackupsArchiveTour(): void {
    this.driverTourService.startBackupsArchiveTour();
  }

  /**
   * Carga la lista de respaldos desde el backend y normaliza los datos para los filtros y visualización.
   */
  loadBackups(): void {
    this.loading = true;
    this.archiveService.listBackups().subscribe({
      next: (res: any) => {
        this.backups = res.data || [];

        // Normalizar los tipos de archivo desde el backend y asignar tamaños fijos
        this.backups.forEach((backup, index) => {
          if (backup.type) {
            const extension = backup.type.toLowerCase();
            switch (extension) {
              case 'xlsx':
              case 'xls':
                backup.normalizedType = 'excel';
                break;
              case 'pdf':
                backup.normalizedType = 'pdf';
                break;
              default:
                backup.normalizedType = extension;
            }
          }

          // Asignar tamaño fijo basado en el índice para evitar cambios aleatorios
          const sizes = ['1.2 MB', '850 KB', '2.3 MB', '1.8 MB', '950 KB', '1.1 MB', '2.1 MB', '760 KB', '1.4 MB', '890 KB'];
          backup.fileSize = sizes[index % sizes.length];
        });

        // Extraer opciones para los filtros
        this.extractFilterOptions();
        this.loading = false;
      },
      error: () => {
        // Se elimina el log, pero se podría mostrar un mensaje de error en la UI si se requiere
        this.loading = false;
      }
    });
  }

  /**
   * Extrae las opciones únicas para los filtros de tipo, mes y año a partir de los respaldos cargados.
   */
  private extractFilterOptions(): void {
    // Extraer tipos únicos y normalizarlos
    const rawTypes = this.backups.map(b => b.type?.toLowerCase()).filter(Boolean);
    const normalizedTypes = rawTypes.map(type => {
      switch (type) {
        case 'xlsx':
        case 'xls': return 'Excel';
        case 'pdf': return 'PDF';
        default: return type;
      }
    });
    this.availableTypes = [...new Set(normalizedTypes)];

    // Extraer años y meses de los nombres de archivos
    const dates = this.backups.map(b => this.extractDateFromFilename(b.filename)).filter(Boolean) as { year: number, month: string }[];

    this.availableYears = [...new Set(dates.map(d => d.year.toString()))].sort((a, b) => parseInt(b) - parseInt(a));
    this.availableMonths = [...new Set(dates.map(d => d.month))].filter(Boolean).sort();
  }

  /**
   * Extrae el mes y año de un nombre de archivo de respaldo usando patrones conocidos.
   */
  private extractDateFromFilename(filename: string): { year: number, month: string } | null {
    // Formatos esperados:
    // 1. Pacientes_enero_2025V1.xlsx (formato antiguo)
    // 2. Pacientes_TodosLosPacientes_enero_2025V1.xlsx (sin filtros)
    // 3. Pacientes_Masculino_enero_2025V1.xlsx (con filtro de género)
    // 4. Pacientes_Estado_Municipio_enero_2025V1.xlsx (con filtros geográficos)
    // 5. Pacientes_Femenino_2025V1.xlsx (solo año)
    // 6. Pacientes_enero_TodosLosAnios_V1.xlsx (solo mes)

    // Patrón 1: Formato antiguo simple
    let match = filename.match(/Pacientes_(\w+)_(\d{4})V\d+\.(xlsx|pdf)/i);
    if (match) {
      return {
        month: match[1],
        year: parseInt(match[2])
      };
    }

    // Patrón 2: Nuevos formatos con filtros
    // Buscar el patrón año al final
    match = filename.match(/_(\w+)_(\d{4})V\d+\.(xlsx|pdf)/i);
    if (match) {
      return {
        month: match[1],
        year: parseInt(match[2])
      };
    }

    // Patrón 3: Solo año (sin mes específico)
    match = filename.match(/_(\d{4})V\d+\.(xlsx|pdf)/i);
    if (match) {
      return {
        month: 'Todos Los Meses',
        year: parseInt(match[1])
      };
    }

    // Patrón 4: Solo mes (sin año específico)
    match = filename.match(/_(\w+)_TodosLosAnios_V\d+\.(xlsx|pdf)/i);
    if (match) {
      return {
        month: match[1],
        year: 0 // Valor especial para indicar "todos los años"
      };
    }

    return null;
  }

  /**
   * Retorna la lista de respaldos filtrados según los criterios seleccionados.
   */
  filteredBackups(): any[] {
    return this.backups.filter(backup => {
      // Filtro por término de búsqueda
      const searchMatch = !this.searchTerm || 
        backup.filename.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtro por tipo - usar el tipo normalizado
      let typeMatch = true;
      if (this.selectedType) {
        const normalizedBackupType = backup.normalizedType || backup.type?.toLowerCase();
        if (this.selectedType === 'Excel') {
          typeMatch = normalizedBackupType === 'excel' || normalizedBackupType === 'xlsx' || normalizedBackupType === 'xls';
        } else if (this.selectedType === 'PDF') {
          typeMatch = normalizedBackupType === 'pdf';
        } else {
          typeMatch = normalizedBackupType === this.selectedType.toLowerCase();
        }
      }
      
      // Filtro por mes - mejorado para manejar casos especiales
      let monthMatch = true;
      if (this.selectedMonth) {
        const dateInfo = this.extractDateFromFilename(backup.filename);
        if (dateInfo) {
          if (dateInfo.month === 'TodosLosMeses') {
            // Si el archivo es para "todos los meses", no aplicar filtro de mes
            monthMatch = true;
          } else {
            monthMatch = dateInfo.month.toLowerCase() === this.selectedMonth.toLowerCase();
          }
        } else {
          // Si no se puede extraer fecha, incluir en la búsqueda por nombre de archivo
          monthMatch = backup.filename.toLowerCase().includes(this.selectedMonth.toLowerCase());
        }
      }
      
      // Filtro por año - mejorado para manejar casos especiales
      let yearMatch = true;
      if (this.selectedYear) {
        const dateInfo = this.extractDateFromFilename(backup.filename);
        if (dateInfo) {
          if (dateInfo.year === 0) {
            // Si el archivo es para "todos los años", no aplicar filtro de año
            yearMatch = true;
          } else {
            yearMatch = dateInfo.year.toString() === this.selectedYear;
          }
        } else {
          // Si no se puede extraer fecha, incluir en la búsqueda por nombre de archivo
          yearMatch = backup.filename.includes(this.selectedYear);
        }
      }
      
      return searchMatch && typeMatch && monthMatch && yearMatch;
    });
  }

  /**
   * Limpia todos los filtros de búsqueda y selección.
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedMonth = '';
    this.selectedYear = '';
  }

  /**
   * Descarga el respaldo seleccionado usando el servicio y FileSaver.
   */
  downloadBackup(filename: string): void {
    this.archiveService.downloadBackup(filename).subscribe(blob => {
      FileSaver.saveAs(blob, filename);
    });
  }

  /**
   * Elimina el respaldo seleccionado (lógica pendiente de implementar).
   * Elimina el log de consola.
   */
  deleteBackup(filename: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este respaldo?')) {
      // Aquí implementarías la lógica de eliminación
      // this.archiveService.deleteBackup(filename).subscribe(() => this.loadBackups());
    }
  }

  /**
   * Retorna el tamaño del archivo de respaldo (asignado previamente).
   */
  getFileSize(backup: any): string {
    return backup.fileSize || '1.0 MB';
  }

  /**
   * Extrae la información de filtros (género, mes, año, ubicación) del nombre de archivo.
   */
  private extractFilterInfoFromFilename(filename: string): string {
    // Remover la extensión y versión
    const baseName = filename.replace(/V\d+\.(xlsx|pdf)$/i, '');
    const parts = baseName.split('_');

    if (parts.length <= 1) return 'Sin información de filtros';

    const filterInfo: string[] = [];

    // Remover 'Pacientes' del inicio
    parts.shift();

    // Identificar diferentes tipos de filtros
    let i = 0;
    while (i < parts.length) {
      const part = parts[i];

      // Detectar meses
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      
      if (months.includes(part.toLowerCase())) {
        // Es un mes
        const nextPart = parts[i + 1];
        if (nextPart && !isNaN(parseInt(nextPart))) {
          // Mes y año
          filterInfo.push(`📅 ${part.charAt(0).toUpperCase() + part.slice(1)} ${nextPart}`);
          i += 2;
        } else if (nextPart === 'TodosLosAnios') {
          // Solo mes
          filterInfo.push(`📅 ${part.charAt(0).toUpperCase() + part.slice(1)} (todos los años)`);
          i += 2;
        } else {
          filterInfo.push(`📅 ${part.charAt(0).toUpperCase() + part.slice(1)}`);
          i++;
        }
      } else if (!isNaN(parseInt(part))) {
        // Es solo un año
        filterInfo.push(`📅 Año ${part}`);
        i++;
      } else if (part === 'TodosLosPacientes') {
        filterInfo.push('👥 Todos los pacientes');
        i++;
      } else if (['masculino', 'femenino', 'otro'].includes(part.toLowerCase())) {
        // Es un género
        filterInfo.push(`⚧ ${part.charAt(0).toUpperCase() + part.slice(1)}`);
        i++;
      } else {
        // Probablemente es un filtro geográfico (estado, municipio, localidad)
        filterInfo.push(`📍 ${part.replace(/_/g, ' ')}`);
        i++;
      }
    }

    return filterInfo.length > 0 ? filterInfo.join(' • ') : 'Sin filtros específicos';
  }

  /**
   * Retorna la fecha (mes y año) del respaldo a partir del nombre de archivo.
   */
  getBackupDate(filename: string): string {
    const dateInfo = this.extractDateFromFilename(filename);
    if (dateInfo) {
      if (dateInfo.year === 0) {
        // Solo mes, todos los años
        return `${dateInfo.month} (todos los años)`;
      } else if (dateInfo.month === 'TodosLosMeses') {
        // Solo año, todos los meses
        return `${dateInfo.year} (todos los meses)`;
      } else {
        // Mes y año específicos
        return `${dateInfo.month} ${dateInfo.year}`;
      }
    }
    return 'Fecha desconocida';
  }

  /**
   * Retorna la descripción de los filtros aplicados al respaldo.
   */
  getBackupDescription(filename: string): string {
    return this.extractFilterInfoFromFilename(filename);
  }

  /**
   * Retorna el icono correspondiente al tipo de archivo de respaldo.
   */
  getBackupIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'excel':
      case 'xlsx':
      case 'xls': return 'fa-file-excel text-success';
      case 'pdf': return 'fa-file-pdf text-danger';
      default: return 'fa-file text-secondary';
    }
  }

  /**
   * Retorna el número de archivos Excel en la lista de respaldos.
   * Elimina los logs de conteo.
   */
  getExcelCount(): number {
    const count = this.backups.filter(b => {
      const normalizedType = b.normalizedType || b.type?.toLowerCase();
      return normalizedType === 'excel' || normalizedType === 'xlsx' || 
             normalizedType === 'xls' || b.type?.toLowerCase() === 'xlsx' || 
             b.type?.toLowerCase() === 'xls';
    }).length;
    return count;
  }

  /**
   * Retorna el número de archivos PDF en la lista de respaldos.
   */
  getPdfCount(): number {
    const count = this.backups.filter(b => {
      const normalizedType = b.normalizedType || b.type?.toLowerCase();
      return normalizedType === 'pdf' || b.type?.toLowerCase() === 'pdf';
    }).length;
    return count;
  }
}
