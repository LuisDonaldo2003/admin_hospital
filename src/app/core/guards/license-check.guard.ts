import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { URL_SERVICIOS } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class LicenseCheckGuard implements CanActivate {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Si ya estamos en upload-license, permitir acceso
    if (state.url.includes('/upload-license')) {
      return of(true);
    }

    // Verificar el estado de la licencia
    return this.http.get(`${URL_SERVICIOS}/license/status`).pipe(
      map((response: any) => {
        if (response.valid) {
          return true;
        } else {
          // Si la licencia no es válida, redirigir a upload-license
          this.router.navigate(['/upload-license']);
          return false;
        }
      }),
      catchError(() => {
        // Si hay error (incluyendo 403), redirigir a upload-license
        this.router.navigate(['/upload-license']);
        return of(false);
      })
    );
  }
}
