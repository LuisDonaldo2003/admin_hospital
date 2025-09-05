import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../shared/auth/auth.service';
import { URL_SERVICIOS } from '../../../config/config';

export interface Personal {
  id?: number;
  nombre: string;
  apellidos: string;
  tipo: 'Clínico' | 'No Clínico';
  fecha_ingreso?: string;
  activo?: boolean;
  documentos_completos?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PersonalDocument {
  id?: number;
  personal_id: number;
  tipo_documento: string;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_mime: string;
  tamaño_archivo: number;
  fecha_subida: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtiene los headers de autorización
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  /**
   * Obtener lista de personal
   */
  listPersonal(params?: any): Observable<ApiResponse<Personal[]>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal`;
    return this.http.get<ApiResponse<Personal[]>>(url, { headers, params });
  }

  /**
   * Crear nuevo personal
   */
  storePersonal(data: Personal): Observable<ApiResponse<Personal>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal`;
    return this.http.post<ApiResponse<Personal>>(url, data, { headers });
  }

  /**
   * Crear personal con documentos
   */
  storePersonalWithDocuments(personalData: Personal, documentos: Map<string, File>): Observable<ApiResponse<Personal>> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
      // No agregar Content-Type para FormData
    });

    const formData = new FormData();
    
    // Agregar datos del personal
    formData.append('nombre', personalData.nombre);
    formData.append('apellidos', personalData.apellidos);
    formData.append('tipo', personalData.tipo);

    // Agregar documentos
    documentos.forEach((file, tipoDocumento) => {
      formData.append(`documentos[${tipoDocumento}]`, file, file.name);
    });

    const url = `${URL_SERVICIOS}/personal/with-documents`;
    return this.http.post<ApiResponse<Personal>>(url, formData, { headers });
  }

  /**
   * Obtener personal por ID
   */
  showPersonal(id: number): Observable<ApiResponse<Personal>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal/${id}`;
    return this.http.get<ApiResponse<Personal>>(url, { headers });
  }

  /**
   * Actualizar personal
   */
  updatePersonal(id: number, data: Partial<Personal>): Observable<ApiResponse<Personal>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal/${id}`;
    return this.http.put<ApiResponse<Personal>>(url, data, { headers });
  }

  /**
   * Eliminar personal
   */
  deletePersonal(id: number): Observable<ApiResponse<any>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal/${id}`;
    return this.http.delete<ApiResponse<any>>(url, { headers });
  }

  /**
   * Obtener estadísticas del personal
   */
  getEstadisticas(): Observable<ApiResponse<any>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal/estadisticas`;
    return this.http.get<ApiResponse<any>>(url, { headers });
  }

  /**
   * Subir documento individual
   */
  uploadDocument(personalId: number, tipoDocumento: string, archivo: File): Observable<ApiResponse<PersonalDocument>> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });

    const formData = new FormData();
    formData.append('personal_id', personalId.toString());
    formData.append('tipo_documento', tipoDocumento);
    formData.append('archivo', archivo, archivo.name);

    const url = `${URL_SERVICIOS}/personal/documentos`;
    return this.http.post<ApiResponse<PersonalDocument>>(url, formData, { headers });
  }

  /**
   * Obtener documentos de una persona
   */
  getDocumentos(personalId: number): Observable<ApiResponse<PersonalDocument[]>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal/${personalId}/documentos`;
    return this.http.get<ApiResponse<PersonalDocument[]>>(url, { headers });
  }

  /**
   * Obtener estado de documentos de una persona
   */
  getEstadoDocumentos(personalId: number): Observable<ApiResponse<any>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal/${personalId}/documentos/estado`;
    return this.http.get<ApiResponse<any>>(url, { headers });
  }

  /**
   * Descargar documento
   */
  downloadDocument(documentId: number): Observable<Blob> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal/documentos/${documentId}/download`;
    return this.http.get(url, { 
      headers, 
      responseType: 'blob'
    });
  }

  /**
   * Eliminar documento
   */
  deleteDocument(documentId: number): Observable<ApiResponse<any>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal/documentos/${documentId}`;
    return this.http.delete<ApiResponse<any>>(url, { headers });
  }

  /**
   * Obtener tipos de documentos requeridos
   */
  getTiposDocumentos(): Observable<ApiResponse<string[]>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/personal/tipos-documentos`;
    return this.http.get<ApiResponse<string[]>>(url, { headers });
  }
}
