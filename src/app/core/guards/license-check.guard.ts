import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { URL_SERVICIOS } from '../../config/config';

@Injectable({
  providedIn: 'root'
})
export class LicenseCheckGuard implements CanActivate {
  private licenseCheckCache: { valid: boolean; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Si ya estamos en upload-license, permitir acceso siempre
    if (state.url.includes('/upload-license')) {
      return of(true);
    }

    // Verificar si tenemos un caché válido (menos de 5 minutos)
    if (this.licenseCheckCache && 
        (Date.now() - this.licenseCheckCache.timestamp) < this.CACHE_DURATION) {
      if (this.licenseCheckCache.valid) {
        return of(true);
      } else {
        this.router.navigate(['/upload-license']);
        return of(false);
      }
    }

    // Verificar el estado de la licencia en el backend
    return this.http.get(`${URL_SERVICIOS}/license/status`).pipe(
      tap((response: any) => {
        // Almacenar resultado en caché
        this.licenseCheckCache = {
          valid: response.valid,
          timestamp: Date.now()
        };
      }),
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
        // y marcar como inválido en caché
        this.licenseCheckCache = {
          valid: false,
          timestamp: Date.now()
        };
        this.router.navigate(['/upload-license']);
        return of(false);
      })
    );
  }

  /**
   * Invalida el caché de licencia (útil después de subir una nueva licencia)
   */
  invalidateCache(): void {
    this.licenseCheckCache = null;
  }
}
