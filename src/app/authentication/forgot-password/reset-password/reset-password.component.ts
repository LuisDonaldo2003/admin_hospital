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
export class ResetPasswordComponent implements OnInit {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  errorMsg = '';
  successMsg = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.patchValue({ email });
    }
  }

  onSubmit() {
    if (this.form.invalid || this.form.value.password !== this.form.value.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden o son inválidas.';
      return;
    }

    this.errorMsg = '';
    this.loading = true;

    this.http.post(`${URL_SERVICIOS}/forgot-password/reset`, {
      email: this.form.value.email,
      password: this.form.value.password,
      password_confirmation: this.form.value.confirmPassword
    }).subscribe({
      next: (res: any) => {
        this.successMsg = res.message;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error.message || 'Error al cambiar la contraseña.';
      }
    });
  }
}
