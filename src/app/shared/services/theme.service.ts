/**
 * Servicio centralizado para gestionar el tema visual (colores y modo oscuro/claro)
 * Este servicio debe ejecutarse DESPUÉS del login para cargar los colores del usuario correcto
 */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Valores por defecto de la plataforma hospitalaria
  private readonly DEFAULT_BORDER_COLOR = '#0B7285'; // Azul médico profesional
  private readonly DEFAULT_CARD_BG_LIGHT = '#F8FFFE'; // Blanco hospitalario
  private readonly DEFAULT_CARD_BG_DARK = '#1A2332';  // Azul marino oscuro

  constructor() {}

  /**
   * Aplica el tema del usuario autenticado
   * DEBE llamarse después del login exitoso
   */
  applyUserTheme(): void {
    // Obtener usuario directamente del localStorage para evitar dependencia circular
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user ? user.id : null;

    console.log('🎨 ThemeService: Aplicando tema para usuario:', userId);

    // Obtener colores personalizados del usuario actual
    const borderColor = this.getUserSetting('borderColor', this.DEFAULT_BORDER_COLOR, userId);
    const cardBgColorLight = this.getUserSetting('cardBgColorLight', this.DEFAULT_CARD_BG_LIGHT, userId);
    const cardBgColorDark = this.getUserSetting('cardBgColorDark', this.DEFAULT_CARD_BG_DARK, userId);
    
    // Obtener modo oscuro
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    console.log('🎨 Colores cargados:', { borderColor, cardBgColorLight, cardBgColorDark, isDarkMode });

    // Aplicar tema al DOM
    this.applyThemeToDOM(borderColor, cardBgColorLight, cardBgColorDark, isDarkMode);
  }

  /**
   * Aplica los colores al DOM completo
   */
  private applyThemeToDOM(
    borderColor: string, 
    cardBgColorLight: string, 
    cardBgColorDark: string, 
    isDarkMode: boolean
  ): void {
    const root = document.documentElement;
    const body = document.body;

    // Aplicar color de borde
    root.style.setProperty('--user-border-color', borderColor);
    body.style.setProperty('--user-border-color', borderColor);

    if (isDarkMode) {
      // Modo oscuro
      body.classList.add('dark-mode');
      root.classList.add('dark-mode');
      
      root.style.setProperty('--user-card-bg', cardBgColorDark);
      body.style.setProperty('--user-card-bg', cardBgColorDark);
      
      // Calcular color de texto
      const textColor = localStorage.getItem('cardTextColorDark') || this.getContrastYIQ(cardBgColorDark);
      root.style.setProperty('--user-card-text-color', textColor);
      body.style.setProperty('--user-card-text-color', textColor);
      
      console.log('🌙 Modo Oscuro aplicado');
    } else {
      // Modo claro
      body.classList.remove('dark-mode');
      root.classList.remove('dark-mode');
      
      root.style.setProperty('--user-card-bg', cardBgColorLight);
      body.style.setProperty('--user-card-bg', cardBgColorLight);
      
      // Calcular color de texto
      const textColor = localStorage.getItem('cardTextColorLight') || this.getContrastYIQ(cardBgColorLight);
      root.style.setProperty('--user-card-text-color', textColor);
      body.style.setProperty('--user-card-text-color', textColor);
      
      console.log('☀️ Modo Claro aplicado');
    }

    console.log('✅ Tema aplicado exitosamente');
  }

  /**
   * Obtiene una configuración del usuario desde localStorage
   */
  private getUserSetting(key: string, defaultValue: string, userId: string | null): string {
    if (!userId) {
      console.warn(`⚠️ No hay userId, usando valor por defecto para ${key}`);
      return defaultValue;
    }
    const value = localStorage.getItem(`${key}_${userId}`) || defaultValue;
    console.log(`📦 ${key}_${userId} = ${value}`);
    return value;
  }

  /**
   * Calcula el color de texto ideal según el fondo (YIQ)
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
   * Limpia los colores del usuario actual (útil al cerrar sesión)
   */
  clearUserTheme(): void {
    console.log('🧹 Limpiando tema del usuario y aplicando valores por defecto');
    
    // Aplicar valores por defecto
    this.applyThemeToDOM(
      this.DEFAULT_BORDER_COLOR,
      this.DEFAULT_CARD_BG_LIGHT,
      this.DEFAULT_CARD_BG_DARK,
      false // Modo claro por defecto
    );
  }
}
