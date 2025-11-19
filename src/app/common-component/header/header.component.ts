import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileService } from 'src/app/core/profile/service/profile.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { routes } from 'src/app/shared/routes/routes';
import { SideBarService } from 'src/app/shared/side-bar/side-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { RoleConfigService } from 'src/app/shared/services/role-config.service';

/**
 * Componente del encabezado principal de la aplicación
 * Maneja la navegación, perfil de usuario y configuraciones globales
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Rutas de la aplicación
  public routes = routes;

  // Estado de la UI
  public openBox = false;
  public miniSidebar = false;
  public addClass = false;
  public avatarLoading = true;

  // Datos del usuario
  public user: any = null;
  public profileData: any = {};
  public avatarUrl = 'assets/img/user-06.jpg';
  public roles: string[] = [];

  // Configuración de idioma
  public selectedLang: string;

  // Gestión de suscripciones
  private subscriptions = new Subscription();

  constructor(
    public router: Router,
    private sideBar: SideBarService,
    public auth: AuthService,
    public profileService: ProfileService,
    private translate: TranslateService,
    private roleConfigService: RoleConfigService
  ) {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  /**
   * Inicializa el componente
   * Carga datos del usuario y suscribe a eventos
   */
  ngOnInit(): void {
    this.initializeUser();
    this.subscribeSidebarChanges();
    this.loadProfileData();
  }

  /**
   * Limpia las suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Inicializa los datos del usuario desde localStorage
   */
  private initializeUser(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        this.user = JSON.parse(userString);
        this.loadAvatarFromCache();
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.user = null;
      }
    }
  }

  /**
   * Carga el avatar desde localStorage si existe
   */
  private loadAvatarFromCache(): void {
    if (!this.user?.id) return;

    const cachedAvatar = localStorage.getItem(`avatarUrl_${this.user.id}`);
    if (cachedAvatar) {
      this.avatarUrl = cachedAvatar;
      this.avatarLoading = false;
    }
  }

  /**
   * Suscribe a cambios en el estado del sidebar
   */
  private subscribeSidebarChanges(): void {
    const sidebarSub = this.sideBar.toggleSideBar.subscribe((res: string) => {
      this.miniSidebar = res === 'true';
    });
    this.subscriptions.add(sidebarSub);
  }

  /**
   * Carga los datos del perfil desde el servidor
   */
  private loadProfileData(): void {
    const profileSub = this.profileService.getProfile().subscribe({
      next: (resp: any) => {
        this.handleProfileResponse(resp);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.avatarLoading = false;
      }
    });
    this.subscriptions.add(profileSub);
  }

  /**
   * Procesa la respuesta del perfil y actualiza el avatar
   */
  private handleProfileResponse(resp: any): void {
    this.profileData = resp.data || {};
    this.roles = resp.roles || [];

    if (resp.data?.avatar) {
      this.updateAvatar(resp.data.avatar);
    } else {
      this.avatarUrl = 'assets/img/user-06.jpg';
    }

    this.avatarLoading = false;
  }

  /**
   * Actualiza el avatar y lo guarda en caché
   */
  private updateAvatar(avatarUrl: string): void {
    this.avatarUrl = avatarUrl;
    if (this.user?.id) {
      localStorage.setItem(`avatarUrl_${this.user.id}`, avatarUrl);
    }
  }

  /**
   * Obtiene el nombre del rol principal del usuario
   */
  getRole(): string {
    if (!this.user?.roles || this.user.roles.length === 0) {
      return '';
    }
    return this.user.roles[this.user.roles.length - 1];
  }

  /**
   * Obtiene la ruta principal según el rol del usuario
   */
  getHomeRoute(): string {
    const rawRoles: any[] = this.user?.roles || [];
    return this.roleConfigService.getHomeRouteForRoles(rawRoles);
  }

  /**
   * Cambia el idioma de la interfaz
   */
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  /**
   * Abre o cierra el cuadro de mensajes
   */
  openBoxFunc(): void {
    this.openBox = !this.openBox;
    const mainWrapper = document.getElementsByClassName('main-wrapper')[0];

    if (mainWrapper) {
      if (this.openBox) {
        mainWrapper.classList.add('open-msg-box');
      } else {
        mainWrapper.classList.remove('open-msg-box');
      }
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.auth.logout();
  }

  /**
   * Alterna la visibilidad del sidebar
   */
  toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
  }

  /**
   * Alterna la visibilidad del sidebar en móvil
   */
  toggleMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
    this.addClass = !this.addClass;

    const root = document.getElementsByTagName('html')[0];
    const sidebar = document.getElementById('sidebar');

    if (root && sidebar) {
      if (this.addClass) {
        root.classList.add('menu-opened');
        sidebar.classList.add('opened');
      } else {
        root.classList.remove('menu-opened');
        sidebar.classList.remove('opened');
      }
    }
  }
}
