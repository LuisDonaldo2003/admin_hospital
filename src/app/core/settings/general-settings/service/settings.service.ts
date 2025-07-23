import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  getSettings() {
    const URL = `${URL_SERVICIOS}/settings`;
    return this.http.get(URL, { headers: this.getHeaders() });
  }

  updateSettings(settings: any) {
    const URL = `${URL_SERVICIOS}/settings`;
    return this.http.post(URL, settings, { headers: this.getHeaders() });
  }
}
