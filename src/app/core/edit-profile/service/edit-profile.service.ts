// Servicio para gestionar la edición de perfil de usuario
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EditProfileService {
  // Inyecta HttpClient para peticiones HTTP y AuthService para obtener el token
  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Obtiene la información del usuario autenticado usando el token actual
   */
  getAuthUser() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
    return this.http.post(`${URL_SERVICIOS}/auth/me`, {}, { headers });
  }

  /**
   * Obtiene el perfil de un usuario por su ID
   * @param userId ID del usuario
   */
  getProfile(userId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
    return this.http.get(`${URL_SERVICIOS}/users/${userId}`, { headers });
  }

  /**
   * Actualiza el perfil y avatar de un usuario
   * @param userId ID del usuario
   * @param data Datos a actualizar (perfil y avatar)
   */
  updateProfile(userId: string, data: any) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${URL_SERVICIOS}/users/profile_avatar/${userId}`, JSON.stringify(data), { headers });
  }

  /**
   * Obtiene los catálogos de configuración para el staff
   */
  getCatalogos() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
    return this.http.get(`${URL_SERVICIOS}/staffs/config`, { headers });
  }

  /**
   * Actualiza el avatar del usuario
   * @param userId ID del usuario
   * @param formData FormData con la imagen del avatar
   */
  updateAvatar(userId: string, formData: FormData) {
    return this.http.post(`/api/profile/avatar/${userId}`, formData);
  }
}
