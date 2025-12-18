import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentServicesService } from '../service/appointment-services.service';
import { AppointmentServiceType } from '../service/appointments.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

interface UserWithServices {
    id: number;
    name: string;
    surname: string;
    email: string;
    assignedServices: number[];
}

@Component({
    selector: 'app-assign-services',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './assign-services.component.html',
    styleUrls: ['./assign-services.component.scss']
})
export class AssignServicesComponent implements OnInit {
    users: UserWithServices[] = [];
    services: AppointmentServiceType[] = [];
    loading = false;
    selectedUserId: number = 0;
    selectedServices: number[] = [];
    searchUser = '';
    searchService = '';

    text_success = '';
    text_error = '';

    constructor(
        private appointmentServicesService: AppointmentServicesService,
        private http: HttpClient,
        private authService: AuthService,
        private translate: TranslateService
    ) {
        const selectedLang = localStorage.getItem('language') || 'es';
        this.translate.use(selectedLang);
    }

    ngOnInit(): void {
        this.loadServices();
        this.loadUsers();
    }

    loadServices(): void {
        this.loading = true;
        this.appointmentServicesService.listAll().subscribe({
            next: (response) => {
                if (response.success) {
                    this.services = response.data;
                    console.log('Servicios cargados:', this.services.length);
                } else {
                    this.text_error = 'No se pudieron cargar los servicios disponibles';
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar servicios:', error);
                this.text_error = 'Error al cargar servicios. Por favor, intenta de nuevo.';
                this.loading = false;
            }
        });
    }

    loadUsers(): void {
        this.loading = true;
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
        this.http.get(`${URL_SERVICIOS}/users`, { headers }).subscribe({
            next: (response: any) => {
                // El endpoint devuelve {users: [...]} en lugar de {success, data}
                if (response.users) {
                    this.users = response.users.map((user: any) => ({
                        id: user.id,
                        name: user.name,
                        surname: user.surname,
                        email: user.email,
                        assignedServices: []
                    }));
                }
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error al cargar usuarios:', error);
                this.text_error = 'Error al cargar usuarios';
                this.loading = false;
            }
        });
    }

    get filteredUsers(): UserWithServices[] {
        if (!this.searchUser) return this.users;
        const search = this.searchUser.toLowerCase();
        return this.users.filter(u =>
            u.name.toLowerCase().includes(search) ||
            u.surname.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
        );
    }

    onUserSelect(userId: number): void {
        this.selectedUserId = userId;
        this.text_success = '';
        this.text_error = '';
        this.loadUserServices(userId);
    }

    loadUserServices(userId: number): void {
        this.loading = true;
        this.appointmentServicesService.getUserServices(userId).subscribe({
            next: (response) => {
                if (response.success) {
                    this.selectedServices = response.data.map((s: AppointmentServiceType) => s.id);
                    // Actualizar contador en usuario
                    const user = this.users.find(u => u.id === userId);
                    if (user) {
                        user.assignedServices = this.selectedServices;
                    }
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar servicios del usuario:', error);
                this.selectedServices = [];
                this.loading = false;
            }
        });
    }

    toggleService(serviceId: number): void {
        const index = this.selectedServices.indexOf(serviceId);
        if (index > -1) {
            this.selectedServices.splice(index, 1);
        } else {
            this.selectedServices.push(serviceId);
        }
    }

    isServiceSelected(serviceId: number): boolean {
        return this.selectedServices.includes(serviceId);
    }

    getServicesByCategory(category: string): AppointmentServiceType[] {
        let filtered = this.services.filter(s => s.categoria === category);

        // Apply search filter if search term exists
        if (this.searchService) {
            const search = this.searchService.toLowerCase();
            filtered = filtered.filter(s =>
                s.nombre.toLowerCase().includes(search)
            );
        }

        return filtered;
    }

    getFilteredServices(): AppointmentServiceType[] {
        if (!this.searchService) {
            return this.services;
        }

        const search = this.searchService.toLowerCase();
        return this.services.filter(s =>
            s.nombre.toLowerCase().includes(search)
        );
    }

    get totalServices(): number {
        return this.services.length;
    }

    get especialidadesCount(): number {
        return this.getServicesByCategory('Especialidad').length;
    }

    get generalCount(): number {
        return this.getServicesByCategory('General').length;
    }

    get otrosCount(): number {
        return this.getServicesByCategory('Otros').length;
    }

    saveAssignment(): void {
        if (!this.selectedUserId) {
            this.text_error = 'Por favor, selecciona un usuario de la lista';
            return;
        }

        this.loading = true;
        this.text_success = '';
        this.text_error = '';

        this.appointmentServicesService.assignServicesToUser(this.selectedUserId, this.selectedServices).subscribe({
            next: (response) => {
                if (response.success) {
                    const user = this.getSelectedUser();
                    const userName = user ? `${user.name} ${user.surname}` : 'el usuario';
                    this.text_success = `Servicios asignados correctamente a ${userName}`;

                    // Actualizar contador
                    if (user) {
                        user.assignedServices = this.selectedServices;
                    }

                    // Auto-ocultar mensaje de éxito después de 5 segundos
                    setTimeout(() => {
                        this.text_success = '';
                    }, 5000);
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al asignar servicios:', error);
                this.text_error = error.error?.message || 'Error al asignar servicios. Por favor, intenta de nuevo.';
                this.loading = false;
            }
        });
    }

    cancelSelection(): void {
        this.selectedUserId = 0;
        this.selectedServices = [];
        this.text_success = '';
        this.text_error = '';
    }

    getSelectedUser(): UserWithServices | undefined {
        return this.users.find(u => u.id === this.selectedUserId);
    }
}
