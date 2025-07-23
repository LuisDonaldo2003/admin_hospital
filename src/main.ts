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

  // Borde
  const borderColor = getUserSetting('borderColor', '#ff9800');
  root.style.setProperty('--user-border-color', borderColor);
  body.style.setProperty('--user-border-color', borderColor);

  // Fondo card claro
  const cardBgColorLight = getUserSetting('cardBgColorLight', '#f4f7fa');
  root.style.setProperty('--user-card-bg', cardBgColorLight);
  body.style.setProperty('--user-card-bg', cardBgColorLight);

  // Fondo card oscuro
  const cardBgColorDark = getUserSetting('cardBgColorDark', '#232b32');
  // Color de texto claro
  const cardTextColorLight = localStorage.getItem('cardTextColorLight');
  // Color de texto oscuro
  const cardTextColorDark = localStorage.getItem('cardTextColorDark');
  // Modo oscuro
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    body.classList.add('dark-mode');
    if (cardBgColorDark) {
      root.style.setProperty('--user-card-bg', cardBgColorDark);
      body.style.setProperty('--user-card-bg', cardBgColorDark);
    }
    if (cardTextColorDark) {
      root.style.setProperty('--user-card-text-color', cardTextColorDark);
      body.style.setProperty('--user-card-text-color', cardTextColorDark);
    }
  } else {
    body.classList.remove('dark-mode');
    if (cardBgColorLight) {
      root.style.setProperty('--user-card-bg', cardBgColorLight);
      body.style.setProperty('--user-card-bg', cardBgColorLight);
    }
    if (cardTextColorLight) {
      root.style.setProperty('--user-card-text-color', cardTextColorLight);
      body.style.setProperty('--user-card-text-color', cardTextColorLight);
    }
  }
})();

(function applyUserTheme() {
  // Colores por defecto
  const DEFAULT_BORDER_COLOR = '#ff9800';
  const DEFAULT_CARD_BG_LIGHT = '#f4f7fa';
  const DEFAULT_CARD_BG_DARK = '#232b32';

  // Aplica colores desde localStorage
  const borderColor = localStorage.getItem('borderColor') || DEFAULT_BORDER_COLOR;
  const cardBgColorLight = localStorage.getItem('cardBgColorLight') || DEFAULT_CARD_BG_LIGHT;
  const cardBgColorDark = localStorage.getItem('cardBgColorDark') || DEFAULT_CARD_BG_DARK;
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-mode');
    document.body.style.setProperty('--user-card-bg', cardBgColorDark);
    document.documentElement.style.setProperty('--user-card-bg', cardBgColorDark);
  } else {
    document.body.classList.remove('dark-mode');
    document.documentElement.classList.remove('dark-mode');
    document.body.style.setProperty('--user-card-bg', cardBgColorLight);
    document.documentElement.style.setProperty('--user-card-bg', cardBgColorLight);
  }
  document.body.style.setProperty('--user-border-color', borderColor);
  document.documentElement.style.setProperty('--user-border-color', borderColor);
})();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
