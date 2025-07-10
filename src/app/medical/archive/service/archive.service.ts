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

  if (filters.archiveNumberSearch) queryParams.append('archive_number', filters.archiveNumberSearch);
  
  const name = (filters.nameSearch || '').trim();
  if (name) queryParams.append('name', name);  // ← solo si no está vacío

  if (filters.selectedGender) queryParams.append('gender_id', filters.selectedGender);
  if (filters.selectedState) queryParams.append('state_id', filters.selectedState);
  if (filters.selectedMunicipality) queryParams.append('municipality_id', filters.selectedMunicipality);
  if (filters.selectedLocation) queryParams.append('location_id', filters.selectedLocation);

  queryParams.append('skip', skip.toString());
  queryParams.append('limit', limit.toString());

  const URL = `${URL_SERVICIOS}/archives?${queryParams.toString()}`;
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
