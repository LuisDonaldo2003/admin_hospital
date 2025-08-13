// Servicio para monitorear la actividad del usuario y gestionar la sesión
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityMonitorService {
  // Marca el timestamp de la última actividad detectada
  private lastActivity: number = Date.now();
  // Timer para verificar inactividad
  private inactivityTimer: any;
  // Tiempo máximo permitido de inactividad antes de cerrar sesión (7 horas)
  private readonly INACTIVITY_TIMEOUT = 7 * 60 * 60 * 1000;
  // Tiempo antes de expirar el token para advertir y renovar (5 minutos)
  private readonly WARNING_TIME = 5 * 60 * 1000;
  // Intervalo de verificación de actividad (cada 30 segundos)
  private readonly CHECK_INTERVAL = 30 * 1000;

  /**
   * Inyecta el servicio de autenticación y comienza el monitoreo de actividad
   */
  constructor(private authService: AuthService) {
    this.initActivityMonitoring();
  }

  /**
   * Inicializa el monitoreo de actividad y los eventos del usuario
   */
  private initActivityMonitoring(): void {
    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, () => this.updateLastActivity(), true);
    });
    // Verificar inactividad periódicamente
    this.startInactivityCheck();
  }

  /**
   * Actualiza el timestamp de la última actividad detectada
   */
  private updateLastActivity(): void {
    this.lastActivity = Date.now();
  }

  private lastLogTime: number = 0;

  /**
   * Inicia el timer para verificar inactividad y gestionar la sesión
   */
  private startInactivityCheck(): void {
    setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      const minutesInactive = Math.floor(timeSinceLastActivity / (60 * 1000));
      // Verificar si el token está próximo a expirar o ya expiró
      if (this.authService.isTokenExpired()) {
        this.authService.logout();
        return;
      }
      // Si hay mucha inactividad, cerrar sesión
      if (timeSinceLastActivity > this.INACTIVITY_TIMEOUT) {
        this.authService.logout();
        return;
      }
      // Renovar token si está próximo a expirar y hay actividad reciente
      if (this.authService.isTokenExpiringSoon() && timeSinceLastActivity < this.WARNING_TIME) {
        this.authService.refreshToken().subscribe({
          next: () => {
            this.updateLastActivity();
          },
          error: () => {
            this.authService.logout();
          }
        });
      }
    }, this.CHECK_INTERVAL);
  }

  /**
   * Extiende la sesión manualmente y renueva el token
   */
  extendSession(): void {
    this.updateLastActivity();
    this.authService.refreshToken().subscribe({
      next: () => {
        this.updateLastActivity();
      },
      error: () => {
        this.authService.logout();
      }
    });
  }

  /**
   * Devuelve el tiempo restante hasta el logout por inactividad (ms)
   */
  getTimeUntilLogout(): number {
    const timeSinceLastActivity = Date.now() - this.lastActivity;
    return Math.max(0, this.INACTIVITY_TIMEOUT - timeSinceLastActivity);
  }

  /**
   * Devuelve el tiempo restante hasta que expire el token (ms)
   */
  getTimeUntilTokenExpiry(): number {
    const token = localStorage.getItem('token');
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      return Math.max(0, (expirationTime - currentTime) * 1000);
    } catch {
      return 0;
    }
  }
}
