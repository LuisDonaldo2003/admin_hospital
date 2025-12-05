import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

export interface Especialidad {
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
 * Servicio para gestionar especialidades médicas: listar, mostrar, crear, editar y eliminar.
 */
@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
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
   * Obtiene la lista de especialidades desde el backend
   * Retorna un observable con las especialidades
   */
  listEspecialidades(): Observable<ApiResponse<Especialidad[]>> {
    const headers = this.getHeaders();
    const URL = `${URL_SERVICIOS}/appointments/especialidades`;
    return this.http.get<ApiResponse<Especialidad[]>>(URL, { headers });
  }

  /**
   * Obtiene los datos de una especialidad específica por su id
   * Retorna un observable con la especialidad
   */
  showEspecialidad(id: number): Observable<ApiResponse<Especialidad>> {
    const headers = this.getHeaders();
    const URL = `${URL_SERVICIOS}/appointments/especialidades/${id}`;
    return this.http.get<ApiResponse<Especialidad>>(URL, { headers });
  }

  /**
   * Crea una nueva especialidad en el backend
   * Retorna un observable con la respuesta
   */
  storeEspecialidad(data: Partial<Especialidad>): Observable<ApiResponse<Especialidad>> {
    const headers = this.getHeaders();
    const URL = `${URL_SERVICIOS}/appointments/especialidades`;
    return this.http.post<ApiResponse<Especialidad>>(URL, data, { headers });
  }

  /**
   * Edita una especialidad existente en el backend
   * Retorna un observable con la respuesta
   */
  editEspecialidad(id: number, data: Partial<Especialidad>): Observable<ApiResponse<Especialidad>> {
    const headers = this.getHeaders();
    const URL = `${URL_SERVICIOS}/appointments/especialidades/${id}`;
    return this.http.put<ApiResponse<Especialidad>>(URL, data, { headers });
  }

  /**
   * Elimina una especialidad por su id en el backend
   * Retorna un observable con la respuesta
   */
  deleteEspecialidad(id: number): Observable<ApiResponse<any>> {
    const headers = this.getHeaders();
    const URL = `${URL_SERVICIOS}/appointments/especialidades/${id}`;
    return this.http.delete<ApiResponse<any>>(URL, { headers });
  }
}
