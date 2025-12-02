import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class LicenseInterceptor implements HttpInterceptor {
  private hasRedirected = false;

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el backend responde con 403 y código LICENSE_INVALID
        if (error.status === 403 && 
            error.error?.code === 'LICENSE_INVALID' && 
            !this.hasRedirected &&
            !req.url.includes('/license/') &&
            window.location.hash !== '#/upload-license') {
          
          this.hasRedirected = true;
          
          // Limpiar localStorage para evitar loops
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirigir a la página de carga de licencia
          window.location.href = '/#/upload-license';
          
          setTimeout(() => this.hasRedirected = false, 2000);
        }
        
        return throwError(() => error);
      })
    );
  }
}
