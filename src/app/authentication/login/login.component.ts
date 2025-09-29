import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { ProfileService } from 'src/app/core/profile/service/profile.service';
import { routes } from 'src/app/shared/routes/routes';
import { RoleConfigService } from 'src/app/shared/services/role-config.service';

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
   * Inyecta los servicios de autenticación, navegación, perfil y configuración de roles
   */
  constructor(
    public auth: AuthService,
    public router: Router,
    private profileService: ProfileService,
    private roleConfigService: RoleConfigService
  ) {}

  /**
   * Inicializa el componente de login
   */
  ngOnInit(): void {
    // Si deseas limpiar sesiones anteriores
    // localStorage.removeItem('authenticated');
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
   * Procesa los roles y navega al perfil (destino fijo después del login)
   * Todos los usuarios son redirigidos al perfil independientemente de su rol
   */
  private processRolesAndNavigate(raw: any[]): void {
    // CAMBIO: Todos los usuarios van al perfil después del login
    const profileRoute = this.roleConfigService.getPostLoginDestination();
    this.router.navigate([profileRoute]);
  }
}
