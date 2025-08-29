import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { ProfileService } from 'src/app/core/profile/service/profile.service';
import { routes } from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  // Rutas globales para navegación
  public routes = routes;
  // Controla la visibilidad del campo de contraseña
  public passwordClass = false;
  // Indica si hubo error en el login
  public ERROR = false;
  // Indica si está cargando la petición de login
  public loading = false;
  // Mensaje mostrado cuando la cuenta aún no ha sido verificada
  public unverifiedMsg = '';

  // Formulario reactivo para login con validaciones
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  /**
   * Inyecta los servicios de autenticación, navegación y perfil
   */
  constructor(
    public auth: AuthService,
    public router: Router,
    private profileService: ProfileService
  ) {}

  /**
   * Inicializa el componente de login
   */
  ngOnInit(): void {
    // Limpiar sesiones anteriores para permitir auto-login cada vez
    localStorage.removeItem('authenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Auto-login para desarrollo - usuario archivo@gmail.com
    this.performAutoLogin();
  }

  /**
   * Realiza auto-login para agilizar el desarrollo (solo para archivo@gmail.com)
   */
  private performAutoLogin(): void {
    // Configuración para auto-login de desarrollo
    const autoLoginEmail = 'archivo@gmail.com';
    const autoLoginPassword = '12345678';
    
    // Llenar formulario automáticamente
    this.form.patchValue({
      email: autoLoginEmail,
      password: autoLoginPassword
    });
    
    // Ejecutar login automáticamente después de un pequeño delay
    setTimeout(() => {
      this.loginFormSubmit();
    }, 500);
  }

  /**
   * Acceso rápido a los controles del formulario
   */
  get f() {
    return this.form.controls;
  }

  /**
   * Envía el formulario de login y gestiona la respuesta del backend
   */
  loginFormSubmit(): void {
    if (this.form.invalid) return;

    this.ERROR = false;
    this.unverifiedMsg = '';
    this.loading = true;

    const { email, password } = this.form.value;

    this.auth.login(email || '', password || '').subscribe({
      next: (resp: any) => {
        this.loading = false;

        if (resp?.success) {
          // Login exitoso: redirige según el rol detectado
          this.redirectByRole();
        } else if (resp?.unverified) {
          // Caso de usuario autenticado pero sin verificación de cuenta
          this.unverifiedMsg = 'Tu cuenta no está verificada. Te hemos enviado un nuevo código.';
          this.router.navigate(['/verify-code']);
        } else {
          // Credenciales inválidas u otro error devuelto por el backend
          this.ERROR = true;
        }
      },
      error: (err) => {
        this.loading = false;
        this.ERROR = true;
      }
    });
  }

  /**
   * Alterna la visibilidad del campo de contraseña
   */
  togglePassword(): void {
    this.passwordClass = !this.passwordClass;
  }

  /**
   * Redirige al usuario según su rol después de login
   */
  private redirectByRole(): void {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    let rawRoles: any[] = (user?.roles) || [];
    if (!rawRoles.length) {
      // Fallback: si no llegan roles en el objeto de login, solicita el perfil para obtenerlos
      this.profileService.getProfile().subscribe({
        next: (resp: any) => {
          const rolesResp = resp?.roles || [];
          this.processRolesAndNavigate(rolesResp);
        },
        error: () => this.router.navigate([routes.adminDashboard])
      });
    } else {
      this.processRolesAndNavigate(rawRoles);
    }
  }

  /**
   * Procesa los roles y navega al dashboard correspondiente
   */
  private processRolesAndNavigate(raw: any[]): void {
    // Normaliza roles: acepta string u objeto { name }, recorta espacios y convierte a minúsculas
    const roles = raw
      .map(r => (typeof r === 'string' ? r : (r?.name || '')))
      .filter(Boolean)
      .map(r => r.trim());
    const rolesLower = roles.map(r => r.toLowerCase());
    if (rolesLower.includes('archivo') || rolesLower.includes('archive')) {
      this.router.navigate([routes.archiveDashboard]);
    } else if (rolesLower.includes('doctor')) {
      this.router.navigate([routes.doctorDashboard]);
    } else if (rolesLower.includes('patient') || rolesLower.includes('paciente')) {
      this.router.navigate([routes.patientDashboard]);
    } else if (rolesLower.includes('director general')) {
      this.router.navigate([routes.adminDashboard]);
    } else if (rolesLower.includes('subdirector general')) {
      this.router.navigate([routes.adminDashboard]);
    } else if (rolesLower.includes('developer')) {
      this.router.navigate([routes.adminDashboard]);
    } else {
      this.router.navigate([routes.adminDashboard]);
    }
  }
}
