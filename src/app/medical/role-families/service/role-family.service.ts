import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

/**
 * Servicio para gestionar las familias de roles
 */
@Injectable({
  providedIn: 'root',
})
export class RoleFamilyService {

  constructor(
    public http: HttpClient,
    public authService: AuthService
  ) { }

  /**
   * Obtiene la lista de familias de roles
   */
  listFamilies() {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/role-families";
    return this.http.get<{ families: any[] }>(URL, { headers: headers });
  }

  /**
   * Obtiene una familia específica por ID
   */
  showFamily(family_id: string) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/role-families/" + family_id;
    return this.http.get(URL, { headers: headers });
  }

  /**
   * Crea una nueva familia de roles
   */
  storeFamily(data: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/role-families";
    return this.http.post(URL, data, { headers: headers });
  }

  /**
   * Actualiza una familia de roles existente
   */
  updateFamily(data: any, family_id: string) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/role-families/" + family_id;
    return this.http.put(URL, data, { headers: headers });
  }

  /**
   * Elimina una familia de roles
   */
  deleteFamily(family_id: string) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/role-families/" + family_id;
    return this.http.delete(URL, { headers: headers });
  }

  /**
   * Asigna roles a una familia
   */
  assignRoles(family_id: string, role_ids: number[]) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/role-families/" + family_id + "/assign-roles";
    return this.http.post(URL, { role_ids }, { headers: headers });
  }
}
