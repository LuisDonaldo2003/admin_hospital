import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DepartamentMService {

  /**
   * Inyecta el cliente HTTP y el servicio de autenticación
   */
  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  /**
   * Obtiene la lista de departamentos desde el backend
   */
  listDepartaments() {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/departaments";
    return this.http.get(URL, { headers: headers });
  }

  /**
   * Obtiene los datos de un departamento específico por su ID
   */
  showDepartament(role_id:string) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/departaments/" + role_id;
    return this.http.get(URL, { headers: headers });
  }

  /**
   * Envía la información para crear un nuevo departamento
   */
  storeDepartament(data: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/departaments";
    return this.http.post(URL, data, { headers: headers });
  }

  /**
   * Edita la información de un departamento existente
   */
  editDepartament(data:any,id_departament:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/departaments/" + id_departament;
    return this.http.put(URL, data, { headers: headers });
  }

  /**
   * Elimina un departamento por su ID
   */
  deleteDepartament(id_departament:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/departaments/" + id_departament;
    return this.http.delete(URL, { headers: headers });
  }
}
