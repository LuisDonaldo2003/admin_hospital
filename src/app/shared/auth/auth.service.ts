import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of, Observable, throwError } from 'rxjs';
import { routes } from '../routes/routes';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  token: any;
  private refreshInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  constructor(private router: Router, public http: HttpClient) {
    this.getLocalStorage();
  }

  getLocalStorage() {
    if (localStorage.getItem("token") && localStorage.getItem("user")) {
      let USER = localStorage.getItem('user');
      this.token = localStorage.getItem("token");
      this.userSubject.next(JSON.parse(USER ? USER : ''));
    } else {
      this.token = null;
      this.userSubject.next(null);
    }
  }

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
        console.error('Login error:', error);
        if (error.status === 403 && error.error?.unverified) {
          localStorage.setItem('pending_email', email);
          this.router.navigate(['/verify-code']);
          return of({ success: false, unverified: true });
        }
        return of({ success: false });
      })
    );
  }

  savelocalStorage(auth: any) {
    if (auth && auth.access_token) {
      localStorage.setItem("token", auth.access_token);
      localStorage.setItem("user", JSON.stringify(auth.user));
      localStorage.setItem('authenticated', 'true');
      this.userSubject.next(auth.user);
      
      // Log para mostrar que el token se guardó correctamente
      console.log('🔐 Token JWT guardado correctamente');
      this.logTokenInfo();
      
      return true;
    }
    return false;
  }

  logout() {
    const URL = URL_SERVICIOS + "/auth/logout";
    
    // Llama al backend para eliminar el estado online
    this.http.post(URL, {}).subscribe({
      next: () => {
        this.clearLocalStorage();
        this.navigateToLogin();
      },
      error: () => {
        // Incluso si falla, limpia localStorage
        this.clearLocalStorage();
        this.navigateToLogin();
      }
    });
  }

  private clearLocalStorage(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem('authenticated');
    this.userSubject.next(null);
    this.token = null;
  }

  private navigateToLogin(): void {
    this.router.navigate([routes.login]).then(() => {
      window.location.reload();
    });
  }

  public get user(): any {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  // MÉTODO PARA VERIFICAR SI EL TOKEN ESTÁ PRÓXIMO A EXPIRAR
  isTokenExpiringSoon(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      
      // Considerar "próximo a expirar" si faltan menos de 15 minutos (900 segundos)
      return (expirationTime - currentTime) < 900;
    } catch {
      return true;
    }
  }

  // MÉTODO PARA VERIFICAR SI EL TOKEN ESTÁ EXPIRADO
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

  // MÉTODO PARA RENOVAR EL TOKEN
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

  // MÉTODO PARA OBTENER UN TOKEN VÁLIDO
  getValidToken(): Observable<string | null> {
    if (!this.isTokenExpired()) {
      return of(localStorage.getItem('token'));
    }

    if (this.isTokenExpiringSoon() && !this.refreshInProgress) {
      return this.refreshToken();
    }

    return of(null);
  }

  // MÉTODO PARA MOSTRAR INFORMACIÓN DEL TOKEN
  private logTokenInfo(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      const hoursUntilExpiry = Math.floor((expirationTime - currentTime) / 3600);
      const minutesUntilExpiry = Math.floor(((expirationTime - currentTime) % 3600) / 60);
      
      console.log(`⏰ Token expira en: ${hoursUntilExpiry}h ${minutesUntilExpiry}m`);
    } catch (error) {
      console.log('❌ Error al leer información del token');
    }
  }
}
