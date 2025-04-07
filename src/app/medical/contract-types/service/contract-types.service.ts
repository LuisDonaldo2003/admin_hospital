import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContractTypesService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  listContract() {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/contracts";
    return this.http.get(URL, { headers: headers });
  }

  showContract(role_id:string) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/contracts/" + role_id;
    return this.http.get(URL, { headers: headers });
  }

  storeContract(data: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/contracts";
    return this.http.post(URL, data, { headers: headers });
  }

  editContract(data:any,id_contract_types:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/contracts/" + id_contract_types;
    return this.http.put(URL, data, { headers: headers });
  }

  deleteContract(id_contract_types:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/contracts/" + id_contract_types ;
    return this.http.delete(URL, { headers: headers });
  }
}
