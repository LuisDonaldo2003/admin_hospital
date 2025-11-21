import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { routes } from '../../routes/routes';

/**
 * Componente de diálogo que se muestra cuando la sesión del usuario
 * ha sido cerrada porque se inició sesión en otro dispositivo
 */
@Component({
  selector: 'app-session-closed-dialog',
  templateUrl: './session-closed-dialog.component.html',
  styleUrls: ['./session-closed-dialog.component.scss'],
  standalone: false
})
export class SessionClosedDialogComponent {
  public routes = routes;

  constructor(
    public dialogRef: MatDialogRef<SessionClosedDialogComponent>,
    private router: Router
  ) {
    // Evitar que el usuario cierre el diálogo haciendo clic fuera
    this.dialogRef.disableClose = true;
  }

  /**
   * Maneja la confirmación y redirige al login
   */
  onConfirm(): void {
    this.dialogRef.close();
    
    // Remover solo las claves relacionadas con la autenticación
    // Preservando las preferencias del usuario (tema, idioma, colores, etc.)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authenticated');
    localStorage.removeItem('client_session_id');
    
    // Redirigir al login y recargar
    this.router.navigate([this.routes.login]).then(() => {
      window.location.reload();
    });
  }
}
