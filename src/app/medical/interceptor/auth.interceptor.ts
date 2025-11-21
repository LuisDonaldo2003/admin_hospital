import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../../shared/auth/auth.service';
import { Router } from '@angular/router';
import { SessionService } from '../../shared/services/session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Indica si se está realizando un refresh de token
  private isRefreshing = false;
  // Sujeto para emitir el nuevo token tras el refresh
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Usa Injector para obtener AuthService de forma lazy y evitar dependencia circular
   */
  constructor(
    private injector: Injector,
    private sessionService: SessionService
  ) {}

  /**
   * Intercepta todas las peticiones HTTP para agregar el token y manejar errores 401
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtiene el token del localStorage y lo agrega a la petición si existe
    const token = localStorage.getItem('token');
    const sessionId = this.sessionService.getSessionId();

    if (token) {
      request = this.addToken(request, token, sessionId);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // 🔐 MANEJAR SESIÓN CERRADA POR OTRO DISPOSITIVO
        if (error.status === 401 && error.error?.session_closed) {
          // No intentar refrescar - la sesión fue cerrada intencionalmente
          // El AuthService ya maneja esto en el heartbeat
          return throwError(() => error);
        }
        
        // Si el error es 401 y no es login ni refresh ni heartbeat, intenta refrescar el token
        if (error.status === 401 && 
            !request.url.includes('/auth/login') && 
            !request.url.includes('/auth/refresh') &&
            !request.url.includes('/auth/heartbeat')) {
          return this.handle401Error(request, next);
        }

        // Si es 401 en login/refresh/heartbeat, solo propagar error (no hacer logout automático)
        // El heartbeat fallará naturalmente cuando el token expire, no debe causar logout
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Clona la petición HTTP agregando el header de autorización y session_id
   */
  private addToken(request: HttpRequest<any>, token: string, sessionId: string | null = null): HttpRequest<any> {
    const headers: any = {
      Authorization: `Bearer ${token}`
    };
    
    // Agregar session_id si existe
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }
    
    return request.clone({
      setHeaders: headers
    });
  }

  /**
   * Maneja el error 401 intentando refrescar el token y repitiendo la petición
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const authService = this.injector.get(AuthService);
      const sessionId = this.sessionService.getSessionId();
      
      return authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(request, token, sessionId));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // Si ya se está refrescando, espera el nuevo token y repite la petición
      const sessionId = this.sessionService.getSessionId();
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token, sessionId));
        })
      );
    }
  }
}
