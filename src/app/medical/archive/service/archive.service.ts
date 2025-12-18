// Importaciones necesarias para el servicio de archivos
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

// Servicio para gestionar operaciones relacionadas con archivos/pacientes
@Injectable({
  providedIn: 'root'
})
export class ArchiveService {
  /**
   * Constructor: inyecta HttpClient y AuthService
   */
  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  /**
   * Obtiene los headers de autorización para las peticiones HTTP
   */
  private getHeaders() {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  /**
   * Obtiene la lista completa de archivos/pacientes
   */
  listArchives() {
    const URL = `${URL_SERVICIOS}/archives`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Verifica si un número de expediente es único
   */
  checkUniqueArchiveNumber(archiveNumber: string) {
    return this.http.get(`${URL_SERVICIOS}/archives/check-unique?archive_number=${archiveNumber}`, { headers: this.getHeaders() });
  }

  /**
   * Obtiene la lista de archivos filtrados por los parámetros recibidos y paginados
   */
  listArchivesWithFilters(filters: any, skip: number, limit: number, sortDir: string = 'asc') {
    const queryParams = new URLSearchParams();
    queryParams.append('sort_dir', sortDir);
    // Solo agregar parámetros que tengan valor para evitar consultas innecesarias
    if (filters.archiveNumberSearch?.trim()) {
      queryParams.append('archive_number', filters.archiveNumberSearch.trim());
    }
    if (filters.nameSearch?.trim()) {
      queryParams.append('name', filters.nameSearch.trim());
    }
    if (filters.selectedGender) {
      queryParams.append('gender_id', filters.selectedGender);
    }
    // Filtros de ubicación usando campos de texto
    if (filters.stateTextFilter?.trim()) {
      queryParams.append('state_text', filters.stateTextFilter.trim());
    }
    if (filters.municipalityTextFilter?.trim()) {
      queryParams.append('municipality_text', filters.municipalityTextFilter.trim());
    }
    if (filters.locationTextFilter?.trim()) {
      queryParams.append('location_text', filters.locationTextFilter.trim());
    }
    // Filtros de fecha avanzados
    if (filters.dateFilterType) {
      queryParams.append('date_filter_type', filters.dateFilterType);
      switch (filters.dateFilterType) {
        case 'year':
          if (filters.specificYear) {
            queryParams.append('filter_year', filters.specificYear);
          }
          break;
        case 'month':
          if (filters.specificYear && filters.specificMonth) {
            queryParams.append('filter_year', filters.specificYear);
            queryParams.append('filter_month', filters.specificMonth);
          } else if (filters.specificMonth) {
            queryParams.append('filter_month', filters.specificMonth);
          }
          break;
        case 'day':
          if (filters.specificYear && filters.specificMonth && filters.specificDay) {
            queryParams.append('filter_year', filters.specificYear);
            queryParams.append('filter_month', filters.specificMonth);
            queryParams.append('filter_day', filters.specificDay.toString().padStart(2, '0'));
          }
          break;
        case 'range':
          if (filters.dateFrom) {
            queryParams.append('date_from', filters.dateFrom);
          }
          if (filters.dateTo) {
            queryParams.append('date_to', filters.dateTo);
          }
          break;
      }
    }
    // Parámetros de paginación
    queryParams.append('skip', skip.toString());
    queryParams.append('limit', limit.toString());

    // Parámetro para búsqueda case-insensitive
    queryParams.append('case_insensitive', 'true');

    const URL = `${URL_SERVICIOS}/archives?${queryParams.toString()}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  // Búsqueda global optimizada (busca en todos los campos de texto)
  /**
   * Búsqueda global optimizada (busca en todos los campos de texto)
   */
  searchArchivesGlobal(searchTerm: string, skip: number, limit: number) {
    const queryParams = new URLSearchParams();
    if (searchTerm?.trim()) {
      queryParams.append('global_search', searchTerm.trim());
    }
    queryParams.append('skip', skip.toString());
    queryParams.append('limit', limit.toString());
    const URL = `${URL_SERVICIOS}/archives/search?${queryParams.toString()}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }


  /**
   * Obtiene la lista paginada de archivos
   */
  listArchivesPaginated(skip: number, limit: number) {
    const URL = `${URL_SERVICIOS}/archives?skip=${skip}&limit=${limit}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todos los archivos sin paginación
   */
  getAllArchives() {
    const URL = `${URL_SERVICIOS}/archives?all=true`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene los datos de un archivo/paciente específico
   */
  showArchive(archiveId: string | number) {
    const URL = `${URL_SERVICIOS}/archives/${archiveId}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Registra un nuevo archivo/paciente
   */
  registerArchive(data: any) {
    const URL = `${URL_SERVICIOS}/archives`;
    return this.http.post(URL, data, { headers: this.getHeaders() });
  }

  /**
   * Actualiza los datos de un archivo/paciente existente
   */
  updateArchive(archiveId: string | number, data: any) {
    const URL = `${URL_SERVICIOS}/archives/${archiveId}`;
    return this.http.put(URL, data, { headers: this.getHeaders() });
  }

  /**
   * Elimina un archivo/paciente por su ID
   */
  deleteArchive(archiveId: string | number) {
    const URL = `${URL_SERVICIOS}/archives/${archiveId}`;
    return this.http.delete(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene la configuración del módulo de archivos
   */
  listConfig() {
    const URL = `${URL_SERVICIOS}/archives/config`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  // Catálogos dinámicos
  /**
   * Obtiene el catálogo de géneros
   */
  listGenders() {
    const URL = `${URL_SERVICIOS}/genders`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene el catálogo de estados
   */
  listStates() {
    const URL = `${URL_SERVICIOS}/states`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene el catálogo de municipios filtrado por estado
   */
  listMunicipalities(stateId?: string | number) {
    let URL = `${URL_SERVICIOS}/municipalities`;
    if (stateId) {
      URL += `?state_id=${stateId}`;
    }
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene el catálogo de localidades filtrado por municipio
   */
  listLocations(municipalityId?: string | number) {
    let URL = `${URL_SERVICIOS}/locations`;
    if (municipalityId) {
      URL += `?municipality_id=${municipalityId}`;
    }
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene estadísticas para el dashboard de archivo
   */
  getArchiveStats() {
    const URL = `${URL_SERVICIOS}/archives/stats`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene el siguiente número de expediente disponible y huecos sugeridos
   */
  getNextNumber() {
    const URL = `${URL_SERVICIOS}/archives/next-number`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Sube un respaldo de archivos
   */
  uploadBackup(formData: FormData) {
    const URL = `${URL_SERVICIOS}/archives/backup/upload`;
    return this.http.post(URL, formData, { headers: this.getHeaders() });
  }

  /**
   * Obtiene la lista de respaldos disponibles
   */
  listBackups() {
    const URL = `${URL_SERVICIOS}/archives/backup/list`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Descarga un respaldo por nombre de archivo
   */
  downloadBackup(filename: string) {
    const URL = `${URL_SERVICIOS}/archives/backup/download/${filename}`;
    return this.http.get(URL, { headers: this.getHeaders(), responseType: 'blob' });
  }
}