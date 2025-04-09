import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileMService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  listProfile() {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/profile";
    return this.http.get(URL, { headers: headers });
  }

  showProfile(role_id:string) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/profile/" + role_id;
    return this.http.get(URL, { headers: headers });
  }

  storeProfile(data: any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/profile";
    return this.http.post(URL, data, { headers: headers });
  }

  editProfile(data:any,id_profile:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/profile/" + id_profile;
    return this.http.put(URL, data, { headers: headers });
  }

  deleteProfile(id_profile:any) {
    let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    let URL = URL_SERVICIOS + "/profile/" + id_profile;
    return this.http.delete(URL, { headers: headers });
  }
}
