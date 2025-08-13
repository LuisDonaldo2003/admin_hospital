import { Injectable } from '@angular/core';
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

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Indica si se está realizando un refresh de token
  private isRefreshing = false;
  // Sujeto para emitir el nuevo token tras el refresh
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  /**
   * Inyecta el servicio de autenticación
   */
  constructor(private authService: AuthService) {}

  /**
   * Intercepta todas las peticiones HTTP para agregar el token y manejar errores 401
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtiene el token del localStorage y lo agrega a la petición si existe
    const token = localStorage.getItem('token');

    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es 401 y no es login ni refresh, intenta refrescar el token
        if (error.status === 401 && !request.url.includes('/auth/login') && !request.url.includes('/auth/refresh')) {
          return this.handle401Error(request, next);
        }

        // Si es 401 en login/refresh, cierra sesión
        if (error.status === 401) {
          this.authService.logout();
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Clona la petición HTTP agregando el header de autorización
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Maneja el error 401 intentando refrescar el token y repitiendo la petición
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(request, token));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // Si ya se está refrescando, espera el nuevo token y repite la petición
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}
