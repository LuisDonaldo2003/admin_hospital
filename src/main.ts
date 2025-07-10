import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// Restaurar variables CSS personalizadas desde localStorage al cargar la app
(function restoreCustomThemeVars() {
  const root = document.documentElement;
  const body = document.body;
  // Borde
  const borderColor = localStorage.getItem('borderColor');
  if (borderColor) {
    root.style.setProperty('--user-border-color', borderColor);
    body.style.setProperty('--user-border-color', borderColor);
  }
  // Fondo card claro
  const cardBgColorLight = localStorage.getItem('cardBgColorLight');
  if (cardBgColorLight) {
    root.style.setProperty('--user-card-bg', cardBgColorLight);
    body.style.setProperty('--user-card-bg', cardBgColorLight);
  }
  // Fondo card oscuro
  const cardBgColorDark = localStorage.getItem('cardBgColorDark');
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

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
