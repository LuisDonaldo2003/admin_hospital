import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { routes } from 'src/app/shared/routes/routes';
import { ProfileService } from './service/profile.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { URL_SERVICIOS } from 'src/app/config/config';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule], 
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  // Datos del perfil del usuario
  public profileData: any;
  // Roles del usuario
  public roles: string[] = [];
  // Información de la licencia
  public licenseInfo: any = null;
  public loadingLicense = true;
  // Rutas disponibles para navegación
  public routes = routes;
  // Idioma seleccionado
  public selectedLang: string;

  // Inyecta el servicio de perfil y el de traducción
  constructor(
    public profileService: ProfileService,
    private translate: TranslateService,
    private http: HttpClient
  ) {
    // Recupera el idioma guardado en localStorage y lo establece
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  /**
   * Inicializa el componente y carga los datos del perfil
   */
  ngOnInit() {
    this.getProfileData();
    this.getLicenseInfo();
  }

  /**
   * Alterna entre los idiomas inglés y español
   */
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  /**
   * Obtiene los datos del perfil y roles del usuario
   */
  private getProfileData(): void {
    this.profileService.getProfile().subscribe((resp: any) => {
      // Se elimina el log de respuesta del perfil
      this.profileData = resp.data;
      this.roles = resp.roles;
    });
  }

  /**
   * Obtiene la información de la licencia del sistema
   */
  private getLicenseInfo(): void {
    this.loadingLicense = true;
    this.http.get(`${URL_SERVICIOS}/license/info`).subscribe({
      next: (response: any) => {
        this.licenseInfo = response;
        this.loadingLicense = false;
      },
      error: () => {
        this.loadingLicense = false;
      }
    });
  }

  /**
   * Obtiene el color según los días restantes
   */
  getDaysColor(days: number): string {
    if (days <= 7) return 'text-danger';
    if (days <= 30) return 'text-warning';
    return 'text-success';
  }

  /**
   * Formatea la fecha
   */
  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
