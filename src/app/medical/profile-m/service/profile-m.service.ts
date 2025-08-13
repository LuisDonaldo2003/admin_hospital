// Importación de dependencias necesarias para el servicio de perfiles médicos
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

/**
 * Servicio para gestionar perfiles médicos: listar, mostrar, crear, editar y eliminar.
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileMService {
  /**
   * Constructor que inyecta HttpClient y AuthService
   */
  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  /**
   * Obtiene la lista de perfiles médicos desde el backend
   * Retorna un observable con los perfiles
   */
  listProfile() {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/profile";
    return this.http.get(URL, { headers: headers });
  }

  /**
   * Obtiene los datos de un perfil médico específico por su id
   * Retorna un observable con el perfil
   */
  showProfile(role_id:string) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/profile/" + role_id;
    return this.http.get(URL, { headers: headers });
  }

  /**
   * Crea un nuevo perfil médico en el backend
   * Retorna un observable con la respuesta
   */
  storeProfile(data: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/profile";
    return this.http.post(URL, data, { headers: headers });
  }

  /**
   * Edita un perfil médico existente en el backend
   * Retorna un observable con la respuesta
   */
  editProfile(data:any,id_profile:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/profile/" + id_profile;
    return this.http.put(URL, data, { headers: headers });
  }

  /**
   * Elimina un perfil médico por su id en el backend
   * Retorna un observable con la respuesta
   */
  deleteProfile(id_profile:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/profile/" + id_profile;
    return this.http.delete(URL, { headers: headers });
  }
}
