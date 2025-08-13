import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContractTypesService {

  /**
   * Inyecta el cliente HTTP y el servicio de autenticación
   */
  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  /**
   * Obtiene la lista de contratos desde el backend
   */
  listContract() {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/contracts";
    return this.http.get(URL, { headers: headers });
  }

  /**
   * Obtiene los datos de un contrato específico por su ID
   */
  showContract(role_id:string) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/contracts/" + role_id;
    return this.http.get(URL, { headers: headers });
  }

  /**
   * Envía la información para crear un nuevo contrato
   */
  storeContract(data: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/contracts";
    return this.http.post(URL, data, { headers: headers });
  }

  /**
   * Edita la información de un contrato existente
   */
  editContract(data:any,id_contract_types:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/contracts/" + id_contract_types;
    return this.http.put(URL, data, { headers: headers });
  }

  /**
   * Elimina un contrato por su ID
   */
  deleteContract(id_contract_types:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/contracts/" + id_contract_types ;
    return this.http.delete(URL, { headers: headers });
  }
}
