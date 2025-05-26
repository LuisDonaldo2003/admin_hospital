import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ArchiveService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  listArchives() {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/archives";
    return this.http.get(URL, { headers });
  }

  showArchive(archiveId: string | number) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/archives/" + archiveId;
    return this.http.get(URL, { headers });
  }

  registerArchive(data: any) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/archives";
    return this.http.post(URL, data, { headers });
  }

  updateArchive(archiveId: string | number, data: any) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/archives/" + archiveId;
    return this.http.put(URL, data, { headers });
  }

  deleteArchive(archiveId: string | number) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/archives/" + archiveId;
    return this.http.delete(URL, { headers });
  }
}
