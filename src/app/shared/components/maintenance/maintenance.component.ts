import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="maintenance-container">
      <div class="maintenance-content">
        <!-- Logo del Hospital -->
        <div class="logo-section">
          <img src="assets/images/logo-hospital.png" alt="Hospital IMSS-Bienestar" class="hospital-logo" 
               (error)="onImageError($event)">
          <h1>Hospital IMSS-Bienestar</h1>
        </div>

        <!-- Icono de mantenimiento o éxito -->
        <div class="maintenance-icon">
          <i class="fas" [ngClass]="getIconClass()"></i>
        </div>

        <!-- Mensaje principal -->
        <div class="maintenance-message">
          <h2 [ngClass]="getTitleClass()">{{ getTitle() }}</h2>
          <p class="message-text">{{ getMessageText() }}</p>
        </div>

        <!-- Información adicional -->
        <div class="maintenance-info" *ngIf="maintenanceInfo && !isSystemActive()">
          <div class="info-card">
            <h3>Información del Mantenimiento</h3>
            <p><strong>Motivo:</strong> {{ maintenanceInfo.message }}</p>
            <p *ngIf="estimatedTime"><strong>Tiempo estimado:</strong> {{ estimatedTime }}</p>
            <p class="auto-check"><strong>Verificación automática:</strong> El sistema se reactivará automáticamente cuando termine el mantenimiento.</p>
          </div>
        </div>

        <!-- Mensaje de redirección -->
        <div class="redirect-message" *ngIf="isSystemActive()">
          <div class="success-animation">
            <i class="fas fa-check-circle"></i>
          </div>
          <p>El sistema ha sido reactivado exitosamente.</p>
          <p><strong>Redirigiendo al login automáticamente...</strong></p>
          <p class="small-text">Su sesión será cerrada por seguridad.</p>
        </div>

        <!-- Botones de acción - Solo mostrar si NO está reactivado -->
        <div class="action-buttons" *ngIf="!isSystemActive() && !isChecking">
          <button class="btn btn-secondary" (click)="goToLogin()">
            <i class="fas fa-arrow-left"></i>
            Volver al Login
          </button>
        </div>

        <!-- Footer -->
        <div class="maintenance-footer">
          <p>Para asistencia urgente, contacte al administrador del sistema</p>
          <p class="timestamp">Última verificación: {{ lastCheck | date:'medium' }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .maintenance-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .maintenance-content {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 40px;
      text-align: center;
      max-width: 600px;
      width: 100%;
      animation: slideUp 0.8s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .logo-section {
      margin-bottom: 30px;
    }

    .hospital-logo {
      max-width: 80px;
      height: auto;
      margin-bottom: 15px;
    }

    .logo-section h1 {
      color: #2c3e50;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .maintenance-icon {
      margin-bottom: 30px;
    }

    .maintenance-icon i {
      font-size: 64px;
      animation: rotate 2s linear infinite;
    }

    .maintenance-icon i.fa-tools {
      color: #f39c12;
    }

    .maintenance-icon i.fa-check-circle {
      color: #27ae60;
      animation: none;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .maintenance-message h2 {
      color: #2c3e50;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 15px;
    }

    .maintenance-message h2.text-success {
      color: #27ae60;
    }

    .maintenance-message h2.text-maintenance {
      color: #2c3e50;
    }

    .message-text {
      color: #7f8c8d;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }

    .maintenance-info {
      margin-bottom: 30px;
    }

    .info-card {
      background: #f8f9fa;
      border-left: 4px solid #3498db;
      padding: 20px;
      border-radius: 8px;
      text-align: left;
    }

    .info-card h3 {
      color: #2c3e50;
      margin-bottom: 15px;
      font-size: 18px;
    }

    .info-card p {
      margin-bottom: 10px;
      color: #5a6c7d;
    }

    .auto-check {
      background: #e8f5e8;
      padding: 10px;
      border-radius: 5px;
      border-left: 3px solid #27ae60;
      font-style: italic;
    }

    .countdown-section {
      margin-bottom: 30px;
    }

    .countdown-section h3 {
      color: #2c3e50;
      font-size: 18px;
      margin-bottom: 15px;
    }

    .countdown {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .countdown-number {
      background: #3498db;
      color: white;
      font-size: 24px;
      font-weight: bold;
      padding: 10px 15px;
      border-radius: 10px;
      min-width: 60px;
    }

    .countdown-label {
      color: #7f8c8d;
      font-size: 14px;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
      transform: translateY(-2px);
    }

    .maintenance-footer {
      border-top: 1px solid #ecf0f1;
      padding-top: 20px;
      color: #7f8c8d;
      font-size: 14px;
    }

    .timestamp {
      margin-top: 10px;
      font-size: 12px;
      color: #bdc3c7;
    }

    .redirect-message {
      margin: 30px 0;
      padding: 20px;
      background: #d5f4e6;
      border-radius: 10px;
      border-left: 4px solid #27ae60;
    }

    .success-animation {
      margin-bottom: 15px;
    }

    .success-animation i {
      font-size: 48px;
      color: #27ae60;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .redirect-message p {
      margin: 8px 0;
      color: #2c3e50;
    }

    .small-text {
      font-size: 14px;
      color: #7f8c8d !important;
      font-style: italic;
    }

    .text-success {
      color: #27ae60;
    }

    .text-warning {
      color: #f39c12;
    }

    .fa-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .maintenance-content {
        padding: 30px 20px;
        margin: 10px;
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 100%;
        max-width: 250px;
      }
    }
  `]
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  maintenanceMessage: string = '';
  maintenanceInfo: any = null;
  countdown: number = 30;
  lastCheck: Date = new Date();
  isChecking: boolean = false;
  estimatedTime: string = '';
  private isSystemReactivated: boolean = false;
  redirectCountdown: number = 3;
  
  private subscription: Subscription = new Subscription();
  private countdownTimer: Subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Inicializar componente simple sin MaintenanceService
    this.isSystemReactivated = false;
    this.loadMaintenanceData();
    this.startCountdown();
    this.startMaintenanceCheck();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.countdownTimer.unsubscribe();
  }

  loadMaintenanceData(): void {
    // Configuración básica de mantenimiento
    this.maintenanceMessage = 'Sistema en mantenimiento. Estamos trabajando para mejorarlo.';
    this.estimatedTime = 'Aproximadamente 30 minutos';
  }

  startCountdown(): void {
    // El countdown ya no es necesario para verificación manual
    // Solo mantenemos el timer para mostrar el tiempo transcurrido
    this.countdownTimer = timer(0, 1000).subscribe(() => {
      this.countdown = (this.countdown > 0) ? this.countdown - 1 : 0;
    });
  }

  startMaintenanceCheck(): void {
    // Verificar cada 5 segundos si el sistema sigue en mantenimiento
    this.subscription.add(
      timer(5000, 5000).subscribe(() => {
        // Hacer una petición simple al backend para verificar si sigue en mantenimiento
        this.http.get('/api/health-check').subscribe({
          next: () => {
            // Si la petición es exitosa, el sistema ya no está en mantenimiento
            if (!this.isSystemReactivated) {
              this.showSystemActiveMessage();
            }
          },
          error: (error) => {
            // Si es 503, sigue en mantenimiento, no hacer nada
            // Si es otro error, también mostrar que está activo
            if (error.status !== 503 && !this.isSystemReactivated) {
              this.showSystemActiveMessage();
            }
          }
        });
      })
    );
  }

  showSystemActiveMessage(): void {
    console.log('Sistema detectado como activo - mostrando mensaje de reactivación');
    // Mostrar mensaje de que el sistema está activo
    this.maintenanceMessage = '¡Sistema reactivado! El sistema está listo para usar.';
    this.isSystemReactivated = true;
    this.redirectCountdown = 3;
    
    // Detener el countdown y verificación
    this.countdownTimer.unsubscribe();
    this.subscription.unsubscribe();
    
    // Contador visual para la redirección
    const redirectTimer = timer(0, 1000).subscribe(() => {
      this.redirectCountdown--;
      if (this.redirectCountdown <= 0) {
        console.log('Redirigiendo automáticamente al login...');
        redirectTimer.unsubscribe();
        this.router.navigate(['/login']);
      }
    });
  }

  isSystemActive(): boolean {
    // Solo mostrar como activo si específicamente hemos detectado la reactivación
    const isActive = this.isSystemReactivated && this.maintenanceMessage.includes('reactivado');
    console.log('isSystemActive():', {
      isSystemReactivated: this.isSystemReactivated,
      messageIncludes: this.maintenanceMessage.includes('reactivado'),
      result: isActive
    });
    return isActive;
  }

  getIconClass(): string {
    if (this.isSystemActive()) {
      return 'fa-check-circle text-success';
    }
    return 'fa-tools text-warning';
  }

  getTitleClass(): string {
    if (this.isSystemActive()) {
      return 'text-success';
    }
    return 'text-maintenance';
  }

  getTitle(): string {
    if (this.isSystemActive()) {
      return '¡Sistema Reactivado!';
    }
    return 'Sistema en Mantenimiento';
  }

  getMessageText(): string {
    if (this.isSystemActive()) {
      return `El sistema ha sido reactivado exitosamente. Redirigiendo al login en ${this.redirectCountdown} segundos...`;
    }
    return this.maintenanceMessage || 'Estamos realizando mejoras en el sistema para brindarle un mejor servicio.';
  }

  goToLogin(): void {
    // Navegar directamente al login usando Angular Router
    this.router.navigate(['/login']);
  }

  onImageError(event: any): void {
    // Si falla cargar la imagen, ocultarla
    event.target.style.display = 'none';
  }

  private formatRetryTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} segundos`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minutos`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return remainingMinutes > 0 ? `${hours} horas y ${remainingMinutes} minutos` : `${hours} horas`;
    }
  }
}