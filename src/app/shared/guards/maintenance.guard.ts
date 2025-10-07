import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): Observable<boolean> {
    // Guard simplificado que siempre permite el acceso
    // El intercetpor se encarga de detectar 503 y redirigir
    return of(true);
  }
}