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
   * FLUJO:
   * 1. Detecta modo oscuro actual del DOM
   * 2. Intenta cargar configuración desde backend
   * 3. Si existe en backend, actualiza localStorage y variables locales
   * 4. Si no existe, usa valores por defecto
   * 5. Aplica el tema al DOM inyectando variables CSS
   */
  ngOnInit(): void {
    // Respeta el modo global aplicado por main.ts
    this.isDarkMode = document.body.classList.contains('dark-mode');

    // Sincroniza con el backend para obtener los colores del usuario logueado
    this.settingsService.getSettings().subscribe({
      next: (settings: any) => {

        if (settings && (settings.borderColor || settings.cardBgColorLight || settings.cardBgColorDark)) {
          // Actualiza localStorage con los valores del backend
          if (settings.borderColor) this.setUserSetting('borderColor', settings.borderColor);
          if (settings.cardBgColorLight) this.setUserSetting('cardBgColorLight', settings.cardBgColorLight);
          if (settings.cardBgColorDark) this.setUserSetting('cardBgColorDark', settings.cardBgColorDark);

          // Actualiza las variables locales
          this.borderColor = settings.borderColor || this.DEFAULT_BORDER_COLOR;
          this.cardBgColorLight = settings.cardBgColorLight || this.DEFAULT_CARD_BG_LIGHT;
          this.cardBgColorDark = settings.cardBgColorDark || this.DEFAULT_CARD_BG_DARK;
        } else {
          // Si no hay settings personalizados, usa los valores por defecto
          this.borderColor = this.DEFAULT_BORDER_COLOR;
          this.cardBgColorLight = this.DEFAULT_CARD_BG_LIGHT;
          this.cardBgColorDark = this.DEFAULT_CARD_BG_DARK;
        }

        // Aplica el tema completo al DOM
        this.applyTheme();
      },
      error: (error) => {
        console.error('❌ Error al cargar configuración:', error);
        // En caso de error, usa valores por defecto
        this.applyTheme();
      }
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
   * PROCESO:
   * 1. Guarda en localStorage con clave específica del usuario
   * 2. Envía al backend para persistencia en BD
   * 3. Al recibir confirmación, aplica el tema al DOM
   * 4. Inyecta variable CSS --user-border-color
   */
  updateBorderColor(): void {
    

    // 1. Guardar en localStorage
    this.setUserSetting('borderColor', this.borderColor);

    // 2. Enviar al backend
    this.settingsService.updateSettings({
      borderColor: this.borderColor,
      cardBgColorLight: this.cardBgColorLight,
      cardBgColorDark: this.cardBgColorDark
    }).subscribe({
      next: () => {
        // 3. Aplicar el tema al DOM
        this.applyTheme();
      },
      error: (error) => {
        console.error('❌ Error al guardar color de borde:', error);
      }
    });
  }

  /**
   * Actualiza el color de fondo claro y sincroniza con backend
   * PROCESO:
   * 1. Guarda en localStorage
   * 2. Envía al backend
   * 3. Calcula color de texto automáticamente (negro/blanco)
   * 4. Aplica cambios al DOM si está en modo claro
   */
  updateCardBgColorLight(): void {
    

    this.setUserSetting('cardBgColorLight', this.cardBgColorLight);

    this.settingsService.updateSettings({
      borderColor: this.borderColor,
      cardBgColorLight: this.cardBgColorLight,
      cardBgColorDark: this.cardBgColorDark
    }).subscribe({
      next: () => {
        // Recalcula el color de texto según el nuevo fondo
        const textColor = this.getContrastYIQ(this.cardBgColorLight);
        localStorage.setItem('cardTextColorLight', textColor);
        this.applyTheme();
      },
      error: (error) => {
        console.error('❌ Error al guardar color de fondo claro:', error);
      }
    });
  }

  /**
   * Actualiza el color de fondo oscuro y sincroniza con backend
   * PROCESO:
   * 1. Guarda en localStorage
   * 2. Envía al backend
   * 3. Calcula color de texto automáticamente (negro/blanco)
   * 4. Aplica cambios al DOM si está en modo oscuro
   */
  updateCardBgColorDark(): void {
    

    this.setUserSetting('cardBgColorDark', this.cardBgColorDark);

    this.settingsService.updateSettings({
      borderColor: this.borderColor,
      cardBgColorLight: this.cardBgColorLight,
      cardBgColorDark: this.cardBgColorDark
    }).subscribe({
      next: () => {
        // Recalcula el color de texto según el nuevo fondo
        const textColor = this.getContrastYIQ(this.cardBgColorDark);
        localStorage.setItem('cardTextColorDark', textColor);
        this.applyTheme();
      },
      error: (error) => {
        console.error('❌ Error al guardar color de fondo oscuro:', error);
      }
    });
  }

  /**
   * Calcula el color de texto ideal (negro o blanco) según el fondo
   * ALGORITMO YIQ:
   * - Convierte el color hexadecimal a RGB
   * - Aplica fórmula de luminosidad percibida por el ojo humano
   * - YIQ = (R*299 + G*587 + B*114) / 1000
   * - Si YIQ >= 128: fondo claro → texto negro
   * - Si YIQ < 128: fondo oscuro → texto blanco
   * 
   * Esto garantiza siempre la legibilidad del texto
   */
  private getContrastYIQ(hexcolor: string): string {
    // Limpia el símbolo # si existe
    hexcolor = hexcolor.replace('#', '');

    // Extrae componentes RGB
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);

    // Calcula la luminosidad percibida
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    

    return (yiq >= 128) ? '#000000' : '#ffffff';
  }

  /**
   * Aplica el tema visual (colores y modo) al documento
   * PROCESO DE INYECCIÓN CSS:
   * 1. Aplica/remueve clase 'dark-mode' al body y html
   * 2. Inyecta variables CSS en body y documentElement:
   *    - --user-card-bg: Color de fondo de tarjetas
   *    - --user-card-text-color: Color de texto calculado automáticamente
   *    - --user-border-color: Color de bordes y acentos
   *    - --user-btn-border-color: Color de borde de botones (inverso del texto)
   * 
   * Estas variables CSS son consumidas por todos los componentes SCSS
   * mediante var(--user-card-bg, fallback)
   */
  applyTheme(): void {
    

    if (this.isDarkMode) {
      // MODO OSCURO
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');

      // Inyecta color de fondo oscuro
      document.body.style.setProperty('--user-card-bg', this.cardBgColorDark);
      document.documentElement.style.setProperty('--user-card-bg', this.cardBgColorDark);

      // Calcula y aplica color de texto con contraste
      const textColor = localStorage.getItem('cardTextColorDark') || this.getContrastYIQ(this.cardBgColorDark);
      document.body.style.setProperty('--user-card-text-color', textColor);
      document.documentElement.style.setProperty('--user-card-text-color', textColor);

      // Color de borde de botones (inverso del texto para contraste)
      const btnBorder = localStorage.getItem('cardBtnBorderColorDark') || (textColor === '#000000' ? '#ffffff' : '#000000');
      document.body.style.setProperty('--user-btn-border-color', btnBorder);
      document.documentElement.style.setProperty('--user-btn-border-color', btnBorder);

      
    } else {
      // MODO CLARO
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');

      // Inyecta color de fondo claro
      document.body.style.setProperty('--user-card-bg', this.cardBgColorLight);
      document.documentElement.style.setProperty('--user-card-bg', this.cardBgColorLight);

      // Calcula y aplica color de texto con contraste
      const textColor = localStorage.getItem('cardTextColorLight') || this.getContrastYIQ(this.cardBgColorLight);
      document.body.style.setProperty('--user-card-text-color', textColor);
      document.documentElement.style.setProperty('--user-card-text-color', textColor);

      // Color de borde de botones (inverso del texto para contraste)
      const btnBorder = localStorage.getItem('cardBtnBorderColorLight') || (textColor === '#000000' ? '#ffffff' : '#000000');
      document.body.style.setProperty('--user-btn-border-color', btnBorder);
      document.documentElement.style.setProperty('--user-btn-border-color', btnBorder);

      
    }

    // Inyecta color de borde global (aplicado en ambos modos)
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
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 200 ? 'light-border' : '';
  }

  /**
   * Restablece los colores al valor por defecto
   * PROCESO:
   * 1. Define valores por defecto de la plataforma hospitalaria
   * 2. Actualiza localStorage del usuario
   * 3. Envía al backend para persistencia
   * 4. Actualiza variables locales
   * 5. Aplica el tema restaurado al DOM
   */
  resetColorsToDefault(): void {
    

    const defaults = {
      borderColor: this.DEFAULT_BORDER_COLOR,       // #0B7285 - Azul médico
      cardBgColorLight: this.DEFAULT_CARD_BG_LIGHT, // #F8FFFE - Blanco hospitalario
      cardBgColorDark: this.DEFAULT_CARD_BG_DARK    // #1A2332 - Azul marino oscuro
    };

    // Actualiza localStorage
    this.setUserSetting('borderColor', defaults.borderColor);
    this.setUserSetting('cardBgColorLight', defaults.cardBgColorLight);
    this.setUserSetting('cardBgColorDark', defaults.cardBgColorDark);

    // Limpia colores de texto calculados para forzar recálculo
    localStorage.removeItem('cardTextColorLight');
    localStorage.removeItem('cardTextColorDark');
    localStorage.removeItem('cardBtnBorderColorLight');
    localStorage.removeItem('cardBtnBorderColorDark');

    // Envía al backend
    this.settingsService.updateSettings(defaults).subscribe({
      next: () => {
        

        // Actualiza variables locales
        this.borderColor = defaults.borderColor;
        this.cardBgColorLight = defaults.cardBgColorLight;
        this.cardBgColorDark = defaults.cardBgColorDark;

        // Aplica el tema al DOM
        this.applyTheme();
      },
      error: (error) => {
        console.error('❌ Error al restaurar colores:', error);
      }
    });
  }
}