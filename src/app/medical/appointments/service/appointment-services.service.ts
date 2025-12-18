import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

export interface AppointmentService {
    id: number;
    nombre: string;
    descripcion?: string;
    categoria: 'Especialidad' | 'Otros' | 'General';
    orden: number;
    activo: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AppointmentServicesService {

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Lista todos los servicios activos (Admin/Super Admin)
     */
    listAll(): Observable<any> {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
        const URL = `${URL_SERVICIOS}/appointment-services`;
        return this.http.get(URL, { headers });
    }

    /**
     * Lista solo los servicios a los que el usuario autenticado tiene acceso
     */
    listAccessible(): Observable<any> {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
        const URL = `${URL_SERVICIOS}/appointment-services/accessible`;
        return this.http.get(URL, { headers });
    }

    /**
     * Obtiene los servicios asignados a un usuario
     */
    getUserServices(userId: number): Observable<any> {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
        const URL = `${URL_SERVICIOS}/users/${userId}/services`;
        return this.http.get(URL, { headers });
    }

    /**
     * Asigna servicios a un usuario
     */
    assignServicesToUser(userId: number, serviceIds: number[]): Observable<any> {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
        const URL = `${URL_SERVICIOS}/users/${userId}/assign-services`;
        return this.http.post(URL, { service_ids: serviceIds }, { headers });
    }

    /**
     * Obtiene un servicio específico por ID
     */
    getService(id: number): Observable<any> {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
        const URL = `${URL_SERVICIOS}/appointment-services/${id}`;
        return this.http.get(URL, { headers });
    }

    /**
     * Crea un nuevo servicio (Admin)
     */
    createService(service: Partial<AppointmentService>): Observable<any> {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
        const URL = `${URL_SERVICIOS}/appointment-services`;
        return this.http.post(URL, service, { headers });
    }

    /**
     * Actualiza un servicio (Admin)
     */
    updateService(id: number, service: Partial<AppointmentService>): Observable<any> {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
        const URL = `${URL_SERVICIOS}/appointment-services/${id}`;
        return this.http.put(URL, service, { headers });
    }

    /**
     * Elimina un servicio (Admin)
     */
    deleteService(id: number): Observable<any> {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
        const URL = `${URL_SERVICIOS}/appointment-services/${id}`;
        return this.http.delete(URL, { headers });
    }
}
