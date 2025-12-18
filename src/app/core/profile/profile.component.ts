import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { routes } from 'src/app/shared/routes/routes';
import { ProfileService } from './service/profile.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { URL_SERVICIOS } from 'src/app/config/config';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
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

  // Variables para cambio de correo
  public showEmailModal = false;
  public emailStep: 'request' | 'confirm' = 'request';
  public newEmail = '';
  public verificationCode = '';
  public emailError = '';
  public emailSuccess = '';
  public emailLoading = false;

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
    // Verificar si es una licencia permanente
    if (date.toUpperCase() === 'PERMANENT') {
      return 'Permanente';
    }
    // Agregar hora para evitar problemas de zona horaria UTC
    const dateWithTime = date.includes('T') ? date : `${date}T00:00:00`;
    return new Date(dateWithTime).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Verifica si la licencia es permanente
   */
  isPermanentLicense(): boolean {
    return this.licenseInfo?.days_remaining === null;
  }

  /**
   * Obtiene el tipo de licencia
   */
  getLicenseType(): string {
    if (this.isPermanentLicense()) {
      return 'Permanente';
    }
    if (this.licenseInfo?.days_remaining > 335) {
      return 'Anual';
    }
    if (this.licenseInfo?.days_remaining <= 31) {
      return 'Mensual';
    }
    return 'Limitada';
  }

  /**
   * Abre el modal de cambio de correo
   */
  openEmailModal(): void {
    this.showEmailModal = true;
    this.emailStep = 'request';
    this.newEmail = '';
    this.verificationCode = '';
    this.emailError = '';
    this.emailSuccess = '';
  }

  /**
   * Cierra el modal de cambio de correo
   */
  closeEmailModal(): void {
    this.showEmailModal = false;
  }

  /**
   * Inicia la solicitud de cambio de correo
   */
  requestEmailChange(): void {
    if (!this.newEmail || !this.newEmail.includes('@')) {
      this.emailError = 'Por favor, ingrese un correo electrónico válido.';
      return;
    }

    this.emailLoading = true;
    this.emailError = '';

    this.profileService.requestEmailChange(this.newEmail).subscribe({
      next: (resp: any) => {
        this.emailLoading = false;
        this.emailStep = 'confirm';
        this.emailSuccess = resp.message || 'Código enviado a tu correo actual.';
      },
      error: (err: any) => {
        this.emailLoading = false;
        this.emailError = err.error?.message || 'Error al solicitar el cambio de correo.';
      }
    });
  }

  /**
   * Confirma el cambio de correo con el código
   */
  confirmEmailChange(): void {
    if (!this.verificationCode || this.verificationCode.length !== 8) {
      this.emailError = 'El código debe tener 8 caracteres.';
      return;
    }

    this.emailLoading = true;
    this.emailError = '';

    this.profileService.confirmEmailChange(this.verificationCode).subscribe({
      next: (resp: any) => {
        this.emailLoading = false;
        this.emailSuccess = resp.message || 'Correo actualizado correctamente.';

        // Actualizar localmente y cerrar después de un delay
        setTimeout(() => {
          this.getProfileData(); // Recargar datos
          this.closeEmailModal();
        }, 2000);
      },
      error: (err: any) => {
        this.emailLoading = false;
        this.emailError = err.error?.message || 'Código incorrecto o expirado.';
      }
    });
  }
}
