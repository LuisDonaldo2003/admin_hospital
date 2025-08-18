// Importación de módulos y servicios necesarios para el componente
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationService, OrganizationUser } from '../service/organization.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { interval, Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Componente que muestra la lista de usuarios organizados por roles en el organigrama.
 * Incluye funcionalidad de polling y cambio de idioma.
 */
@Component({
  selector: 'app-list-organization',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './list-organization.component.html',
  styleUrls: ['./list-organization.component.scss']
})
export class ListOrganizationComponent implements OnInit, OnDestroy {
  /**
   * Arreglo de usuarios obtenidos del servicio
   */
  users: OrganizationUser[] = [];
  /**
   * Bandera para mostrar el estado de carga
   */
  loading = true;
  /**
   * Mapa que agrupa usuarios por rol
   */
  rolesMap: { [role: string]: OrganizationUser[] } = {};
  /**
   * Suscripción para el polling periódico
   */
  private pollingSubscription: Subscription | undefined;
  /**
   * Idioma seleccionado actualmente
   */
  public selectedLang: string;

  /**
   * Constructor que inicializa servicios y el idioma seleccionado
   */
  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    // Obtiene el idioma guardado en localStorage o usa español por defecto
    this.selectedLang = localStorage.getItem('language') || 'es';
    // Establece el idioma en el servicio de traducción
    this.translate.use(this.selectedLang);
  }
  /**
   * Alterna el idioma entre español e inglés y lo guarda en localStorage
   */
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  /**
   * Ciclo de vida: se ejecuta al inicializar el componente
   * Inicia la carga de usuarios y el polling periódico
   */
  ngOnInit(): void {
    this.loadUsers();
    // Polling cada 30 segundos para actualizar la lista de usuarios (más frecuente para mejor UX)
    this.pollingSubscription = interval(30000).subscribe(() => this.loadUsers());
  }

  /**
   * Ciclo de vida: se ejecuta al destruir el componente
   * Cancela la suscripción del polling
   */
  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  /**
   * Carga la lista de usuarios desde el servicio y los agrupa por rol
   */
  loadUsers() {
    this.organizationService.listUsers().subscribe({
      next: (resp: any) => {
        // Mapea los usuarios y normaliza el valor booleano de online
        this.users = resp.users.map((u: any) => ({
          ...u,
          online: this.normalizeOnline(u)
        }));
        // Agrupa los usuarios por rol
        this.groupUsersByRole();
        // Finaliza el estado de carga
        this.loading = false;
      },
      error: () => {
        // Finaliza el estado de carga en caso de error
        this.loading = false;
      }
    });
  }

  /**
   * Agrupa los usuarios en el mapa rolesMap según los roles que tiene cada usuario
   */
  groupUsersByRole() {
    this.rolesMap = {};
    this.users.forEach(user => {
      user.roles.forEach(role => {
        // Si el rol no existe en el mapa, lo inicializa
        if (!this.rolesMap[role.name]) {
          this.rolesMap[role.name] = [];
        }
        // Agrega el usuario al arreglo correspondiente al rol
        this.rolesMap[role.name].push(user);
      });
    });
  }

  /**
   * Normaliza diferentes formatos de estado "online" que puedan venir del backend.
   * Soporta: `online` boolean, `is_online`, `status` string ('online'|'offline'),
   * y `last_seen` (timestamp) — si existe y fue reciente lo considera conectado.
   */
  private normalizeOnline(u: any): boolean {
    if (u === undefined || u === null) return false;
    if (typeof u.online === 'boolean') return u.online;
    if (u.is_online !== undefined) return Boolean(u.is_online);
    if (u.status && typeof u.status === 'string') return u.status.toLowerCase().includes('online');
    if (u.last_seen) {
      const last = new Date(u.last_seen).getTime();
      if (!isNaN(last)) {
        const now = Date.now();
        // Considerar conectado si la última actividad fue hace menos de 2 minutos
        return now - last < 2 * 60 * 1000;
      }
    }
    return false;
  }

  /** Helper público usado desde el template */
  public isOnline(user: any): boolean {
    return this.normalizeOnline(user);
  }

  /** Devuelve la clave de traducción apropiada para el tooltip */
  public onlineTitleKey(user: any): string {
    return this.isOnline(user) ? 'ORGANIZATION.LIST_ORGANIZATION.ONLINE' : 'ORGANIZATION.LIST_ORGANIZATION.OFFLINE';
  }

  /** Cuenta usuarios online totales */
  public getOnlineUsersCount(): number {
    return this.users.filter(user => this.isOnline(user)).length;
  }

  /** Cuenta usuarios offline totales */
  public getOfflineUsersCount(): number {
    return this.users.filter(user => !this.isOnline(user)).length;
  }

  /** Cuenta usuarios online para un rol específico */
  public getOnlineCountForRole(users: any[]): number {
    return users.filter(user => this.isOnline(user)).length;
  }

  /** Obtiene el icono apropiado para cada rol */
  public getRoleIcon(roleName: string): string {
    const iconMap: { [key: string]: string } = {
      'Administrador': 'fas fa-cog',
      'Médico': 'fas fa-user-md',
      'Enfermero': 'fas fa-user-nurse',
      'Archivo': 'fas fa-archive',
      'Developer': 'fas fa-code',
      'Recepcionista': 'fas fa-desk',
      'Farmacéutico': 'fas fa-pills',
      'Laboratorista': 'fas fa-microscope',
      'default': 'fas fa-user-friends'
    };
    return iconMap[roleName] || iconMap['default'];
  }

  /** Maneja click en usuario */
  public onUserClick(user: any): void {
    // Aquí puedes agregar lógica para mostrar más detalles del usuario
    console.log('Usuario seleccionado:', user);
    // Ejemplo: mostrar modal, navegar a perfil, etc.
  }

  /** Maneja errores de imagen */
  public onImageError(event: any): void {
    // Fallback cuando la imagen no carga
    console.log('Error loading image for user');
  }

  /** Obtiene la hora de última actualización */
  public getLastUpdateTime(): string {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /** Devuelve el número de roles activos */
  public getRolesCount(): number {
    return Object.keys(this.rolesMap).length;
  }
}
