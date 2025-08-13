import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../data/data.service';
interface MainMenu {
  menu: MenuItem[];
}

interface MenuItem {
  menuValue: string;
  showSubRoute: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  // Estado del sidebar (mini o expandido) para escritorio
  public toggleSideBar: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('isMiniSidebar') || "false"
  );

  // Estado del sidebar para dispositivos móviles
  public toggleMobileSideBar: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('isMobileSidebar') || "false"
  );

  // Estado de expansión del sidebar
  public expandSideBar: BehaviorSubject<string> = new BehaviorSubject<string>("false");

  /**
   * Inyecta el servicio de datos para manipular el menú
   */
  constructor(private data: DataService) {}

  /**
   * Alterna el estado del sidebar entre mini y expandido en escritorio
   * Actualiza el menú y el almacenamiento local
   */
  public switchSideMenuPosition(): void {
    if (localStorage.getItem('isMiniSidebar')) {
      this.toggleSideBar.next("false");
      localStorage.removeItem('isMiniSidebar');
      this.data.sideBar.map((mainMenus: MainMenu) => {
        mainMenus.menu.map((resMenu: MenuItem) => {
          const menuValue = sessionStorage.getItem('menuValue');
          if (menuValue && menuValue == resMenu.menuValue) {
            resMenu.showSubRoute = true;
          }
        });
      });
    } else {
      this.toggleSideBar.next('true');
      localStorage.setItem('isMiniSidebar', 'true');
      this.data.sideBar.map((mainMenus: MainMenu) => {
        mainMenus.menu.map((resMenu: MenuItem) => {
          resMenu.showSubRoute = false;
        });
      });
    }
  }

  /**
   * Alterna el estado del sidebar en dispositivos móviles
   * Actualiza el almacenamiento local
   */
  public switchMobileSideBarPosition(): void {
    if (localStorage.getItem('isMobileSidebar')) {
      this.toggleMobileSideBar.next("false");
      localStorage.removeItem('isMobileSidebar');
    } else {
      this.toggleMobileSideBar.next("true");
      localStorage.setItem('isMobileSidebar', 'true');
    }
  }
}
