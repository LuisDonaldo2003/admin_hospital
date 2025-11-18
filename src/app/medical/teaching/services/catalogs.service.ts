import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { URL_SERVICIOS } from 'src/app/config/config';

export interface CatalogItem {
  id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogsService {
  
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${URL_SERVICIOS}/teachings/catalogs`;

  private getHeaders(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ============ MODALIDADES ============
  getModalidades(): Observable<ApiResponse<CatalogItem[]>> {
    return this.http.get<ApiResponse<CatalogItem[]>>(
      `${this.baseUrl}/modalidades`,
      { headers: this.getHeaders() }
    );
  }

  getModalidad(id: number): Observable<ApiResponse<CatalogItem>> {
    return this.http.get<ApiResponse<CatalogItem>>(
      `${this.baseUrl}/modalidades/${id}`,
      { headers: this.getHeaders() }
    );
  }

  createModalidad(data: Partial<CatalogItem>): Observable<ApiResponse<CatalogItem>> {
    return this.http.post<ApiResponse<CatalogItem>>(
      `${this.baseUrl}/modalidades`,
      data,
      { headers: this.getHeaders() }
    );
  }

  updateModalidad(id: number, data: Partial<CatalogItem>): Observable<ApiResponse<CatalogItem>> {
    return this.http.put<ApiResponse<CatalogItem>>(
      `${this.baseUrl}/modalidades/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  deleteModalidad(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/modalidades/${id}`,
      { headers: this.getHeaders() }
    );
  }

  toggleModalidadStatus(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/modalidades/${id}/toggle`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ============ PARTICIPACIONES ============
  getParticipaciones(): Observable<ApiResponse<CatalogItem[]>> {
    return this.http.get<ApiResponse<CatalogItem[]>>(
      `${this.baseUrl}/participaciones`,
      { headers: this.getHeaders() }
    );
  }

  getParticipacion(id: number): Observable<ApiResponse<CatalogItem>> {
    return this.http.get<ApiResponse<CatalogItem>>(
      `${this.baseUrl}/participaciones/${id}`,
      { headers: this.getHeaders() }
    );
  }

  createParticipacion(data: Partial<CatalogItem>): Observable<ApiResponse<CatalogItem>> {
    return this.http.post<ApiResponse<CatalogItem>>(
      `${this.baseUrl}/participaciones`,
      data,
      { headers: this.getHeaders() }
    );
  }

  updateParticipacion(id: number, data: Partial<CatalogItem>): Observable<ApiResponse<CatalogItem>> {
    return this.http.put<ApiResponse<CatalogItem>>(
      `${this.baseUrl}/participaciones/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  deleteParticipacion(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/participaciones/${id}`,
      { headers: this.getHeaders() }
    );
  }

  toggleParticipacionStatus(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/participaciones/${id}/toggle`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ============ ÁREAS ============
  getAreas(): Observable<ApiResponse<CatalogItem[]>> {
    return this.http.get<ApiResponse<CatalogItem[]>>(
      `${this.baseUrl}/areas`,
      { headers: this.getHeaders() }
    );
  }

  getArea(id: number): Observable<ApiResponse<CatalogItem>> {
    return this.http.get<ApiResponse<CatalogItem>>(
      `${this.baseUrl}/areas/${id}`,
      { headers: this.getHeaders() }
    );
  }

  createArea(data: Partial<CatalogItem>): Observable<ApiResponse<CatalogItem>> {
    return this.http.post<ApiResponse<CatalogItem>>(
      `${this.baseUrl}/areas`,
      data,
      { headers: this.getHeaders() }
    );
  }

  updateArea(id: number, data: Partial<CatalogItem>): Observable<ApiResponse<CatalogItem>> {
    return this.http.put<ApiResponse<CatalogItem>>(
      `${this.baseUrl}/areas/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  deleteArea(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/areas/${id}`,
      { headers: this.getHeaders() }
    );
  }

  toggleAreaStatus(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/areas/${id}/toggle`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
