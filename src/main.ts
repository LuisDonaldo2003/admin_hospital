import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// Restaurar variables CSS personalizadas desde localStorage al cargar la app
(function restoreCustomThemeVars() {
  const root = document.documentElement;
  const body = document.body;
  // Obtén el usuario logueado
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = user ? user.id : null;

  function getUserSetting(key: string, def: string) {
    if (!userId) return def;
    return localStorage.getItem(`${key}_${userId}`) || def;
  }

  // Borde - usar el mismo color por defecto que general-settings
  const borderColor = getUserSetting('borderColor', '#0B7285');
  root.style.setProperty('--user-border-color', borderColor);
  body.style.setProperty('--user-border-color', borderColor);

  // Fondo card claro
  const cardBgColorLight = getUserSetting('cardBgColorLight', '#F8FFFE');
  root.style.setProperty('--user-card-bg', cardBgColorLight);
  body.style.setProperty('--user-card-bg', cardBgColorLight);

  // Fondo card oscuro
  const cardBgColorDark = getUserSetting('cardBgColorDark', '#1A2332');
  // Modo oscuro
  const isDark = localStorage.getItem('darkMode') === 'true';
  
  // Función auxiliar para calcular color de texto basado en contraste
  function getContrastYIQ(hexcolor: string): string {
    hexcolor = hexcolor.replace('#', '');
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }

  if (isDark) {
    body.classList.add('dark-mode');
    root.style.setProperty('--user-card-bg', cardBgColorDark);
    body.style.setProperty('--user-card-bg', cardBgColorDark);
    
    // EN MODO OSCURO, FORZAR TEXTO BLANCO SIEMPRE PARA LIST-ARCHIVE
    root.style.setProperty('--user-card-text-color', '#ffffff');
    body.style.setProperty('--user-card-text-color', '#ffffff');
  } else {
    body.classList.remove('dark-mode');
    root.style.setProperty('--user-card-bg', cardBgColorLight);
    body.style.setProperty('--user-card-bg', cardBgColorLight);
    
    // Calcular y establecer color de texto automáticamente
    const textColorLight = getContrastYIQ(cardBgColorLight);
    root.style.setProperty('--user-card-text-color', textColorLight);
    body.style.setProperty('--user-card-text-color', textColorLight);
  }
})();

(function applyUserTheme() {
  // Colores por defecto para plataforma hospitalaria - Colores profesionales
  const DEFAULT_BORDER_COLOR = '#0B7285'; // Azul médico profesional (teal oscuro)
  const DEFAULT_CARD_BG_LIGHT = '#F8FFFE'; // Blanco hospitalario con tinte azul muy sutil
  const DEFAULT_CARD_BG_DARK = '#1A2332';  // Azul marino oscuro profesional

  // Aplica colores desde localStorage
  const borderColor = localStorage.getItem('borderColor') || DEFAULT_BORDER_COLOR;
  const cardBgColorLight = localStorage.getItem('cardBgColorLight') || DEFAULT_CARD_BG_LIGHT;
  const cardBgColorDark = localStorage.getItem('cardBgColorDark') || DEFAULT_CARD_BG_DARK;
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // Función auxiliar para calcular color de texto basado en contraste
  function getContrastYIQ(hexcolor: string): string {
    hexcolor = hexcolor.replace('#', '');
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }

  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-mode');
    document.body.style.setProperty('--user-card-bg', cardBgColorDark);
    document.documentElement.style.setProperty('--user-card-bg', cardBgColorDark);
    
    // EN MODO OSCURO, FORZAR TEXTO BLANCO SIEMPRE PARA LIST-ARCHIVE
    document.body.style.setProperty('--user-card-text-color', '#ffffff');
    document.documentElement.style.setProperty('--user-card-text-color', '#ffffff');
  } else {
    document.body.classList.remove('dark-mode');
    document.documentElement.classList.remove('dark-mode');
    document.body.style.setProperty('--user-card-bg', cardBgColorLight);
    document.documentElement.style.setProperty('--user-card-bg', cardBgColorLight);
    
    // Establecer color de texto basado en el fondo
    const textColor = getContrastYIQ(cardBgColorLight);
    document.body.style.setProperty('--user-card-text-color', textColor);
    document.documentElement.style.setProperty('--user-card-text-color', textColor);
  }
  document.body.style.setProperty('--user-border-color', borderColor);
  document.documentElement.style.setProperty('--user-border-color', borderColor);
})();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
