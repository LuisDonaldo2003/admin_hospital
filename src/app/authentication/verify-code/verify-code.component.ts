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
  resendSuccessMsg = '';

  countdown: number = 300;
  timerDisplay: string = '';
  timerExpired: boolean = false;
  interval: any;

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
    this.startCountdown();
  }

  startCountdown() {
    this.updateTimerDisplay();
    this.interval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.updateTimerDisplay();
      } else {
        this.timerExpired = true;
        clearInterval(this.interval);
      }
    }, 1000);
  }

  resendCode() {
    const email = this.form.get('email')?.value;
    if (!email) return;

    this.http.post<any>(`${URL_SERVICIOS}/resend-code`, { email }).subscribe({
      next: (res) => {
        this.resendSuccessMsg = res.message || 'Código reenviado.';
        this.countdown = 300;
        this.timerExpired = false;
        this.startCountdown(); // Reinicia el temporizador
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo reenviar el código.';
      }
    });
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.timerDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMsg = '';
    this.successMsg = '';

    if (this.form.invalid || this.timerExpired) return;

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
