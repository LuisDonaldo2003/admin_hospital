import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  Teaching,
  Evaluacion,
  Modalidad,
  Participacion,
  ApiResponse,
  PaginatedResponse,
  TeachingStats,
  EvaluacionStats,
  TeachingFilters
} from '../models/teaching.interface';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TeachingService {
  private apiUrl = `${URL_SERVICIOS}/teachings`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtiene los headers de autorización para las peticiones HTTP
   */
  private getHeaders() {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  // ==================== CRUD de Teaching ====================

  /**
   * Obtener listado paginado de enseñanzas
   */
  getTeachings(
    page: number = 1,
    perPage: number = 10,
    filters?: TeachingFilters
  ): Observable<PaginatedResponse<Teaching>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.especialidad) params = params.set('especialidad', filters.especialidad);
      if (filters.area) params = params.set('area', filters.area);
      if (filters.modalidad_id) params = params.set('modalidad_id', filters.modalidad_id.toString());
      if (filters.participacion_id) params = params.set('participacion_id', filters.participacion_id.toString());
      if (filters.nombre_evento) params = params.set('nombre_evento', filters.nombre_evento);
      if (filters.sort_direction) params = params.set('sort_direction', filters.sort_direction);
    }

    return this.http.get<PaginatedResponse<Teaching>>(this.apiUrl, { params, headers: this.getHeaders() });
  }

  /**
   * Obtener un registro de enseñanza por ID
   */
  getTeaching(id: number): Observable<ApiResponse<Teaching>> {
    return this.http.get<ApiResponse<Teaching>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Crear nuevo registro de enseñanza
   */
  createTeaching(teaching: Teaching): Observable<ApiResponse<Teaching>> {
    return this.http.post<ApiResponse<Teaching>>(this.apiUrl, teaching, { headers: this.getHeaders() });
  }

  /**
   * Actualizar registro de enseñanza
   */
  updateTeaching(id: number, teaching: Teaching): Observable<ApiResponse<Teaching>> {
    return this.http.put<ApiResponse<Teaching>>(`${this.apiUrl}/${id}`, teaching, { headers: this.getHeaders() });
  }

  /**
   * Eliminar registro de enseñanza
   */
  deleteTeaching(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ==================== Estadísticas ====================

  /**
   * Obtener estadísticas generales
   */
  getStats(): Observable<ApiResponse<TeachingStats>> {
    return this.http.get<ApiResponse<TeachingStats>>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }

  // ==================== Evaluaciones ====================

  /**
   * Obtener evaluaciones pendientes
   */
  getEvaluacionesPendientes(): Observable<PaginatedResponse<Evaluacion>> {
    return this.http.get<PaginatedResponse<Evaluacion>>(`${this.apiUrl}/evaluaciones/pendientes`, { headers: this.getHeaders() });
  }

  /**
   * Obtener todas las evaluaciones
   */
  getEvaluaciones(page: number = 1, perPage: number = 10): Observable<PaginatedResponse<Evaluacion>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedResponse<Evaluacion>>(`${this.apiUrl}/evaluaciones`, { params, headers: this.getHeaders() });
  }

  /**
   * Obtener una evaluación por ID
   */
  getEvaluacion(id: number): Observable<ApiResponse<Evaluacion>> {
    return this.http.get<ApiResponse<Evaluacion>>(`${this.apiUrl}/evaluaciones/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Obtener estadísticas de evaluaciones
   */
  getEvaluacionesStats(): Observable<ApiResponse<EvaluacionStats>> {
    return this.http.get<ApiResponse<EvaluacionStats>>(`${this.apiUrl}/evaluaciones/stats`, { headers: this.getHeaders() });
  }

  /**
   * Crear evaluación
   */
  createEvaluacion(evaluacion: Evaluacion): Observable<ApiResponse<Evaluacion>> {
    return this.http.post<ApiResponse<Evaluacion>>(`${this.apiUrl}/evaluaciones`, evaluacion, { headers: this.getHeaders() });
  }

  /**
   * Actualizar evaluación
   */
  updateEvaluacion(id: number, evaluacion: Evaluacion): Observable<ApiResponse<Evaluacion>> {
    return this.http.put<ApiResponse<Evaluacion>>(`${this.apiUrl}/evaluaciones/${id}`, evaluacion, { headers: this.getHeaders() });
  }

  /**
   * Eliminar evaluación
   */
  deleteEvaluacion(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/evaluaciones/${id}`, { headers: this.getHeaders() });
  }

  // ==================== Catálogos ====================

  /**
   * Obtener catálogo de modalidades desde API
   */
  getModalidades(): Observable<ApiResponse<Modalidad[]>> {
    return this.http.get<ApiResponse<Modalidad[]>>(`${this.apiUrl}/modalidades`, { headers: this.getHeaders() });
  }

  /**
   * Obtener catálogo de participaciones desde API
   */
  getParticipaciones(): Observable<ApiResponse<Participacion[]>> {
    return this.http.get<ApiResponse<Participacion[]>>(`${this.apiUrl}/participaciones`, { headers: this.getHeaders() });
  }

  /**
   * Obtener catálogo de profesiones desde API
   */
  getProfesiones(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/profesiones`, { headers: this.getHeaders() });
  }

  /**
   * Obtener catálogo de áreas desde API
   */
  getAreas(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/areas`, { headers: this.getHeaders() });
  }

  // ==================== Exportación ====================

  /**
   * Exportar a Excel - Configurado correctamente para evitar archivos corruptos
   */
  exportToExcel(filters?: TeachingFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.especialidad) params = params.set('especialidad', filters.especialidad);
      if (filters.area) params = params.set('area', filters.area);
      if (filters.modalidad_id) params = params.set('modalidad_id', filters.modalidad_id.toString());
      if (filters.participacion_id) params = params.set('participacion_id', filters.participacion_id.toString());
    }

    // Headers específicos para descarga de archivos Excel
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token,
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    return this.http.get(`${this.apiUrl}/export/excel`, {
      params,
      headers: headers,
      responseType: 'blob',
      observe: 'body'
    });
  }

  /**
   * Importar desde Excel
   */
  importFromExcel(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/import/excel`, formData, { headers: this.getHeaders() });
  }
}
