// Importación de dependencias necesarias para el servicio de staff
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

/**
 * Servicio para gestionar las operaciones CRUD de usuarios del staff.
 */
@Injectable({
  providedIn: 'root'
})
export class StaffService {

  /**
   * Constructor que inyecta HttpClient y AuthService para las peticiones y autenticación
   */
  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  /**
   * Obtiene la lista de usuarios del staff desde el backend
   * @returns Observable con los usuarios
   */
  listUsers(){
    // Configura los headers con el token de autenticación
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    // Construye la URL de la petición
    let URL = URL_SERVICIOS+"/staffs";
    // Realiza la petición GET para obtener los usuarios
    return this.http.get(URL,{headers: headers});
  }

  /**
   * Obtiene la configuración de staff (roles, etc.)
   * @returns Observable con la configuración
   */
  listConfig(){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/staffs/config";
    return this.http.get(URL,{headers: headers});
  }

  /**
   * Registra un nuevo usuario en el backend
   * @param data Datos del nuevo usuario
   * @returns Observable con la respuesta de la creación
   */
  registerUser(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/staffs";
    return this.http.post(URL,data,{headers: headers});
  }

  /**
   * Obtiene la información de un usuario específico
   * @param staff_id ID del usuario a consultar
   * @returns Observable con los datos del usuario
   */
  showUser(staff_id:string){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/staffs/"+staff_id;
    return this.http.get(URL,{headers: headers});
  }

  /**
   * Actualiza los datos de un usuario existente
   * @param staff_id ID del usuario a editar
   * @param data Datos actualizados del usuario
   * @returns Observable con la respuesta de la edición
   */
  updateUser(staff_id:string,data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/staffs/"+staff_id;
    return this.http.post(URL,data,{headers: headers});
  }

  /**
   * Elimina un usuario del backend
   * @param staff_id ID del usuario a eliminar
   * @returns Observable con la respuesta de la eliminación
   */
  deleteUser(staff_id:string){
    let headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    let URL = URL_SERVICIOS+"/staffs/"+staff_id;
    return this.http.delete(URL,{headers: headers});
  }
}

