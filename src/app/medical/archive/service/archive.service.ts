import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ArchiveService {
  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) {}

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  listArchives() {
    const URL = `${URL_SERVICIOS}/archives`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  listArchivesWithFilters(filters: any, skip: number, limit: number) {
    const queryParams = new URLSearchParams();

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
    
    if (filters.selectedState) {
      queryParams.append('state_id', filters.selectedState);
    }
    
    if (filters.selectedMunicipality) {
      queryParams.append('municipality_id', filters.selectedMunicipality);
    }
    
    if (filters.selectedLocation) {
      queryParams.append('location_id', filters.selectedLocation);
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

    const URL = `${URL_SERVICIOS}/archives?${queryParams.toString()}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  // Búsqueda global optimizada (busca en todos los campos de texto)
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


  listArchivesPaginated(skip: number, limit: number) {
    const URL = `${URL_SERVICIOS}/archives?skip=${skip}&limit=${limit}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  getAllArchives() {
    const URL = `${URL_SERVICIOS}/archives?all=true`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  showArchive(archiveId: string | number) {
    const URL = `${URL_SERVICIOS}/archives/${archiveId}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  registerArchive(data: any) {
    const URL = `${URL_SERVICIOS}/archives`;
    return this.http.post(URL, data, { headers: this.getHeaders() });
  }

  updateArchive(archiveId: string | number, data: any) {
    const URL = `${URL_SERVICIOS}/archives/${archiveId}`;
    return this.http.put(URL, data, { headers: this.getHeaders() });
  }

  deleteArchive(archiveId: string | number) {
    const URL = `${URL_SERVICIOS}/archives/${archiveId}`;
    return this.http.delete(URL, { headers: this.getHeaders() });
  }

  listConfig() {
    const URL = `${URL_SERVICIOS}/archives/config`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  // ✅ Catálogos dinámicos
  listGenders() {
    const URL = `${URL_SERVICIOS}/genders`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  listStates() {
    const URL = `${URL_SERVICIOS}/states`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  listMunicipalities(stateId: string | number) {
    const URL = `${URL_SERVICIOS}/municipalities?state_id=${stateId}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  listLocations(municipalityId: string | number) {
    const URL = `${URL_SERVICIOS}/locations?municipality_id=${municipalityId}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  searchLocationsByName(searchTerm: string) {
    const URL = `${URL_SERVICIOS}/locations/search?search=${encodeURIComponent(searchTerm)}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  uploadBackup(formData: FormData) {
    const URL = `${URL_SERVICIOS}/archives/backup/upload`;
    return this.http.post(URL, formData, { headers: this.getHeaders() });
  }

  listBackups() {
    const URL = `${URL_SERVICIOS}/archives/backup/list`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  downloadBackup(filename: string) {
    const URL = `${URL_SERVICIOS}/archives/backup/download/${filename}`;
    return this.http.get(URL, { headers: this.getHeaders(), responseType: 'blob' });
  }
}