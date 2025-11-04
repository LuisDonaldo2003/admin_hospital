import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of, Observable, throwError, interval, Subscription } from 'rxjs';
import { routes } from '../routes/routes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { URL_SERVICIOS } from 'src/app/config/config';
import { PermissionService } from '../services/permission.service';
import { ThemeService } from '../services/theme.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Subject para el usuario autenticado
  private userSubject = new BehaviorSubject<any>(null);
  // Observable público del usuario
  user$ = this.userSubject.asObservable();

  // Token JWT actual
  token: any;
  // Indica si hay un refresh de token en progreso
  private refreshInProgress = false;
  // Subject para el token renovado
  private refreshTokenSubject = new BehaviorSubject<any>(null);
  
  // Variables para el heartbeat de actividad de usuario
  private heartbeatSubscription: Subscription | undefined;
  private readonly HEARTBEAT_INTERVAL = 90 * 1000; // 1.5 minutos (90 segundos)

  /**
   * Inyecta el router y el cliente HTTP, inicializa el usuario desde localStorage
   */
  constructor(
    private router: Router, 
    public http: HttpClient,
    private permissionService: PermissionService,
    private themeService: ThemeService
  ) {
    this.getLocalStorage();
  }

  /**
   * Obtiene el usuario y token desde localStorage y actualiza el estado
   */
  getLocalStorage() {
    if (localStorage.getItem("token") && localStorage.getItem("user")) {
      let USER = localStorage.getItem('user');
      this.token = localStorage.getItem("token");
      this.userSubject.next(JSON.parse(USER ? USER : ''));
      
      // Si hay token válido, iniciar heartbeat
      if (this.token && !this.isTokenExpired()) {
        this.startUserActivityTracking();
      }
    } else {
      this.token = null;
      this.userSubject.next(null);
    }
  }

  /**
   * Realiza el login y guarda el token y usuario en localStorage
   */
  login(email: string, password: string) {
    const URL = URL_SERVICIOS + "/auth/login";
    return this.http.post(URL, { email, password }).pipe(
      map((auth: any) => {
        if (auth && auth.access_token) {
          this.savelocalStorage(auth);
          return { success: true };
        }
        return { success: false };
      }),
      catchError((error: any) => {
        if (error.status === 403 && error.error?.unverified) {
          localStorage.setItem('pending_email', email);
          this.router.navigate(['/verify-code']);
          return of({ success: false, unverified: true });
        }
        return of({ success: false });
      })
    );
  }

  /**
   * Guarda el token y usuario en localStorage y actualiza el estado
   * IMPORTANTE: Aplica el tema del usuario después de guardar la sesión
   */
  savelocalStorage(auth: any) {
    if (auth && auth.access_token) {
      // Sanitiza roles antes de guardar (trim para eliminar espacios sobrantes)
      if (auth.user && Array.isArray(auth.user.roles)) {
        auth.user.roles = auth.user.roles.map((r: any) => typeof r === 'string' ? r.trim() : r);
      }
      localStorage.setItem("token", auth.access_token);
      localStorage.setItem("user", JSON.stringify(auth.user));
      localStorage.setItem('authenticated', 'true');
      this.userSubject.next(auth.user);
      this.token = auth.access_token;
      
      // Refrescar permisos en el servicio de permisos
      this.permissionService.refreshUser();
      
      // ✨ APLICAR TEMA DEL USUARIO DESPUÉS DEL LOGIN ✨
      // Esto carga los colores personalizados del usuario que acaba de iniciar sesión
      console.log('🎨 Aplicando tema del usuario después del login');
      setTimeout(() => {
        this.themeService.applyUserTheme();
      }, 100); // Pequeño delay para asegurar que el userId esté disponible
      
      // Iniciar heartbeat para mantener vivo el estado del usuario
      this.startUserActivityTracking();
      
      return true;
    }
    return false;
  }

  /**
   * Realiza el logout, limpia el localStorage y navega al login
   */
  logout() {
    // Detener heartbeat antes del logout
    this.stopUserActivityTracking();
    
    const URL = URL_SERVICIOS + "/auth/logout";
    this.http.post(URL, {}).subscribe({
      next: () => {
        this.clearLocalStorage();
        this.navigateToLogin();
      },
      error: () => {
        this.clearLocalStorage();
        this.navigateToLogin();
      }
    });
  }

  /**
   * Limpia el localStorage y el estado de usuario/token
   * IMPORTANTE: Limpia el tema del usuario al cerrar sesión
   */
  private clearLocalStorage(): void {
    this.stopUserActivityTracking(); // Detener heartbeat
    
    // ✨ LIMPIAR TEMA AL CERRAR SESIÓN ✨
    console.log('🧹 Limpiando tema al cerrar sesión');
    this.themeService.clearUserTheme();
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem('authenticated');
    this.userSubject.next(null);
    this.token = null;
  }

  /**
   * Navega al login y recarga la página
   */
  private navigateToLogin(): void {
    this.router.navigate([routes.login]).then(() => {
      window.location.reload();
    });
  }

  /**
   * Devuelve el usuario actual desde localStorage
   */
  public get user(): any {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  /**
   * Verifica si el token está próximo a expirar (menos de 15 minutos)
   */
  isTokenExpiringSoon(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      return (expirationTime - currentTime) < 900;
    } catch {
      return true;
    }
  }

  /**
   * Verifica si el token está expirado
   */
  isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime >= payload.exp;
    } catch {
      return true;
    }
  }

  /**
   * Renueva el token llamando al endpoint de refresh
   */
  refreshToken(): Observable<any> {
    if (this.refreshInProgress) {
      return this.refreshTokenSubject.asObservable();
    }
    this.refreshInProgress = true;
    this.refreshTokenSubject.next(null);
    const URL = URL_SERVICIOS + "/auth/refresh";
    return this.http.post(URL, {}).pipe(
      map((response: any) => {
        if (response && response.access_token) {
          this.savelocalStorage(response);
          this.refreshTokenSubject.next(response.access_token);
          this.refreshInProgress = false;
          return response.access_token;
        }
        throw new Error('Token refresh failed');
      }),
      catchError((error) => {
        this.refreshInProgress = false;
        this.refreshTokenSubject.next(null);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Devuelve un token válido, renovando si es necesario
   */
  getValidToken(): Observable<string | null> {
    if (!this.isTokenExpired()) {
      return of(localStorage.getItem('token'));
    }
    if (this.isTokenExpiringSoon() && !this.refreshInProgress) {
      return this.refreshToken();
    }
    return of(null);
  }

  /**
   * Muestra información del token en consola (solo para depuración)
   */
  private logTokenInfo(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      const hoursUntilExpiry = Math.floor((expirationTime - currentTime) / 3600);
      const minutesUntilExpiry = Math.floor(((expirationTime - currentTime) % 3600) / 60);
    } catch {
    }
  }

  /**
   * Inicia el seguimiento de actividad del usuario mediante heartbeat
   */
  private startUserActivityTracking(): void {
    this.stopUserActivityTracking(); // Asegurar que no hay múltiples intervalos
    
    if (this.token) {
      this.sendHeartbeat(); // Enviar inmediatamente
      
      // Luego enviar cada 2 minutos
      this.heartbeatSubscription = interval(this.HEARTBEAT_INTERVAL).subscribe(() => {
        if (this.token) {
          this.sendHeartbeat();
        } else {
          this.stopUserActivityTracking();
        }
      });
    }
  }

  /**
   * Detiene el seguimiento de actividad del usuario
   */
  private stopUserActivityTracking(): void {
    if (this.heartbeatSubscription) {
      this.heartbeatSubscription.unsubscribe();
      this.heartbeatSubscription = undefined;
    }
  }

  /**
   * Envía un heartbeat al servidor para mantener vivo el estado de conexión
   */
  private sendHeartbeat(): void {
    if (!this.token) return;
    
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token
    });

    const URL = URL_SERVICIOS + "/auth/heartbeat";
    
    this.http.post(URL, {}, { headers }).subscribe({
      next: () => {
        // Heartbeat exitoso - no hacer nada específico
      },
      error: (error) => {
        // Si hay error de autenticación, hacer logout
        if (error.status === 401) {
          this.logout();
        }
      }
    });
  }

  /**
   * Verifica si el usuario está actualmente logueado
   */
  isLoggedIn(): boolean {
    return !!(this.token && this.user && !this.isTokenExpired());
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): string | null {
    const user = this.user;
    return user?.role_name || user?.role?.name || null;
  }

  /**
   * Obtiene la ruta por defecto basada en el rol del usuario
   */
  getDefaultRouteForUser(): string {
    const role = this.getUserRole();
    
    switch (role) {
      case 'Director General':
        return '/dashboard';
      case 'Administrador':
        return '/dashboard';
      case 'Doctor':
        return '/medical/archives/list';
      case 'Enfermera':
      case 'Enfermero':
        return '/medical/archives/list';
      case 'Recursos Humanos':
        return '/medical/personal';
      default:
        return '/dashboard';
    }
  }
}
