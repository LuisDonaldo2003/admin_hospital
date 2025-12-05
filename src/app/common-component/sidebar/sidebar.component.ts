import { Component, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { DataService } from 'src/app/shared/data/data.service';
import { MenuItem, SideBarData } from 'src/app/shared/models/models';
import { routes } from 'src/app/shared/routes/routes';
import { SideBarService } from 'src/app/shared/side-bar/side-bar.service';
import { NgScrollbar } from 'ngx-scrollbar';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
// Componente para la barra lateral de navegación
export class SidebarComponent implements OnDestroy, AfterViewInit {
  // Referencia al componente ng-scrollbar para controlar el scroll
  @ViewChild(NgScrollbar) scrollbarRef!: NgScrollbar;

  // Clave para guardar la posición de scroll en sessionStorage
  private readonly SCROLL_POSITION_KEY = 'sidebar_scroll_position';
  // Propiedades para la navegación y estado visual
  base = '';
  page = '';
  currentUrl = '';
  public classAdd = false;
  public multilevel: Array<boolean> = [false, false, false];

  // Rutas y datos del sidebar
  public routes = routes;
  public sidebarData: Array<SideBarData> = [];
  public user: any;
  public isDarkMode: boolean = false;
  public groupedSidebarData: any[] = [];
  // Mapeo de grupos para traducción
  public groupMap: { [key: string]: string } = {
    'GRUPO_ADMINISTRADOR': 'ADMINISTRADOR',
    'GRUPO_RH': 'RH',
    'GRUPO_ENSEÑANZA': 'TEACHING',
    'GRUPO_ARCHIVO': 'ARCHIVO',
    'GRUPO_PHARMACY': 'PHARMACY',
    'GRUPO_TABLERO': 'TABLERO',
    'GRUPO_SISTEMA': 'SISTEMA',
    'GRUPO_CITAS': 'CITAS'
  };

  private userSubscription: Subscription;

  constructor(
    private data: DataService,
    private router: Router,
    private sideBar: SideBarService,
    public authService: AuthService,
  ) {
    // Suscribe a cambios de usuario para cargar el sidebar
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
      this.loadSidebar();
    });

    // Suscribe a cambios de modo oscuro
    this.data.darkMode$.subscribe((darkMode) => {
      this.isDarkMode = darkMode;
    });

    // Suscribe a cambios de navegación para actualizar rutas
    router.events.subscribe((event: object) => {
      if (event instanceof NavigationEnd) {
        this.getRoutes(event);
      }
    });
    this.getRoutes(this.router);
  }

  // Carga los menús del sidebar según el rol y permisos del usuario
  private loadSidebar() {
    if (!this.user) {
      this.sidebarData = [];
      return;
    }

    // Si es Director General, muestra todos los menús
    if (this.user.roles.includes("Director General")) {
      this.sidebarData = this.data.sideBar;
    } else {
      // Filtra menús y submenús según permisos
      let permissions = this.user.permissions;
      let SIDE_BAR_G: any = [];

      this.data.sideBar.forEach((side: any) => {
        let SIDE_B: any = [];
        side.menu.forEach((menu_s: any) => {
          if (menu_s.subMenus.length > 0) {
            let SUB_MENUS = menu_s.subMenus.filter((submenu: any) => permissions.includes(submenu.permision) && submenu.show_nav);
            if (SUB_MENUS.length > 0) {
              menu_s.subMenus = SUB_MENUS;
              SIDE_B.push(menu_s);
            }
          } else {
            if (permissions.includes(menu_s.permision)) {
              menu_s.subMenus = [];
              SIDE_B.push(menu_s);
            }
          }
        });
        if (SIDE_B.length > 0) {
          side.menu = SIDE_B;
          SIDE_BAR_G.push(side);
        }
      });
      this.sidebarData = SIDE_BAR_G;
    }

    // Agrupa los menús por grupo para la vista
    let menus = this.sidebarData[0]?.menu || [];
    let groups: any = {};

    menus.forEach(menu => {
      const groupName = menu.group || 'OTROS';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(menu);
    });

    this.groupedSidebarData = Object.keys(groups).map(key => ({
      group: this.groupMap[key] || key,
      menus: groups[key]
    }));
  }

  // Expande o colapsa los submenús de un menú principal
  public expandSubMenus(menu: MenuItem): void {
    sessionStorage.setItem('menuValue', menu.menuValue);
    this.sidebarData.map((mainMenus: SideBarData) => {
      mainMenus.menu.map((resMenu: MenuItem) => {
        if (resMenu.menuValue == menu.menuValue) {
          menu.showSubRoute = !menu.showSubRoute;
        } else {
          resMenu.showSubRoute = false;
        }
      });
    });
  }

  // Actualiza las rutas y clases visuales según la navegación
  private getRoutes(route: { url: string }): void {
    // Guardar posición de scroll antes de navegar
    this.saveScrollPosition();

    const bodyTag = document.body;
    bodyTag.classList.remove('slide-nav', 'opened');
    this.currentUrl = route.url;
    const splitVal = route.url.split('/');
    this.base = splitVal[1];
    this.page = splitVal[2];
  }

  // Expande el sidebar al pasar el mouse
  public miniSideBarMouseHover(position: string): void {
    if (position == 'over') {
      this.sideBar.expandSideBar.next("true");
    } else {
      this.sideBar.expandSideBar.next("false");
    }
  }

  // Alterna el modo oscuro/claro
  public toggleTheme(): void {
    this.data.toggleDarkMode();
  }

  // Limpia el valor del menú para traducción
  public cleanMenuValue(value: string): string {
    // Los valores del data service ya vienen limpios (PERSONAL, ROL, etc.)
    // Solo necesitamos devolverlos tal como están
    return value;
  }

  // Se ejecuta después de que la vista del componente esté inicializada
  ngAfterViewInit(): void {
    // Restaurar posición de scroll después de que la vista esté lista
    // Usamos setTimeout para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      this.restoreScrollPosition();
    }, 100);
  }

  // Guarda la posición actual de scroll en sessionStorage
  private saveScrollPosition(): void {
    try {
      if (this.scrollbarRef?.viewport) {
        const scrollTop = this.scrollbarRef.viewport.nativeElement.scrollTop;
        sessionStorage.setItem(this.SCROLL_POSITION_KEY, scrollTop.toString());
      }
    } catch (error) {
      // Silenciosamente ignorar errores de sessionStorage
      console.debug('No se pudo guardar la posición de scroll:', error);
    }
  }

  // Restaura la posición de scroll desde sessionStorage
  private restoreScrollPosition(): void {
    try {
      const savedPosition = sessionStorage.getItem(this.SCROLL_POSITION_KEY);
      if (savedPosition && this.scrollbarRef?.viewport) {
        const scrollTop = parseInt(savedPosition, 10);
        this.scrollbarRef.viewport.nativeElement.scrollTop = scrollTop;
      }
    } catch (error) {
      // Silenciosamente ignorar errores de sessionStorage
      console.debug('No se pudo restaurar la posición de scroll:', error);
    }
  }

  // Libera la suscripción al destruir el componente
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
