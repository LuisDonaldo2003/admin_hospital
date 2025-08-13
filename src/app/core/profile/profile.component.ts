import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { ProfileService } from './service/profile.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  // Rutas disponibles para navegación
  public routes = routes;
  // Idioma seleccionado
  public selectedLang: string;

  // Inyecta el servicio de perfil y el de traducción
  constructor(
    public profileService: ProfileService,
    private translate: TranslateService
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
    // Se elimina el log de perfil completo
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
}
