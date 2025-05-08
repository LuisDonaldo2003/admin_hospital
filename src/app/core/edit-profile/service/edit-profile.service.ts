import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EditProfileService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getAuthUser() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
    return this.http.post(`${URL_SERVICIOS}/auth/me`, {}, { headers });
  }

  getProfile(userId: string) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
    return this.http.get(`${URL_SERVICIOS}/users/${userId}`, { headers });
  }

  updateProfile(userId: string, data: any) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${URL_SERVICIOS}/users/profile_avatar/${userId}`, JSON.stringify(data), { headers });
  }

  getCatalogos() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
    return this.http.get(`${URL_SERVICIOS}/staffs/config`, { headers });
  }
}
