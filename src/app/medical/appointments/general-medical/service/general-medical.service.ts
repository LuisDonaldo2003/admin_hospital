import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

export interface GeneralMedical {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

/**
 * Servicio para gestionar médicos generales: listar, mostrar, crear, editar y eliminar.
 */
@Injectable({
  providedIn: 'root'
})
export class GeneralMedicalService {
  /**
   * Constructor que inyecta HttpClient y AuthService
   */
  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  /**
   * Obtiene los headers con el token de autorización
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
  }

  /**
   * Obtiene la lista de médicos generales desde el backend
   * Retorna un observable con los datos
   */
  listGeneralMedicals(): Observable<ApiResponse<GeneralMedical[]>> {
    const headers = this.getHeaders();
    const URL = `${URL_SERVICIOS}/appointments/general-medicals`;
    return this.http.get<ApiResponse<GeneralMedical[]>>(URL, { headers });
  }

  /**
   * Obtiene los datos de una categoría específica por su id
   * Retorna un observable con los datos
   */
  showGeneralMedical(id: number): Observable<ApiResponse<GeneralMedical>> {
    const headers = this.getHeaders();
    const URL = `${URL_SERVICIOS}/appointments/general-medicals/${id}`;
    return this.http.get<ApiResponse<GeneralMedical>>(URL, { headers });
  }

  /**
   * Crea una nueva categoría en el backend
   * Retorna un observable con la respuesta
   */
  storeGeneralMedical(data: Partial<GeneralMedical>): Observable<ApiResponse<GeneralMedical>> {
    const headers = this.getHeaders();
    const URL = `${URL_SERVICIOS}/appointments/general-medicals`;
    return this.http.post<ApiResponse<GeneralMedical>>(URL, data, { headers });
  }

  /**
   * Edita una categoría existente en el backend
   * Retorna un observable con la respuesta
   */
  editGeneralMedical(id: number, data: Partial<GeneralMedical>): Observable<ApiResponse<GeneralMedical>> {
    const headers = this.getHeaders();
    const URL = `${URL_SERVICIOS}/appointments/general-medicals/${id}`;
    return this.http.put<ApiResponse<GeneralMedical>>(URL, data, { headers });
  }

  /**
   * Elimina una categoría por su id en el backend
   * Retorna un observable con la respuesta
   */
  deleteGeneralMedical(id: number): Observable<ApiResponse<any>> {
    const headers = this.getHeaders();
    const URL = `${URL_SERVICIOS}/appointments/general-medicals/${id}`;
    return this.http.delete<ApiResponse<any>>(URL, { headers });
  }
}
