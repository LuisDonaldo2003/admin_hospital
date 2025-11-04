import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

// Interface para el departamento
interface Departament {
  id?: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartamentMService {

  /**
   * Inyecta el cliente HTTP y el servicio de autenticación usando inject()
   */
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  /**
   * Obtiene la lista de departamentos desde el backend
   */
  listDepartaments() {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/departaments";
    return this.http.get<Departament[]>(URL, { headers: headers });
  }

  /**
   * Obtiene los datos de un departamento específico por su ID
   */
  showDepartament(role_id: string) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/departaments/" + role_id;
    return this.http.get<Departament>(URL, { headers: headers });
  }

  /**
   * Envía la información para crear un nuevo departamento
   */
  storeDepartament(data: Departament) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/departaments";
    return this.http.post<Departament>(URL, data, { headers: headers });
  }

  /**
   * Edita la información de un departamento existente
   */
  editDepartament(data: Departament, id_departament: number | string) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/departaments/" + id_departament;
    return this.http.put<Departament>(URL, data, { headers: headers });
  }

  /**
   * Elimina un departamento por su ID
   */
  deleteDepartament(id_departament: number | string) {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/departaments/" + id_departament;
    return this.http.delete<{ success: boolean; message?: string }>(URL, { headers: headers });
  }
}
