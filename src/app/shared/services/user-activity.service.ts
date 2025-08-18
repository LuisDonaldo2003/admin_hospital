import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { URL_SERVICIOS } from 'src/app/config/config';

/**
 * Servicio para mantener activo el estado del usuario mediante heartbeat
 */
@Injectable({
  providedIn: 'root'
})
export class UserActivityService implements OnDestroy {
  private heartbeatSubscription: Subscription | undefined;
  private readonly HEARTBEAT_INTERVAL = 90 * 1000; // 1.5 minutos (90 segundos)

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Inicia el heartbeat periódico para mantener vivo el estado del usuario
   */
  startHeartbeat(): void {
    this.stopHeartbeat(); // Asegurar que no hay múltiples intervalos
    
    // Solo iniciar si el usuario está autenticado
    if (this.authService.token) {
      this.sendHeartbeat(); // Enviar inmediatamente
      
      // Luego enviar cada 2 minutos
      this.heartbeatSubscription = interval(this.HEARTBEAT_INTERVAL).subscribe(() => {
        if (this.authService.token) {
          this.sendHeartbeat();
        } else {
          this.stopHeartbeat();
        }
      });
    }
  }

  /**
   * Detiene el heartbeat
   */
  stopHeartbeat(): void {
    if (this.heartbeatSubscription) {
      this.heartbeatSubscription.unsubscribe();
      this.heartbeatSubscription = undefined;
    }
  }

  /**
   * Envía un heartbeat al servidor para actualizar el estado de conexión
   */
  private sendHeartbeat(): void {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });

    const URL = URL_SERVICIOS + "/auth/heartbeat";
    
    this.http.post(URL, {}, { headers }).subscribe({
      next: () => {
        // Heartbeat exitoso - no hacer nada
      },
      error: (error) => {
        // Si hay error de autenticación, hacer logout
        if (error.status === 401) {
          this.authService.logout();
          this.stopHeartbeat();
        }
      }
    });
  }

  /**
   * Limpieza al destruir el servicio
   */
  ngOnDestroy(): void {
    this.stopHeartbeat();
  }
}
