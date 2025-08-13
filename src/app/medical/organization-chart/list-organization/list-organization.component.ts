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
    // Polling cada 10 segundos para actualizar la lista de usuarios
    this.pollingSubscription = interval(10000).subscribe(() => this.loadUsers());
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
        // Mapea los usuarios y fuerza el valor booleano de online
        this.users = resp.users.map((u: any) => ({
          ...u,
          online: u.online === true // fuerza booleano
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
}
