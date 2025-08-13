// Importación de dependencias necesarias para el servicio de roles
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

/**
 * Servicio para gestionar las operaciones CRUD de roles de usuario.
 */
@Injectable({
  providedIn: 'root',
})
export class RolesService {
  /**
   * Constructor que inyecta HttpClient y AuthService para las peticiones y autenticación
   */
  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) {}

  /**
   * Obtiene la lista de roles desde el backend
   * @returns Observable con los roles
   */
  listRoles() {
    // Configura los headers con el token de autenticación
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    // Construye la URL de la petición
    let URL = URL_SERVICIOS + "/roles";
    // Realiza la petición GET para obtener los roles
    return this.http.get<{ roles: any[] }>(URL, { headers: headers });
  }

  /**
   * Obtiene la información de un rol específico
   * @param role_id ID del rol a consultar
   * @returns Observable con los datos del rol
   */
  showRoles(role_id: string) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/roles/" + role_id;
    return this.http.get(URL, { headers: headers });
  }

  /**
   * Crea un nuevo rol en el backend
   * @param data Datos del nuevo rol
   * @returns Observable con la respuesta de la creación
   */
  storeRoles(data: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/roles";
    return this.http.post(URL, data, { headers: headers });
  }

  /**
   * Edita un rol existente en el backend
   * @param data Datos actualizados del rol
   * @param id_role ID del rol a editar
   * @returns Observable con la respuesta de la edición
   */
  editRoles(data: any, id_role: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/roles/" + id_role;
    return this.http.put(URL, data, { headers: headers });
  }

  /**
   * Elimina un rol del backend
   * @param id_role ID del rol a eliminar
   * @returns Observable con la respuesta de la eliminación
   */
  deleteRoles(id_role: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/roles/" + id_role;
    return this.http.delete(URL, { headers: headers });
  }
}
