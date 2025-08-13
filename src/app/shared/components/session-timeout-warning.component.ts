import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityMonitorService } from '../services/activity-monitor.service';
import { AuthService } from '../auth/auth.service';

// Componente que muestra una advertencia cuando la sesión está por expirar por inactividad
@Component({
  selector: 'app-session-timeout-warning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showWarning" class="session-warning-overlay">
      <div class="session-warning-modal">
        <div class="warning-icon">
          <i class="fa fa-exclamation-triangle"></i>
        </div>
        <h4>¡Atención!</h4>
        <p>Tu sesión expirará en <strong>{{ timeRemainingMinutes }}</strong> minutos por inactividad.</p>
        <p class="small text-muted">¿Deseas continuar trabajando?</p>
        <div class="warning-actions">
          <button class="btn btn-primary" (click)="extendSession()">
            <i class="fa fa-refresh me-1"></i>
            Continuar sesión
          </button>
          <button class="btn btn-secondary" (click)="logout()">
            <i class="fa fa-sign-out me-1"></i>
            Cerrar sesión
          </button>
        </div>
        <div class="countdown-bar">
          <div class="countdown-progress" [style.width.%]="progressPercentage"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .session-warning-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(3px);
    }

    .session-warning-modal {
      background: white;
      padding: 2.5rem;
      border-radius: 15px;
      text-align: center;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-50px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .warning-icon {
      font-size: 3.5rem;
      color: #f39c12;
      margin-bottom: 1.2rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    h4 {
      color: #333;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    p {
      color: #666;
      margin-bottom: 0.5rem;
      line-height: 1.5;
    }

    .warning-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .countdown-bar {
      margin-top: 1.5rem;
      height: 4px;
      background-color: #e9ecef;
      border-radius: 2px;
      overflow: hidden;
    }

    .countdown-progress {
      height: 100%;
      background: linear-gradient(90deg, #28a745, #ffc107, #dc3545);
      border-radius: 2px;
      transition: width 1s ease-out;
    }

    @media (max-width: 576px) {
      .session-warning-modal {
        padding: 1.5rem;
        margin: 1rem;
      }

      .warning-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class SessionTimeoutWarningComponent implements OnInit, OnDestroy {
  // Indica si se debe mostrar la advertencia de expiración de sesión
  showWarning = false;
  // Minutos restantes antes de que expire la sesión
  timeRemainingMinutes = 0;
  // Porcentaje para la barra de progreso visual
  progressPercentage = 100;
  // Timer para verificar periódicamente si mostrar la advertencia
  private warningTimer: any;
  // Timer para actualizar la cuenta regresiva
  private countdownTimer: any;
  // Minutos antes de la expiración para mostrar la advertencia
  private readonly WARNING_THRESHOLD = 10;

  /**
   * Inyecta los servicios de monitoreo de actividad y autenticación
   */
  constructor(
    private activityMonitor: ActivityMonitorService,
    private authService: AuthService
  ) {}

  /**
   * Inicializa el componente y comienza la verificación periódica
   */
  ngOnInit(): void {
    this.startWarningCheck();
  }

  /**
   * Limpia los timers al destruir el componente
   */
  ngOnDestroy(): void {
    this.clearTimers();
  }

  /**
   * Inicia el timer para verificar cada 30 segundos si mostrar la advertencia
   */
  private startWarningCheck(): void {
    this.warningTimer = setInterval(() => {
      this.checkTokenExpiration();
    }, 30000);
  }

  /**
   * Verifica el tiempo restante de sesión y muestra/oculta la advertencia según corresponda
   */
  private checkTokenExpiration(): void {
    if (this.authService.isTokenExpired()) {
      this.hideWarning();
      return;
    }
    const timeUntilExpiry = this.activityMonitor.getTimeUntilTokenExpiry();
    const minutesUntilExpiry = Math.floor(timeUntilExpiry / (60 * 1000));
    // Mostrar advertencia cuando queden 10 minutos o menos
    if (minutesUntilExpiry <= this.WARNING_THRESHOLD && minutesUntilExpiry > 0) {
      if (!this.showWarning) {
        this.showWarning = true;
        this.startCountdown();
      }
    } else if (minutesUntilExpiry <= 0) {
      this.hideWarning();
      this.authService.logout();
    }
  }

  /**
   * Inicia el timer para actualizar la cuenta regresiva y barra de progreso
   */
  private startCountdown(): void {
    this.updateCountdown();
    this.countdownTimer = setInterval(() => {
      this.updateCountdown();
      if (this.timeRemainingMinutes <= 0) {
        this.hideWarning();
        this.authService.logout();
      }
    }, 30000);
  }

  /**
   * Actualiza los minutos restantes y el porcentaje de la barra de progreso
   */
  private updateCountdown(): void {
    const timeUntilExpiry = this.activityMonitor.getTimeUntilTokenExpiry();
    this.timeRemainingMinutes = Math.floor(timeUntilExpiry / (60 * 1000));
    const totalWarningTime = this.WARNING_THRESHOLD * 60 * 1000;
    this.progressPercentage = Math.max(0, Math.min(100, (timeUntilExpiry / totalWarningTime) * 100));
  }

  /**
   * Extiende la sesión y oculta la advertencia
   */
  extendSession(): void {
    this.activityMonitor.extendSession();
    this.hideWarning();
  }

  /**
   * Cierra la sesión y oculta la advertencia
   */
  logout(): void {
    this.authService.logout();
    this.hideWarning();
  }

  /**
   * Oculta la advertencia y limpia los timers
   */
  private hideWarning(): void {
    this.showWarning = false;
    this.clearTimers();
  }

  /**
   * Limpia los timers activos
   */
  private clearTimers(): void {
    if (this.warningTimer) {
      clearInterval(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
