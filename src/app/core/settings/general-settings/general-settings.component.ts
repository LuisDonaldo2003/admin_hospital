// Importación de módulos y servicios necesarios para el componente
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/shared/data/data.service';
import { AuthService } from 'src/app/shared/auth/auth.service'; // importa tu servicio de auth
import { routes } from 'src/app/shared/routes/routes';
import { SettingsService } from './service/settings.service';

// Definición de una interfaz para manejar listas de datos
interface data {
  value: string;
}

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [
    CommonModule, // Módulo común de Angular
    FormsModule,  // Módulo para formularios
    RouterModule, // Módulo para manejo de rutas
    TranslateModule // Módulo para traducciones
  ],
  templateUrl: './general-settings.component.html', // Ruta del archivo HTML asociado
  styleUrls: ['./general-settings.component.scss'] // Ruta del archivo de estilos asociado
})
export class GeneralSettingsComponent implements OnInit {
  // Rutas disponibles para navegación
  public routes = routes;
  // Estado del modo oscuro
  public isDarkMode = false;
  // Valores por defecto para los colores de la plataforma hospitalaria
  readonly DEFAULT_BORDER_COLOR = '#0B7285'; // Azul médico profesional
  readonly DEFAULT_CARD_BG_LIGHT = '#F8FFFE'; // Blanco hospitalario
  readonly DEFAULT_CARD_BG_DARK = '#1A2332';  // Azul marino oscuro

  // Colores personalizados actuales
  public borderColor: string = this.DEFAULT_BORDER_COLOR;
  public cardBgColorLight: string = this.DEFAULT_CARD_BG_LIGHT;
  public cardBgColorDark: string = this.DEFAULT_CARD_BG_DARK;
  // Idioma seleccionado
  public selectedLang: string;
  // ID del usuario actual
  public userId: string | null = null;

  // Inyecta los servicios necesarios
  constructor(
    private dataService: DataService,
    private translate: TranslateService,
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {
    // Obtiene el usuario logueado
    const user = this.authService.user;
    this.userId = user ? user.id : null;

    // Carga colores personalizados del usuario
    this.borderColor = this.getUserSetting('borderColor', this.DEFAULT_BORDER_COLOR);
    this.cardBgColorLight = this.getUserSetting('cardBgColorLight', this.DEFAULT_CARD_BG_LIGHT);
    this.cardBgColorDark = this.getUserSetting('cardBgColorDark', this.DEFAULT_CARD_BG_DARK);

    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  /**
   * Inicializa el componente y sincroniza los colores con el backend
   */
  ngOnInit(): void {
    // Respeta el modo global aplicado por main.ts
    this.isDarkMode = document.body.classList.contains('dark-mode');

    // Sincroniza con el backend para obtener los colores del usuario logueado
    this.settingsService.getSettings().subscribe((settings: any) => {
      if (settings && (settings.borderColor || settings.cardBgColorLight || settings.cardBgColorDark)) {
        if (settings.borderColor) this.setUserSetting('borderColor', settings.borderColor);
        if (settings.cardBgColorLight) this.setUserSetting('cardBgColorLight', settings.cardBgColorLight);
        if (settings.cardBgColorDark) this.setUserSetting('cardBgColorDark', settings.cardBgColorDark);

        this.borderColor = settings.borderColor || this.DEFAULT_BORDER_COLOR;
        this.cardBgColorLight = settings.cardBgColorLight || this.DEFAULT_CARD_BG_LIGHT;
        this.cardBgColorDark = settings.cardBgColorDark || this.DEFAULT_CARD_BG_DARK;
      } else {
        // Si no hay settings personalizados, usa los valores por defecto
        this.borderColor = this.DEFAULT_BORDER_COLOR;
        this.cardBgColorLight = this.DEFAULT_CARD_BG_LIGHT;
        this.cardBgColorDark = this.DEFAULT_CARD_BG_DARK;
      }
      this.applyTheme();
    });
  }

  /**
   * Alterna el modo oscuro/claro
   */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.dataService.toggleDarkMode();
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.applyTheme();
  }

  /**
   * Guarda un color personalizado para el usuario en localStorage
   */
  private setUserSetting(key: string, value: string) {
    if (!this.userId) return;
    localStorage.setItem(`${key}_${this.userId}`, value);
  }

  /**
   * Obtiene un color personalizado para el usuario desde localStorage
   */
  private getUserSetting(key: string, defaultValue: string): string {
    if (!this.userId) return defaultValue;
    return localStorage.getItem(`${key}_${this.userId}`) || defaultValue;
  }

  /**
   * Actualiza el color de borde y sincroniza con backend
   */
  updateBorderColor(): void {
    this.setUserSetting('borderColor', this.borderColor);
    this.settingsService.updateSettings({
      borderColor: this.borderColor,
      cardBgColorLight: this.cardBgColorLight,
      cardBgColorDark: this.cardBgColorDark
    }).subscribe(() => {
      this.applyTheme();
    });
  }

  /**
   * Actualiza el color de fondo claro y sincroniza con backend
   */
  updateCardBgColorLight(): void {
    this.setUserSetting('cardBgColorLight', this.cardBgColorLight);
    this.settingsService.updateSettings({
      borderColor: this.borderColor,
      cardBgColorLight: this.cardBgColorLight,
      cardBgColorDark: this.cardBgColorDark
    }).subscribe(() => {
      this.applyTheme();
    });
  }

  /**
   * Actualiza el color de fondo oscuro y sincroniza con backend
   */
  updateCardBgColorDark(): void {
    this.setUserSetting('cardBgColorDark', this.cardBgColorDark);
    this.settingsService.updateSettings({
      borderColor: this.borderColor,
      cardBgColorLight: this.cardBgColorLight,
      cardBgColorDark: this.cardBgColorDark
    }).subscribe(() => {
      this.applyTheme();
    });
  }

  /**
   * Calcula el color de texto ideal (negro o blanco) según el fondo
   */
  private getContrastYIQ(hexcolor: string): string {
    hexcolor = hexcolor.replace('#', '');
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }

  /**
   * Aplica el tema visual (colores y modo) al documento
   */
  applyTheme(): void {
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
      document.body.style.setProperty('--user-card-bg', this.cardBgColorDark);
      document.documentElement.style.setProperty('--user-card-bg', this.cardBgColorDark);
      const textColor = localStorage.getItem('cardTextColorDark') || this.getContrastYIQ(this.cardBgColorDark);
      document.body.style.setProperty('--user-card-text-color', textColor);
      document.documentElement.style.setProperty('--user-card-text-color', textColor);
      const btnBorder = localStorage.getItem('cardBtnBorderColorDark') || (textColor === '#000000' ? '#ffffff' : '#000000');
      document.body.style.setProperty('--user-btn-border-color', btnBorder);
      document.documentElement.style.setProperty('--user-btn-border-color', btnBorder);
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
      document.body.style.setProperty('--user-card-bg', this.cardBgColorLight);
      document.documentElement.style.setProperty('--user-card-bg', this.cardBgColorLight);
      const textColor = localStorage.getItem('cardTextColorLight') || this.getContrastYIQ(this.cardBgColorLight);
      document.body.style.setProperty('--user-card-text-color', textColor);
      document.documentElement.style.setProperty('--user-card-text-color', textColor);
      const btnBorder = localStorage.getItem('cardBtnBorderColorLight') || (textColor === '#000000' ? '#ffffff' : '#000000');
      document.body.style.setProperty('--user-btn-border-color', btnBorder);
      document.documentElement.style.setProperty('--user-btn-border-color', btnBorder);
    }
    document.body.style.setProperty('--user-border-color', this.borderColor);
    document.documentElement.style.setProperty('--user-border-color', this.borderColor);
  }

  /**
   * Alterna el idioma entre español e inglés
   */
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  /**
   * Establece el idioma seleccionado
   */
  setLanguage(lang: string): void {
    this.selectedLang = lang;
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  /**
   * Establece el modo de color (oscuro o claro)
   */
  setTheme(isDark: boolean): void {
    this.isDarkMode = isDark;
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    this.dataService.toggleDarkMode();
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.applyTheme();
  }

  // Listas de ejemplo para selectores (no funcionales en la UI actual)
  selectedList1: data[] = [
    { value: 'Select' },
    { value: 'California' },
    { value: 'Tasmania' },
    { value: 'Auckland' },
    { value: 'Marlborough' }
  ];

  selectedList2: data[] = [
    { value: 'India' },
    { value: 'London' },
    { value: 'France' },
    { value: 'USA' }
  ];

  /**
   * Devuelve la clase para el botón según el contraste del color recibido
   */
  getBorderBtnClass(color: string): string {
    if (!color) return '';
    const hex = color.replace('#', '');
    if (hex.length !== 6) return '';
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return yiq >= 200 ? 'light-border' : '';
  }

  /**
   * Restablece los colores al valor por defecto
   */
  resetColorsToDefault(): void {
    const defaults = {
      borderColor: this.DEFAULT_BORDER_COLOR,
      cardBgColorLight: this.DEFAULT_CARD_BG_LIGHT,
      cardBgColorDark: this.DEFAULT_CARD_BG_DARK
    };
    this.setUserSetting('borderColor', defaults.borderColor);
    this.setUserSetting('cardBgColorLight', defaults.cardBgColorLight);
    this.setUserSetting('cardBgColorDark', defaults.cardBgColorDark);
    this.settingsService.updateSettings(defaults).subscribe(() => {
      this.borderColor = defaults.borderColor;
      this.cardBgColorLight = defaults.cardBgColorLight;
      this.cardBgColorDark = defaults.cardBgColorDark;
      this.applyTheme();
    });
  }
}