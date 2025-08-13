// Importación de dependencias necesarias para el servicio de organización
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

/**
 * Interfaz que representa un rol dentro de la organización
 */
export interface OrganizationRole {
  name: string; // Nombre del rol
  permissions: string[]; // Permisos asociados al rol
  poder: number; // Nivel de poder del rol
}

/**
 * Interfaz que representa un usuario dentro de la organización
 */
export interface OrganizationUser {
  id: number; // Identificador único del usuario
  name: string; // Nombre del usuario
  surname: string; // Apellido del usuario
  email: string; // Correo electrónico
  avatar?: string; // URL del avatar (opcional)
  roles: { id: number; name: string }[]; // Roles que tiene el usuario
  online?: boolean; // Estado de conexión (opcional)
}

/**
 * Servicio para gestionar la organización, roles y usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  /**
   * Arreglo de roles simulados para la organización
   * Puedes reemplazar por una llamada HTTP real
   */
  private roles: OrganizationRole[] = [
    { name: 'Administrador', permissions: ['crear', 'editar', 'eliminar', 'ver'], poder: 4 },
    { name: 'Médico', permissions: ['editar', 'ver'], poder: 2 },
    { name: 'Enfermero', permissions: ['ver'], poder: 1 }
  ];

  /**
   * Constructor que inyecta los servicios de HttpClient y AuthService
   */
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  /**
   * Devuelve el arreglo de roles simulados
   * Aquí podrías hacer una petición HTTP real para obtener los roles
   */
  getRoles(): OrganizationRole[] {
    return this.roles;
  }

  /**
   * Obtiene la lista de usuarios de la organización desde el backend
   * Retorna un observable con los usuarios
   */
  listUsers() {
    // Configura los headers con el token de autenticación
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    // Construye la URL para la petición
    const URL = URL_SERVICIOS + "/staffs";
    // Realiza la petición GET y retorna el observable
    return this.http.get<{ users: OrganizationUser[] }>(URL, { headers });
  }

  /**
   * Obtiene la configuración de la organización desde el backend
   * Retorna un observable con la configuración
   */
  listConfig() {
    // Configura los headers con el token de autenticación
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    // Construye la URL para la petición
    const URL = URL_SERVICIOS + "/staffs/config";
    // Realiza la petición GET y retorna el observable
    return this.http.get(URL, { headers });
  }
}
