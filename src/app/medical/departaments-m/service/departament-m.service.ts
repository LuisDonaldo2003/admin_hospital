import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DepartamentMService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  listDepartaments() {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/departaments";
    return this.http.get(URL, { headers: headers });
  }

  showDepartament(role_id:string) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/departaments/" + role_id;
    return this.http.get(URL, { headers: headers });
  }

  storeDepartament(data: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/departaments";
    return this.http.post(URL, data, { headers: headers });
  }

  editDepartament(data:any,id_departament:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/departaments/" + id_departament;
    return this.http.put(URL, data, { headers: headers });
  }

  deleteDepartament(id_departament:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/departaments/" + id_departament;
    return this.http.delete(URL, { headers: headers });
  }
}
