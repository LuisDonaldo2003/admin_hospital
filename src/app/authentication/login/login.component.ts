import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { routes } from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  public routes = routes;
  public passwordClass = false;
  public ERROR = false;
  public loading = false;
  public unverifiedMsg = ''; // 🆕 Mensaje para cuentas no verificadas

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    public auth: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    // Si deseas limpiar sesiones anteriores
    // localStorage.removeItem('authenticated');
  }

  get f() {
    return this.form.controls;
  }

  loginFormSubmit(): void {
    if (this.form.invalid) return;

    this.ERROR = false;
    this.unverifiedMsg = ''; // limpiar msg anterior
    this.loading = true;

    const { email, password } = this.form.value;

    this.auth.login(email || '', password || '').subscribe({
      next: (resp: any) => {
        this.loading = false;

        if (resp?.success) {
          // ✅ Login exitoso
          this.router.navigate([this.routes.adminDashboard]);
        } else if (resp?.unverified) {
          // 🚨 Usuario no verificado
          this.unverifiedMsg = 'Tu cuenta no está verificada. Te hemos enviado un nuevo código.';
          this.router.navigate(['/verify-code']);
        } else {
          // ❌ Credenciales incorrectas u otro error
          this.ERROR = true;
        }
      },
      error: (err) => {
        console.error('Error de login:', err);
        this.loading = false;
        this.ERROR = true;
      }
    });
  }

  togglePassword(): void {
    this.passwordClass = !this.passwordClass;
  }
}
