import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { routes } from '../routes/routes';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppGuard implements CanActivate {
  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    
    // Verificar autenticación directamente
    // El interceptor se encargará de detectar errores 503
    return this.checkAuthentication();
  }

  private checkAuthentication(): Observable<boolean> {
    // Verificar si existen token y usuario en localStorage
    if (!localStorage.getItem("token") || !localStorage.getItem("user")) {
      this.router.navigate([routes.login]);
      return of(false);
    }

    // Si el token está expirado, intentar renovarlo
    if (this.auth.isTokenExpired()) {
      return this.auth.refreshToken().pipe(
        map(() => true),
        catchError(() => {
          this.router.navigate([routes.login]);
          return of(false);
        })
      );
    }

    // Si el token está próximo a expirar, renovarlo en segundo plano
    if (this.auth.isTokenExpiringSoon()) {
      this.auth.refreshToken().subscribe({
        error: () => {
          // Si falla el refresh, redirigir al login
          this.router.navigate([routes.login]);
        }
      });
    }

    return of(true);
  }
}