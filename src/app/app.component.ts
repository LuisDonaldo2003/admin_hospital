import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './shared/auth/auth.service';
import { SettingsService } from './core/settings/general-settings/service/settings.service';
import { ActivityMonitorService } from './shared/services/activity-monitor.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'preclinic-angular';
  private authSubscription: Subscription | undefined;

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private activityMonitor: ActivityMonitorService
  ) {
    const savedLang = localStorage.getItem('language') || 'en';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }

  ngOnInit(): void {
    // 1. Aplica los colores personalizados desde localStorage al arrancar (antes de la petición al backend)
    const user = this.authService.user;
    const userId = user ? user.id : null;
    this.applyTheme({
      borderColor: userId ? localStorage.getItem(`borderColor_${userId}`) || '#ff9800' : '#ff9800',
      cardBgColorLight: userId ? localStorage.getItem(`cardBgColorLight_${userId}`) || '#f4f7fa' : '#f4f7fa',
      cardBgColorDark: userId ? localStorage.getItem(`cardBgColorDark_${userId}`) || '#232b32' : '#232b32'
    });

    // 2. Suscríbete al estado de autenticación y sincroniza con el backend
    this.authSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        // Aplica inmediatamente los colores del usuario actual
        this.applyTheme({
          borderColor: localStorage.getItem(`borderColor_${user.id}`) || '#ff9800',
          cardBgColorLight: localStorage.getItem(`cardBgColorLight_${user.id}`) || '#f4f7fa',
          cardBgColorDark: localStorage.getItem(`cardBgColorDark_${user.id}`) || '#232b32'
        });
        this.settingsService.getSettings().subscribe((settings: any) => {
          // Si hay settings personalizados, verifica si cambiaron y actualiza
          let changed = false;
          if (settings && (settings.borderColor || settings.cardBgColorLight || settings.cardBgColorDark)) {
            if (settings.borderColor && localStorage.getItem(`borderColor_${user.id}`) !== settings.borderColor) {
              localStorage.setItem(`borderColor_${user.id}`, settings.borderColor);
              changed = true;
            }
            if (settings.cardBgColorLight && localStorage.getItem(`cardBgColorLight_${user.id}`) !== settings.cardBgColorLight) {
              localStorage.setItem(`cardBgColorLight_${user.id}`, settings.cardBgColorLight);
              changed = true;
            }
            if (settings.cardBgColorDark && localStorage.getItem(`cardBgColorDark_${user.id}`) !== settings.cardBgColorDark) {
              localStorage.setItem(`cardBgColorDark_${user.id}`, settings.cardBgColorDark);
              changed = true;
            }
            // Aplica siempre los colores actualizados del usuario
            this.applyTheme({
              borderColor: settings.borderColor || localStorage.getItem(`borderColor_${user.id}`) || '#ff9800',
              cardBgColorLight: settings.cardBgColorLight || localStorage.getItem(`cardBgColorLight_${user.id}`) || '#f4f7fa',
              cardBgColorDark: settings.cardBgColorDark || localStorage.getItem(`cardBgColorDark_${user.id}`) || '#232b32'
            });
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  // Aplica los colores al tema global
  private applyTheme({ borderColor, cardBgColorLight, cardBgColorDark }: any) {
    // Aplica borde
    if (borderColor) {
      document.documentElement.style.setProperty('--user-border-color', borderColor);
      document.body.style.setProperty('--user-border-color', borderColor);
    }
    // Aplica fondo de card según modo
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode && cardBgColorDark) {
      document.documentElement.style.setProperty('--user-card-bg', cardBgColorDark);
      document.body.style.setProperty('--user-card-bg', cardBgColorDark);
    } else if (cardBgColorLight) {
      document.documentElement.style.setProperty('--user-card-bg', cardBgColorLight);
      document.body.style.setProperty('--user-card-bg', cardBgColorLight);
    }
    // Aplica color de texto ideal
    const cardBg = isDarkMode ? cardBgColorDark : cardBgColorLight;
    if (cardBg) {
      const textColor = this.getContrastYIQ(cardBg);
      document.documentElement.style.setProperty('--user-card-text-color', textColor);
      document.body.style.setProperty('--user-card-text-color', textColor);
    }
  }

  // Utilidad para contraste
  private getContrastYIQ(hexcolor: string): string {
    hexcolor = hexcolor.replace('#', '');
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }
}
