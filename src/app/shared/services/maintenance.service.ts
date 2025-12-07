// Servicio para manejar el modo de mantenimiento
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from '../auth/auth.service';

export interface MaintenanceStatus {
  maintenance_mode: boolean;
  status: string;
  message: string;
  timestamp: string;
  maintenance_info?: {
    message: string;
    retry_after: number;
    allowed_ips?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private maintenanceStatus = new BehaviorSubject<boolean>(false);
  private maintenanceMessage = new BehaviorSubject<string>('');
  private checkInterval = 30000; // 30 segundos
  private wasInMaintenance = false;
  private isInitialized = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.initializeService();
  }

  /**
   * Inicializa el servicio con una verificación inicial
   */
  private initializeService(): void {
    // Hacer una verificación inicial inmediata
    const currentUrl = this.router.url;
    const isOnMaintenancePage = currentUrl.includes('/maintenance');

    this.checkMaintenanceStatus().subscribe(status => {
      this.maintenanceStatus.next(status.maintenance_mode);
      this.maintenanceMessage.next(status.message);

      if (status.maintenance_mode) {
        // Sistema está en mantenimiento
        this.wasInMaintenance = true;

        if (status.maintenance_info) {
          localStorage.setItem('maintenance_info', JSON.stringify(status.maintenance_info));
        }

        // Si NO estamos en la página de mantenimiento, forzar redirección inmediata
        if (!isOnMaintenancePage) {
          // Si hay usuario logueado, cerrar sesión
          if (this.isUserLoggedIn()) {
            this.authService.logout();
          }

          // Limpiar storage
          localStorage.clear();
          sessionStorage.clear();

          // Redirección forzada inmediata
          window.location.href = '/maintenance';
          return; // No continuar con inicialización normal
        }
      } else {
        // Sistema NO está en mantenimiento
        if (isOnMaintenancePage && this.wasInMaintenance) {
          this.maintenanceMessage.next('¡Sistema reactivado! Redirigiendo al login...');
          this.scheduleRedirection();
        }
      }

      this.isInitialized = true;
      this.startPeriodicCheck();
    });
  }

  /**
   * Obtiene el estado observable del modo de mantenimiento
   */
  get isMaintenanceMode$(): Observable<boolean> {
    return this.maintenanceStatus.asObservable();
  }

  /**
   * Obtiene el mensaje observable del modo de mantenimiento
   */
  get maintenanceMessage$(): Observable<string> {
    return this.maintenanceMessage.asObservable();
  }

  /**
   * Verifica el estado de mantenimiento del servidor
   */
  checkMaintenanceStatus(): Observable<MaintenanceStatus> {
    return this.http.get<MaintenanceStatus>(`${URL_SERVICIOS}/maintenance/status`)
      .pipe(
        catchError(() => {
          // Si falla la petición, asumir que no está en mantenimiento
          return new Observable<MaintenanceStatus>(observer => {
            observer.next({
              maintenance_mode: false,
              status: 'active',
              message: 'Sistema activo',
              timestamp: new Date().toISOString()
            });
            observer.complete();
          });
        })
      );
  }

  /**
   * Verificación simple del estado de mantenimiento
   */
  checkMaintenance(): Observable<boolean> {
    return this.http.get<{is_maintenance: boolean}>(`${URL_SERVICIOS}/maintenance/check`)
      .pipe(
        map(response => response.is_maintenance),
        catchError(() => {
          // Si falla la petición, asumir que no está en mantenimiento
          return new Observable<boolean>(observer => {
            observer.next(false);
            observer.complete();
          });
        })
      );
  }

  /**
   * Inicia la verificación periódica del estado de mantenimiento
   */
  private startPeriodicCheck(): void {
    timer(this.checkInterval, this.checkInterval).subscribe(() => {
      this.checkMaintenanceStatus().subscribe(status => {
        const previousMaintenanceState = this.maintenanceStatus.value;
        const currentMaintenanceState = status.maintenance_mode;

        // Actualizar el estado
        this.maintenanceStatus.next(currentMaintenanceState);
        this.maintenanceMessage.next(status.message);

        // Detectar cambio de NO-mantenimiento a mantenimiento
        if (!previousMaintenanceState && currentMaintenanceState) {
          this.wasInMaintenance = true;
          if (status.maintenance_info) {
            localStorage.setItem('maintenance_info', JSON.stringify(status.maintenance_info));
          }
          // Solo guardar ubicación si no estamos ya en la página de mantenimiento
          if (!this.router.url.includes('/maintenance')) {
            this.saveCurrentLocation();
          }
        }

        // Detectar cambio de mantenimiento a NO-mantenimiento
        if (previousMaintenanceState && !currentMaintenanceState && this.wasInMaintenance) {
          localStorage.removeItem('maintenance_info');

          // Solo manejar la redirección si estamos en la página de mantenimiento
          const currentRoute = this.router.url;
          if (currentRoute.includes('/maintenance')) {
            // Actualizar mensaje para que el componente muestre la reactivación
            this.maintenanceMessage.next('¡Sistema reactivado! Redirigiendo al login...');
            // Programar la redirección automática después de mostrar el mensaje
            this.scheduleRedirection();
          }
        }

        // Si no está en mantenimiento, asegurar que wasInMaintenance sea false
        if (!currentMaintenanceState) {
          // Solo resetear si ya manejamos la transición
          if (!previousMaintenanceState) {
            this.wasInMaintenance = false;
          }
        }
      });
    });
  }

  /**
   * Guarda la ubicación actual del usuario antes del mantenimiento
   * Simplificado: ya no necesitamos guardar rutas porque siempre redirigimos al login
   */
  private saveCurrentLocation(): void {
    // Ya no guardamos rutas específicas, siempre vamos al login
  }

  /**
   * Programa la redirección automática después de mostrar el mensaje
   */
  private scheduleRedirection(): void {
    setTimeout(() => {
      this.executeRedirection();
    }, 2000); // 2 segundos para mostrar el mensaje
  }

  /**
   * Ejecuta la redirección y limpieza final
   */
  private executeRedirection(): void {
    // Cerrar sesión y limpiar datos
    if (this.isUserLoggedIn()) {
      this.authService.logout();
    }

    // Limpiar completamente localStorage y sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Redirección forzada usando la ruta correcta
    window.location.href = '/login';

    // Resetear estado
    this.wasInMaintenance = false;
  }

  /**
   * Maneja el final del modo mantenimiento (versión simplificada)
   */
  private handleMaintenanceEnd(): void {
    this.executeRedirection();
  }

  /**
   * Verifica si el usuario está logueado
   */
  private isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Obtiene información adicional del mantenimiento desde localStorage
   */
  getMaintenanceInfo(): any {
    const info = localStorage.getItem('maintenance_info');
    return info ? JSON.parse(info) : null;
  }

  /**
   * Fuerza una verificación inmediata del estado
   */
  forceCheck(): void {
    this.checkMaintenanceStatus().subscribe(status => {
      const previousMaintenanceState = this.maintenanceStatus.value;
      const currentMaintenanceState = status.maintenance_mode;

      // Actualizar el estado inmediatamente
      this.maintenanceStatus.next(currentMaintenanceState);
      this.maintenanceMessage.next(status.message);

      // Detectar transición de mantenimiento a NO-mantenimiento
      if (previousMaintenanceState && !currentMaintenanceState && this.wasInMaintenance) {
        localStorage.removeItem('maintenance_info');

        // Solo redirigir si estamos en la página de mantenimiento
        const currentRoute = this.router.url;
        if (currentRoute.includes('/maintenance')) {
          // Actualizar mensaje y programar redirección
          this.maintenanceMessage.next('¡Sistema reactivado! Redirigiendo al login...');
          this.scheduleRedirection();
        } else {
          // Si no estamos en la página de mantenimiento, redirección directa
          this.handleMaintenanceEnd();
        }
      }

      // Si está en mantenimiento, guardar info
      if (currentMaintenanceState && status.maintenance_info) {
        localStorage.setItem('maintenance_info', JSON.stringify(status.maintenance_info));
        if (!this.wasInMaintenance) {
          this.wasInMaintenance = true;
        }
      }

      // Si no está en mantenimiento y no hay transición pendiente
      if (!currentMaintenanceState && !previousMaintenanceState) {
        this.wasInMaintenance = false;
      }
    });
  }
}