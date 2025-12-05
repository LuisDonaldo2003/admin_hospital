import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class LicenseInterceptor implements HttpInterceptor {
  private hasRedirected = false;
  private readonly REDIRECT_COOLDOWN = 5000; // 5 segundos

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el backend responde con 403 y código LICENSE_INVALID
        if (error.status === 403 && 
            error.error?.code === 'LICENSE_INVALID' && 
            !this.hasRedirected &&
            !req.url.includes('/license/') &&
            !window.location.pathname.includes('/upload-license') &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register') &&
            !window.location.pathname.includes('/forgot-password')) {
          
          this.hasRedirected = true;
          
          console.warn('⚠️ Licencia inválida detectada. Redirigiendo a página de activación.');
          
          // NO limpiar token aquí - el usuario puede tener sesión válida
          // Solo redirigir para que un administrador suba la licencia
          
          // Redirigir a la página de carga de licencia usando Angular Router
          this.router.navigate(['/upload-license']);
          
          setTimeout(() => this.hasRedirected = false, this.REDIRECT_COOLDOWN);
        }
        
        return throwError(() => error);
      })
    );
  }
}
