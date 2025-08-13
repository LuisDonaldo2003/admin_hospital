// Servicio para gestionar la configuración general del sistema
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // Inyecta HttpClient para peticiones HTTP y AuthService para obtener el token
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtiene los headers de autorización para las peticiones
   */
  private getHeaders() {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  /**
   * Obtiene la configuración general del sistema
   */
  getSettings() {
    const URL = `${URL_SERVICIOS}/settings`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  /**
   * Actualiza la configuración general del sistema
   * @param settings Objeto con los datos de configuración
   */
  updateSettings(settings: any) {
    const URL = `${URL_SERVICIOS}/settings`;
    return this.http.post(URL, settings, { headers: this.getHeaders() });
  }
}
