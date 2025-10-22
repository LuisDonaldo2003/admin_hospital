// Importación de módulos y servicios necesarios para el componente de listado de personal
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PersonalService, Personal, ApiResponse } from '../service/personal.service';

/**
 * Componente para listar el personal del hospital con paginación, búsqueda y acciones.
 */
@Component({
  selector: 'app-personal-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './personal-list.component.html',
  styleUrls: ['./personal-list.component.scss']
})
export class PersonalListComponent implements OnInit {
  /**
   * Lista de personal mostrado en la tabla
   */
  public personalList: Personal[] = [];

  /**
   * Valor actual del campo de búsqueda
   */
  public searchDataValue = '';
  /**
   * Cantidad de registros por página
   */
  public pageSize = 10;
  /**
   * Total de registros disponibles
   */
  public totalData = 0;
  /**
   * Índice de inicio para paginación
   */
  public skip = 0;
  /**
   * Límite de registros para la consulta
   */
  public limit: number = this.pageSize;
  /**
   * Página actual en la paginación
   */
  public currentPage = 1;
  /**
   * Índice de la página actual
   */
  public pageIndex = 0;
  /**
   * Array de números de página para la navegación
   */
  public pageNumberArray: number[] = [];
  /**
   * Array de números de serie para mostrar información de registros
   */
  public serialNumberArray: number[] = [];

  /**
   * Filtros adicionales
   */
  public filtroTipo = '';
  public filtroDocumentos = '';
  public filtroActivo = 'true'; // Por defecto solo activos

  /**
   * Personal seleccionado para eliminar
   */
  public personal_selected: Personal | null = null;

  /**
   * Estado de carga
   */
  public loading = false;

  /**
   * Documentos del personal seleccionado
   */
  public selectedPersonalDocuments: any[] = [];
  public selectedPersonalName = '';

  /**
   * Estadísticas
   */
  public stats = {
    total: 0,
    clinico: 0,
    no_clinico: 0,
    documentos_completos: 0
  };

  constructor(
    private router: Router,
    private translate: TranslateService,
    private personalService: PersonalService
  ) { 
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    this.getTableData();
    this.getEstadisticas();
  }

  /**
   * Obtener datos de la tabla desde el servidor
   */
  public getTableData(): void {
    this.loading = true;
    
    const params = {
      skip: this.skip,
      limit: this.limit,
      search: this.searchDataValue || '',
      tipo: this.filtroTipo || '',
      documentos: this.filtroDocumentos || '',
      activo: this.filtroActivo !== '' ? this.filtroActivo : undefined
    };

    this.personalService.listPersonal(params).subscribe({
      next: (response: ApiResponse<Personal[]>) => {
        this.loading = false;
        if (response.success) {
          this.personalList = response.data;
          // Usar el total del backend en lugar del length local
          this.totalData = response.total || response.data.length;
          this.calculateTotalPages(this.totalData, this.pageSize);
        } else {
          console.error('Error al obtener personal:', response.message);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al obtener personal:', error);
      }
    });
  }

  /**
   * Obtener estadísticas del personal
   */
  public getEstadisticas(): void {
    this.personalService.getEstadisticas().subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Error al obtener estadísticas:', error);
      }
    });
  }

  /**
   * Filtrar datos cuando cambian los filtros
   */
  public filterData(): void {
    this.currentPage = 1;
    this.pageIndex = 0;
    this.skip = 0;
    this.limit = this.pageSize;
    this.getTableData();
  }

  /**
   * Buscar datos cuando cambia el término de búsqueda
   */
  public searchData(value: string): void {
    this.searchDataValue = value;
    this.filterData();
  }

  /**
   * Obtener más datos para navegación de páginas
   */
  public getMoreData(event: string): void {
    if (event === 'next') {
      this.currentPage++;
      this.pageIndex = this.currentPage - 1;
      this.skip = (this.currentPage - 1) * this.pageSize;
      this.limit = this.pageSize;
      this.getTableData();
    } else if (event === 'previous') {
      this.currentPage--;
      this.pageIndex = this.currentPage - 1;
      this.skip = (this.currentPage - 1) * this.pageSize;
      this.limit = this.pageSize;
      this.getTableData();
    }
  }

  /**
   * Navegar a una página específica
   */
  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.pageIndex = pageNumber - 1;
    this.skip = (pageNumber - 1) * this.pageSize;
    this.limit = this.pageSize;
    this.getTableData();
  }

  /**
   * Calcular páginas totales y generar array de números de página
   */
  private calculateTotalPages(totalData: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalData = totalData;
    const totalPages = Math.ceil(totalData / pageSize);
    
    for (let i = 1; i <= totalPages; i++) {
      this.pageNumberArray.push(i);
    }
    
    this.calculateSerialNumber();
  }

  /**
   * Calcular números de serie para información de registros
   */
  private calculateSerialNumber(): void {
    this.serialNumberArray = [];
    const startingSerialNumber = (this.currentPage - 1) * this.pageSize + 1;
    const endingSerialNumber = Math.min(this.currentPage * this.pageSize, this.totalData);
    
    for (let i = startingSerialNumber; i <= endingSerialNumber; i++) {
      this.serialNumberArray.push(i);
    }
  }

  /**
   * Seleccionar personal para eliminar
   */
  public selectPersonal(personal: Personal): void {
    this.personal_selected = personal;
  }

  /**
   * Eliminar personal seleccionado
   */
  public deletePersonal(): void {
    if (this.personal_selected?.id) {
      this.personalService.deletePersonal(this.personal_selected.id).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            // Optimización: actualizar localmente en lugar de recargar todo
            this.personalList = this.personalList.filter(p => p.id !== this.personal_selected?.id);
            this.totalData--;
            this.personal_selected = null;
            
            // Verificar si necesitamos ajustar la página actual
            const totalPages = Math.ceil(this.totalData / this.pageSize);
            if (this.currentPage > totalPages && totalPages > 0) {
              this.currentPage = totalPages;
              this.pageIndex = this.currentPage - 1;
              this.skip = (this.currentPage - 1) * this.pageSize;
              this.getTableData();
            } else if (this.personalList.length === 0 && this.totalData > 0) {
              // Si la página actual queda vacía pero hay más datos
              this.getTableData();
            } else {
              // Recalcular la paginación con los nuevos datos
              this.calculateTotalPages(this.totalData, this.pageSize);
            }
            
            // Solo recargar estadísticas
            this.getEstadisticas();
            
            console.log('Personal eliminado exitosamente');
          } else {
            console.error('Error al eliminar personal:', response.message);
          }
        },
        error: (error) => {
          console.error('Error al eliminar personal:', error);
        }
      });
    }
  }

  /**
   * Ver documentos del personal
   */
  public verDocumentos(personalId: number | undefined): void {
    if (!personalId) return;
    
    const personal = this.personalList.find(p => p.id === personalId);
    if (personal) {
      this.selectedPersonalName = `${personal.nombre} ${personal.apellidos}`;
      
      this.personalService.getDocumentos(personalId).subscribe({
        next: (response: ApiResponse<any[]>) => {
          if (response.success) {
            this.selectedPersonalDocuments = response.data;
            // Mostrar modal de documentos
            const modalElement = document.getElementById('documentsModal');
            if (modalElement) {
              const bootstrap = (window as any).bootstrap;
              if (bootstrap) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
              }
            }
          } else {
            console.error('Error al obtener documentos:', response.message);
          }
        },
        error: (error) => {
          console.error('Error al obtener documentos:', error);
        }
      });
    }
  }

  /**
   * Descargar documento
   */
  public downloadDocument(documentId: number | undefined): void {
    if (!documentId) return;
    
    // Buscar el documento en la lista para obtener su información
    const documento = this.selectedPersonalDocuments.find(doc => doc.id === documentId);
    let fileName = `documento_${documentId}.pdf`; // Nombre por defecto
    
    if (documento) {
      // Crear un nombre más descriptivo
      const tipoDocumento = documento.tipo_documento;
      const nombrePersona = this.selectedPersonalName.trim();
      const extension = documento.nombre_archivo.split('.').pop() || 'pdf';
      
      // Limpiar caracteres especiales para el nombre del archivo
      const cleanTipoDocumento = tipoDocumento
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_');
        
      const cleanNombrePersona = nombrePersona
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      
      fileName = `${cleanNombrePersona}_${cleanTipoDocumento}.${extension}`;
    }
    
    this.personalService.downloadDocument(documentId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar documento:', error);
      }
    });
  }

  /**
   * Cambiar estado activo/inactivo del personal
   */
  public toggleEstado(personal: Personal): void {
    if (personal.id) {
      const nuevoEstado = !personal.activo;
      this.personalService.updatePersonal(personal.id, { activo: nuevoEstado }).subscribe({
        next: (response: ApiResponse<Personal>) => {
          if (response.success) {
            personal.activo = nuevoEstado;
            console.log(`Personal ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
          } else {
            console.error('Error al cambiar estado:', response.message);
          }
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
        }
      });
    }
  }

  /**
   * Navegar a agregar personal
   */
  public agregarPersonal(): void {
  this.router.navigate(['/personal/add']);
  }

  /**
   * Navegar a editar personal
   */
  public editarPersonal(id: number | undefined): void {
  if (!id) return;
  this.router.navigate(['/personal/edit', id]);
  }
}
