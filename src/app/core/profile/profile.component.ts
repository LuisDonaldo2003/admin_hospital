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
  public profileData: any;
  public roles: string[] = [];
  public routes = routes;
  public selectedLang: string; // Idioma seleccionado


  constructor(
    public profileService: ProfileService,
    private translate: TranslateService // Servicio para manejar traducciones
  ) {
    // Recupera el idioma guardado en localStorage y lo establece
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit() {
    this.getProfileData();
    console.log('Perfil completo:', this.profileData);
  }
  // Alterna entre los idiomas inglés y español
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang); // Cambia el idioma en el servicio de traducción
    localStorage.setItem('language', this.selectedLang); // Guarda el idioma seleccionado en localStorage
  }

  private getProfileData(): void {
    this.profileService.getProfile().subscribe((resp: any) => {
      console.log('Respuesta del perfil:', resp); // 👈 agrega esta línea
      this.profileData = resp.data;
      this.roles = resp.roles;
    });
  }

}
