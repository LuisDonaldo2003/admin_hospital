import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { URL_SERVICIOS } from 'src/app/config/config';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.scss']
})
export class VerifyCodeComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: [localStorage.getItem('pending_email') || '', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMsg = '';
    this.successMsg = '';

    if (this.form.invalid) return;

    this.loading = true;

    this.http.post<any>(`${URL_SERVICIOS}/verify-code`, this.form.value).subscribe({
      next: (res) => {
        if (res.access_token) {
          this.authService.savelocalStorage(res);
        }

        this.successMsg = res.message || 'Verificación exitosa.';
        localStorage.removeItem('pending_email');

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Código incorrecto o expirado.';
      }
    });
  }
}
