import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent,
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class MaintenanceInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si recibimos un 503 (Service Unavailable), significa modo de mantenimiento
        if (error.status === 503) {
          // Redirigir a la página de mantenimiento solo si no estamos ya allí
          if (!this.router.url.includes('/maintenance')) {
            this.router.navigate(['/maintenance']);
          }
        }
        
        return throwError(error);
      })
    );
  }
}