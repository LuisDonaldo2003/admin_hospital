import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

export interface OrganizationRole {
  name: string;
  permissions: string[];
  poder: number;
}

export interface OrganizationUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  avatar?: string;
  roles: { id: number; name: string }[];
  online?: boolean; // <-- Agrega esto
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  // Simulación de datos, puedes reemplazar por llamada HTTP
  private roles: OrganizationRole[] = [
    { name: 'Administrador', permissions: ['crear', 'editar', 'eliminar', 'ver'], poder: 4 },
    { name: 'Médico', permissions: ['editar', 'ver'], poder: 2 },
    { name: 'Enfermero', permissions: ['ver'], poder: 1 }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  getRoles(): OrganizationRole[] {
    // Aquí podrías hacer una petición HTTP real
    return this.roles;
  }

  listUsers() {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/staffs";
    return this.http.get<{ users: OrganizationUser[] }>(URL, { headers });
  }

  listConfig() {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = URL_SERVICIOS + "/staffs/config";
    return this.http.get(URL, { headers });
  }
}
