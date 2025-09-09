import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from '../auth/auth.service';

/**
 * Servicio para gestionar el historial de actividades de usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class UserActivityLogsService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) {}

  /**
   * Obtiene los headers de autorización para las peticiones HTTP
   */
  private getHeaders() {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  /**
   * Obtiene las estadísticas del dashboard de actividades
   */
  getActivityStats() {
    const URL = `${URL_SERVICIOS}/user-activities/stats`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene la lista de actividades recientes con filtros y paginación
   */
  getRecentActivities(filters: any = {}, skip: number = 0, limit: number = 50) {
    const queryParams = new URLSearchParams();
    
    // Filtros disponibles
    if (filters.user_id) {
      queryParams.append('user_id', filters.user_id);
    }
    if (filters.action_type) {
      queryParams.append('action_type', filters.action_type);
    }
    if (filters.module) {
      queryParams.append('module', filters.module);
    }
    if (filters.date_from) {
      queryParams.append('date_from', filters.date_from);
    }
    if (filters.date_to) {
      queryParams.append('date_to', filters.date_to);
    }
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    // Paginación
    queryParams.append('skip', skip.toString());
    queryParams.append('limit', limit.toString());
    
    const URL = `${URL_SERVICIOS}/user-activities?${queryParams.toString()}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene estadísticas de actividades por usuario
   */
  getActivitiesByUser() {
    const URL = `${URL_SERVICIOS}/user-activities/by-user`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene estadísticas de actividades por módulo
   */
  getActivitiesByModule() {
    const URL = `${URL_SERVICIOS}/user-activities/by-module`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene estadísticas de actividades por tipo de acción
   */
  getActivitiesByActionType() {
    const URL = `${URL_SERVICIOS}/user-activities/by-action`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene los usuarios más activos
   */
  getMostActiveUsers(limit: number = 10) {
    const URL = `${URL_SERVICIOS}/user-activities/most-active?limit=${limit}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Registra una nueva actividad (para uso interno del sistema)
   */
  logActivity(activityData: any) {
    const URL = `${URL_SERVICIOS}/user-activities`;
    return this.http.post(URL, activityData, { headers: this.getHeaders() });
  }

  /**
   * Obtiene el detalle de una actividad específica
   */
  getActivityDetail(activityId: string | number) {
    const URL = `${URL_SERVICIOS}/user-activities/${activityId}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Obtiene las actividades de un usuario específico
   */
  getUserActivities(userId: string | number, skip: number = 0, limit: number = 50) {
    const URL = `${URL_SERVICIOS}/user-activities/user/${userId}?skip=${skip}&limit=${limit}`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }
}
