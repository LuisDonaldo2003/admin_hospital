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
  private licenseCheckCache: { 
    valid: boolean; 
    hasLicense: boolean;
    timestamp: number 
  } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Rutas públicas que no requieren verificación de licencia
    const publicRoutes = ['/upload-license', '/login', '/register', '/forgot-password', '/reset-password'];
    
    // Si estamos en una ruta pública, permitir acceso siempre
    if (publicRoutes.some(publicRoute => state.url.includes(publicRoute))) {
      return of(true);
    }

    // Verificar si tenemos un caché válido (menos de 5 minutos)
    if (this.licenseCheckCache && 
        (Date.now() - this.licenseCheckCache.timestamp) < this.CACHE_DURATION) {
      
      // Si hay licencia activa en el sistema, permitir acceso
      if (this.licenseCheckCache.hasLicense && this.licenseCheckCache.valid) {
        return of(true);
      } 
      
      // Si no hay licencia en el sistema, redirigir a upload-license
      if (!this.licenseCheckCache.hasLicense) {
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
          hasLicense: response.has_license ?? false,
          timestamp: Date.now()
        };
      }),
      map((response: any) => {
        // Si hay licencia activa y es válida, permitir acceso
        if (response.has_license && response.valid) {
          return true;
        }
        
        // Si no hay licencia o es inválida/expirada, redirigir a upload-license solo si no hay licencia
        if (!response.has_license) {
          this.router.navigate(['/upload-license']);
          return false;
        }

        // Si hay licencia pero expiró, mostrar mensaje y permitir acceso (el middleware del backend bloqueará operaciones)
        // Esto permite que administradores puedan subir nueva licencia
        if (response.has_license && !response.valid) {
          console.warn('⚠️ La licencia del sistema ha expirado. Contacte al administrador.');
          this.router.navigate(['/upload-license']);
          return false;
        }

        return true;
      }),
      catchError((error) => {
        // Si hay error de red o servidor, almacenar en caché como inválido
        this.licenseCheckCache = {
          valid: false,
          hasLicense: false,
          timestamp: Date.now()
        };
        
        // Solo redirigir si el error es 404 (no hay licencia)
        if (error.status === 404) {
          this.router.navigate(['/upload-license']);
          return of(false);
        }
        
        // Para otros errores, permitir acceso (podría ser error temporal)
        console.error('Error al verificar licencia:', error);
        return of(true);
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
