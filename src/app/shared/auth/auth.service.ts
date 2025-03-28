import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of } from 'rxjs';
import { routes } from '../routes/routes';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  user: any;
  token: any;

  constructor(private router: Router, public http: HttpClient) {
    this.getLocalStorage();
  }

  getLocalStorage() {
    if (localStorage.getItem("token") && localStorage.getItem("user")) {
      let USER = localStorage.getItem('user');
      this.user = JSON.parse(USER ? USER : '');
      this.token = localStorage.getItem("token");
      this.userSubject.next(this.user); // Notificar cambios
    } else {
      this.user = null;
      this.token = null;
      this.userSubject.next(null);
    }
  }

  login(email: string, password: string) {
    let URL = URL_SERVICIOS + "/auth/login";
    return this.http.post(URL, { email: email, password: password }).pipe(
      map((auth: any) => {
        console.log(auth);
        const result = this.savelocalStorage(auth);
        return result;
      }),
      catchError((error: any) => {
        console.error(error);
        return of(undefined);
      })
    );
  }

  savelocalStorage(auth: any) {
    if (auth && auth.access_token) {
      localStorage.setItem("token", auth.access_token);
      localStorage.setItem("user", JSON.stringify(auth.user));
      localStorage.setItem('authenticated', 'true');
      this.userSubject.next(auth.user); // Notificar cambios
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem('authenticated');
    this.userSubject.next(null); // Notificar que el usuario se ha eliminado
    this.router.navigate([routes.login]).then(() => {
      window.location.reload(); // 🔴 FORZAR RECARGA TOTAL DE LA APP
    });
  }
}