import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio para gestionar el ID de sesión del cliente
 * Permite detectar sesiones concurrentes y cerrar sesiones antiguas
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_KEY = 'client_session_id';

  constructor() {
    // Generar un session_id si no existe
    this.ensureSessionId();
  }

  /**
   * Genera un session_id único si no existe
   */
  private ensureSessionId(): void {
    if (!localStorage.getItem(this.SESSION_KEY)) {
      this.generateNewSessionId();
    }
  }

  /**
   * Genera un nuevo session_id único
   */
  generateNewSessionId(): string {
    const sessionId = uuidv4();
    localStorage.setItem(this.SESSION_KEY, sessionId);
    return sessionId;
  }

  /**
   * Obtiene el session_id actual del cliente
   */
  getSessionId(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  /**
   * Actualiza el session_id con el proporcionado por el servidor
   */
  setSessionId(sessionId: string): void {
    localStorage.setItem(this.SESSION_KEY, sessionId);
  }

  /**
   * Limpia el session_id del localStorage
   */
  clearSessionId(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Verifica si hay un session_id almacenado
   */
  hasSessionId(): boolean {
    return !!localStorage.getItem(this.SESSION_KEY);
  }
}
