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
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      this.miniSidebar = res === 'true';
    });

    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    console.log(this.user);

    // Carga el avatar desde localStorage si existe
    const avatarLS = localStorage.getItem('avatarUrl_' + (this.user?.id || ''));
    if (avatarLS) {
      this.avatarUrl = avatarLS;
      this.avatarLoading = false;
    }

    // Inicializar idioma
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit() {
    this.getProfileData();
  }

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

  getRole(): string {
    let roleName = "";
    this.user.roles.forEach((rol: any) => {
      roleName = rol;
    });
    return roleName;
  }

  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  openBoxFunc() {
    this.openBox = !this.openBox;
    const mainWrapper = document.getElementsByClassName('main-wrapper')[0];
    if (this.openBox) {
      mainWrapper.classList.add('open-msg-box');
    } else {
      mainWrapper.classList.remove('open-msg-box');
    }
  }

  logout() {
    this.auth.logout();
  }

  public toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
  }

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
