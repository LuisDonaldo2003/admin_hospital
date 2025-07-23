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
  public routes = routes;
  public isDarkMode = false;
  // Valores por defecto recomendados
  readonly DEFAULT_BORDER_COLOR = '#ff9800'; // Naranja suave para contorno
  readonly DEFAULT_CARD_BG_LIGHT = '#f4f7fa'; // Gris azulado claro
  readonly DEFAULT_CARD_BG_DARK = '#232b32';  // Gris azulado oscuro

  public borderColor: string = this.DEFAULT_BORDER_COLOR;
  public cardBgColorLight: string = this.DEFAULT_CARD_BG_LIGHT;
  public cardBgColorDark: string = this.DEFAULT_CARD_BG_DARK;
  public selectedLang: string;
  public userId: string | null = null; // o email si prefieres

  constructor(
    private dataService: DataService,
    private translate: TranslateService,
    private authService: AuthService, // inyecta el servicio de auth
    private settingsService: SettingsService,
  ) {
    // Obtener usuario logueado
    const user = this.authService.user;
    this.userId = user ? user.id : null; // o user.email

    // Cargar colores personalizados del usuario
    this.borderColor = this.getUserSetting('borderColor', this.DEFAULT_BORDER_COLOR);
    this.cardBgColorLight = this.getUserSetting('cardBgColorLight', this.DEFAULT_CARD_BG_LIGHT);
    this.cardBgColorDark = this.getUserSetting('cardBgColorDark', this.DEFAULT_CARD_BG_DARK);

    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit(): void {
    // 1. Respeta el modo global ya aplicado por main.ts
    this.isDarkMode = document.body.classList.contains('dark-mode');

    // 2. Sincroniza primero con el backend para obtener los colores del usuario logueado
    this.settingsService.getSettings().subscribe((settings: any) => {
      // Si hay settings personalizados para el usuario logueado, aplica y guarda en localStorage
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

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.dataService.toggleDarkMode();
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.applyTheme();
  }

  // Guardar color personalizado para el usuario
  private setUserSetting(key: string, value: string) {
    if (!this.userId) return;
    localStorage.setItem(`${key}_${this.userId}`, value);
  }

  // Obtener color personalizado para el usuario
  private getUserSetting(key: string, defaultValue: string): string {
    if (!this.userId) return defaultValue;
    return localStorage.getItem(`${key}_${this.userId}`) || defaultValue;
  }

  // Al personalizar
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

  // Calcula el color de texto ideal (negro o blanco) según el fondo
  private getContrastYIQ(hexcolor: string): string {
    // Elimina el # si existe
    hexcolor = hexcolor.replace('#', '');
    // Convierte a RGB
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    // Calcula el contraste
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }

  applyTheme(): void {
    // Aplica modo oscuro o claro a body
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
      document.body.style.setProperty('--user-card-bg', this.cardBgColorDark);
      document.documentElement.style.setProperty('--user-card-bg', this.cardBgColorDark);
      const textColor = localStorage.getItem('cardTextColorDark') || this.getContrastYIQ(this.cardBgColorDark);
      document.body.style.setProperty('--user-card-text-color', textColor);
      document.documentElement.style.setProperty('--user-card-text-color', textColor);
      // Aplica el color de borde de botón ideal
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
      // Aplica el color de borde de botón ideal
      const btnBorder = localStorage.getItem('cardBtnBorderColorLight') || (textColor === '#000000' ? '#ffffff' : '#000000');
      document.body.style.setProperty('--user-btn-border-color', btnBorder);
      document.documentElement.style.setProperty('--user-btn-border-color', btnBorder);
    }
    // Aplica el color de borde siempre
    document.body.style.setProperty('--user-border-color', this.borderColor);
    document.documentElement.style.setProperty('--user-border-color', this.borderColor);
  }

  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

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

  // Devuelve la clase para el botón según el contraste del color recibido
  getBorderBtnClass(color: string): string {
    if (!color) return '';
    // Si el color es muy claro, usa clase especial para texto oscuro
    const hex = color.replace('#', '');
    if (hex.length !== 6) return '';
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return yiq >= 200 ? 'light-border' : '';
  }

  // Botón para resetear colores al valor por defecto
  resetColorsToDefault(): void {
    const defaults = {
      borderColor: this.DEFAULT_BORDER_COLOR,
      cardBgColorLight: this.DEFAULT_CARD_BG_LIGHT,
      cardBgColorDark: this.DEFAULT_CARD_BG_DARK
    };
    // Restablece en localStorage por usuario
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