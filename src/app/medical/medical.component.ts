import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../shared/data/data.service';
import { SideBarData, MenuItem } from '../shared/models/models';
import { SideBarService } from '../shared/side-bar/side-bar.service';
import { SharedModule } from '../shared/shared.module'; // Importar SharedModule

@Component({
  selector: 'app-medical',
  templateUrl: './medical.component.html',
  styleUrls: ['./medical.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Permitir componentes personalizados
  imports: [CommonModule, RouterModule, SharedModule], // Usar SharedModule
})
export class MedicalComponent {
  public miniSidebar = 'false';
  public expandMenu = 'false';
  public mobileSidebar = 'false';
  public sideBarActivePath = true;
  public headerActivePath = true;
  base = '';
  page = '';
  currentUrl = '';

  constructor(private sideBar: SideBarService, public router: Router, private data: DataService) {
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = 'true';
      } else {
        this.miniSidebar = 'false';
      }
    });

    this.sideBar.toggleMobileSideBar.subscribe((res: string) => {
      if (res == 'true' || res == 'true') {
        this.mobileSidebar = 'true';
      } else {
        this.mobileSidebar = 'false';
      }
    });

    this.sideBar.expandSideBar.subscribe((res: string) => {
      this.expandMenu = res;
      if (res == 'false' && this.miniSidebar == 'true') {
        this.data.sideBar.map((mainMenus: SideBarData) => {
          mainMenus.menu.map((resMenu: MenuItem) => {
            resMenu.showSubRoute = false;
          });
        });
      }
      if (res == 'true' && this.miniSidebar == 'true') {
        this.data.sideBar.map((mainMenus: SideBarData) => {
          mainMenus.menu.map((resMenu: MenuItem) => {
            const menuValue = sessionStorage.getItem('menuValue');
            if (menuValue && menuValue == resMenu.menuValue) {
              resMenu.showSubRoute = true;
            } else {
              resMenu.showSubRoute = false;
            }
          });
        });
      }
    });
    this.getRoutes(this.router.config);
  }

  public toggleMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
  }

  private getRoutes(routes: Route[]): void {
    routes.forEach((route) => {
      if (route.path && route.path.includes('confirm-mail')) {
        this.sideBarActivePath = false;
        this.headerActivePath = false;
      } else {
        this.sideBarActivePath = true;
        this.headerActivePath = true;
      }
    });
  }
}
