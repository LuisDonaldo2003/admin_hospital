// Servicio para gestionar el perfil del usuario
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // Inyecta HttpClient para peticiones HTTP y AuthService para obtener el token
  constructor(
    public http: HttpClient, 
    public authService: AuthService
  ) {}

  /**
   * Obtiene el perfil del usuario autenticado
   */
  getProfile() {
    let headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    let URL = URL_SERVICIOS + "/profile_avatar";
    return this.http.get(URL, { headers: headers });
  }

  /**
   * Actualiza el perfil y avatar del usuario
   * @param userId ID del usuario
   * @param data Datos a actualizar
   */
  updateProfile(userId: string, data: any) {
    let headers = new HttpHeaders({'Authorization': 'Bearer ' + this.authService.token});
    let URL = `${URL_SERVICIOS}/users/profile_avatar/${userId}`;
    return this.http.put(URL, data, { headers: headers });
  }
}
