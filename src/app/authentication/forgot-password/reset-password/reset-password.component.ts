import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { URL_SERVICIOS } from 'src/app/config/config';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})

// Componente para restablecer la contraseña del usuario
export class ResetPasswordComponent implements OnInit {
  // Formulario reactivo con validaciones para email y contraseñas
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  // Mensaje de error mostrado si ocurre algún problema
  errorMsg = '';
  // Mensaje de éxito mostrado si el cambio fue correcto
  successMsg = '';
  // Indica si la petición está en curso
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  // Al inicializar, obtiene el email desde la URL y lo coloca en el formulario
  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.patchValue({ email });
    }
  }

  // Envía la nueva contraseña al backend para restablecerla
  onSubmit() {
    // Valida que el formulario sea correcto y que las contraseñas coincidan
    if (this.form.invalid || this.form.value.password !== this.form.value.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden o son inválidas.';
      return;
    }

    this.errorMsg = '';
    this.loading = true;

    // Realiza la petición al backend para cambiar la contraseña
    this.http.post(`${URL_SERVICIOS}/forgot-password/reset`, {
      email: this.form.value.email,
      password: this.form.value.password,
      password_confirmation: this.form.value.confirmPassword
    }).subscribe({
      next: (res: any) => {
        // Si es exitoso, muestra mensaje y redirige al login
        this.successMsg = res.message;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        // Si hay error, muestra mensaje y detiene el loading
        this.loading = false;
        this.errorMsg = err.error.message || 'Error al cambiar la contraseña.';
      }
    });
  }
}
