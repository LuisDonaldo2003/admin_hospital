import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/core/profile/service/profile.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { routes } from 'src/app/shared/routes/routes';
import { SideBarService } from 'src/app/shared/side-bar/side-bar.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {
  public routes = routes;
  public openBox = false;
  public miniSidebar = false;
  public addClass = false;
  public user: any;
  public profileData: any = {};
  public avatarUrl: string = 'assets/img/user-06.jpg';
  public avatarLoading: boolean = true;
  public roles: string[] = [];
  public selectedLang: string;

  constructor(
    public router: Router,
    private sideBar: SideBarService,
    public auth: AuthService,
    public profileService: ProfileService,
    private translate: TranslateService
  ) {
    // Suscribe al evento de cambio de menú lateral
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      this.miniSidebar = res === 'true';
    });

    // Obtiene el usuario desde localStorage
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');

    // Carga el avatar desde localStorage si existe
    const avatarLS = localStorage.getItem('avatarUrl_' + (this.user?.id || ''));
    if (avatarLS) {
      this.avatarUrl = avatarLS;
      this.avatarLoading = false;
    }

    // Inicializa el idioma seleccionado
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  // Al inicializar el componente, carga los datos del perfil
  ngOnInit() {
    this.getProfileData();
  }

  // Obtiene los datos del perfil y actualiza el avatar si es necesario
  private getProfileData(): void {
    this.profileService.getProfile().subscribe((resp: any) => {
      this.profileData = resp.data;
      this.roles = resp.roles;
      // Si el avatar existe y es diferente al actual, actualiza y guarda en localStorage
      if (resp.data?.avatar) {
        this.avatarUrl = resp.data.avatar;
        localStorage.setItem('avatarUrl_' + (this.user?.id || ''), resp.data.avatar);
      } else {
        this.avatarUrl = 'assets/img/user-06.jpg';
      }
      this.avatarLoading = false;
    });
  }

  // Devuelve el nombre del rol principal del usuario
  getRole(): string {
    let roleName = "";
    this.user.roles.forEach((rol: any) => {
      roleName = rol;
    });
    return roleName;
  }

  // Devuelve la ruta principal (home) según el rol del usuario conectado
  getHomeRoute(): string {
    const rawRoles: any[] = (this.user?.roles) || [];
    const norm = rawRoles
      .map(r => (typeof r === 'string' ? r : (r?.name || '')))
      .filter(Boolean)
      .map(r => r.trim().toLowerCase());

    if (norm.includes('archivo') || norm.includes('archive')) return routes.archiveDashboard;
    if (norm.includes('doctor')) return routes.doctorDashboard;
    if (norm.includes('patient') || norm.includes('paciente')) return routes.patientDashboard;
    if (norm.includes('director general')) return routes.adminDashboard;
    if (norm.includes('subdirector general')) return routes.adminDashboard;    
    return routes.adminDashboard; // fallback
  }

  // Cambia el idioma de la interfaz y lo guarda en localStorage
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  // Abre o cierra el cuadro de mensajes en la interfaz
  openBoxFunc() {
    this.openBox = !this.openBox;
    const mainWrapper = document.getElementsByClassName('main-wrapper')[0];
    if (this.openBox) {
      mainWrapper.classList.add('open-msg-box');
    } else {
      mainWrapper.classList.remove('open-msg-box');
    }
  }

  // Cierra la sesión del usuario
  logout() {
    this.auth.logout();
  }

  // Alterna la visibilidad del menú lateral
  public toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
  }

  // Alterna la visibilidad del menú lateral en dispositivos móviles
  public toggleMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
    this.addClass = !this.addClass;

    const root = document.getElementsByTagName('html')[0];
    const sidebar: any = document.getElementById('sidebar');

    if (this.addClass) {
      root.classList.add('menu-opened');
      sidebar.classList.add('opened');
    } else {
      root.classList.remove('menu-opened');
      sidebar.classList.remove('opened');
    }
  }
}
