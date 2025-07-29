import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityMonitorService {
  private lastActivity: number = Date.now();
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 7 * 60 * 60 * 1000; // 7 HORAS - SINCRONIZADO CON JWT_TTL
  private readonly WARNING_TIME = 5 * 60 * 1000; // ADVERTIR 5 MINUTOS ANTES
  private readonly CHECK_INTERVAL = 30 * 1000; // VERIFICAR CADA 30 SEGUNDOS

  constructor(private authService: AuthService) {
    console.log('🚀 ActivityMonitorService iniciado');
    this.initActivityMonitoring();
  }

  private initActivityMonitoring(): void {
    console.log('📝 Configurando monitoreo de actividad...');
    
    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.updateLastActivity(), true);
    });

    console.log('🎯 Eventos de actividad configurados:', events);
    
    // Verificar inactividad periódicamente
    this.startInactivityCheck();
  }

  private updateLastActivity(): void {
    this.lastActivity = Date.now();
    // Solo mostrar cada 30 segundos para no saturar la consola
    if (!this.lastLogTime || (Date.now() - this.lastLogTime) > 30000) {
      console.log('👤 Actividad detectada:', new Date().toLocaleTimeString());
      this.lastLogTime = Date.now();
    }
  }

  private lastLogTime: number = 0;

  private startInactivityCheck(): void {
    console.log('⏰ Iniciando verificación de inactividad cada 30 segundos');
    
    setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      const minutesInactive = Math.floor(timeSinceLastActivity / (60 * 1000));
      
      // Log cada 5 minutos para mostrar que está funcionando
      if (minutesInactive > 0 && minutesInactive % 5 === 0) {
        console.log(`⏱️ Usuario inactivo por ${minutesInactive} minutos`);
      }
      
      // Verificar si el token está próximo a expirar o ya expiró
      if (this.authService.isTokenExpired()) {
        console.log('🔒 Token expirado - cerrando sesión');
        this.authService.logout();
        return;
      }
      
      // Si hay mucha inactividad, cerrar sesión
      if (timeSinceLastActivity > this.INACTIVITY_TIMEOUT) {
        console.log('😴 Usuario inactivo por más tiempo del permitido - cerrando sesión');
        this.authService.logout();
        return;
      }

      // Renovar token si está próximo a expirar y hay actividad reciente
      if (this.authService.isTokenExpiringSoon() && timeSinceLastActivity < this.WARNING_TIME) {
        console.log('🔄 Token próximo a expirar - renovando automáticamente');
        this.authService.refreshToken().subscribe({
          next: () => console.log('✅ Token renovado automáticamente'),
          error: (err) => {
            console.error('❌ Error al renovar token automáticamente:', err);
            this.authService.logout();
          }
        });
      }
    }, this.CHECK_INTERVAL);
  }

  // Método para extender la sesión manualmente
  extendSession(): void {
    this.updateLastActivity();
    
    this.authService.refreshToken().subscribe({
      next: () => {
        console.log('Sesión extendida exitosamente');
        this.updateLastActivity(); // Actualizar actividad después del refresh
      },
      error: (err) => {
        console.error('Error al extender sesión:', err);
        this.authService.logout();
      }
    });
  }

  // Obtener tiempo restante hasta el logout por inactividad
  getTimeUntilLogout(): number {
    const timeSinceLastActivity = Date.now() - this.lastActivity;
    return Math.max(0, this.INACTIVITY_TIMEOUT - timeSinceLastActivity);
  }

  // Obtener tiempo restante hasta que expire el token
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
