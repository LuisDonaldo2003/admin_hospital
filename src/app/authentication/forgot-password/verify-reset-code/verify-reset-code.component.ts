import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { URL_SERVICIOS } from 'src/app/config/config';

@Component({
  selector: 'app-verify-reset-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './verify-reset-code.component.html',
  styleUrls: ['./verify-reset-code.component.scss']
})
export class VerifyResetCodeComponent implements OnInit {
  form!: FormGroup;
  codeControls: FormControl[] = [];
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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email') || '';
    localStorage.setItem('reset_email', emailFromQuery);

    this.codeControls = Array.from({ length: 8 }, () => new FormControl('', [Validators.required, Validators.maxLength(1)]));

    this.form = this.fb.group({
      email: [emailFromQuery, [Validators.required, Validators.email]],
      code: this.fb.group(
        this.codeControls.reduce((acc, ctrl, idx) => {
          acc[`char${idx}`] = ctrl;
          return acc;
        }, {} as { [key: string]: FormControl })
      )
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

  updateTimerDisplay() {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.timerDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getCodeValue(): string {
    return this.codeControls.map(ctrl => ctrl.value).join('');
  }

  autoFocusNext(event: any, index: number) {
    const input = event.target;
    if (input.value && index < this.codeControls.length - 1) {
      const nextInput = input.parentElement?.children[index + 1];
      if (nextInput) (nextInput as HTMLElement).focus();
    }
  }

  autoFocusPrev(event: any, index: number) {
    const input = event.target;
    if (!input.value && index > 0) {
      const prevInput = input.parentElement?.children[index - 1];
      if (prevInput) (prevInput as HTMLElement).focus();
    }
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const pastedText = pastedData.trim().replace(/\s+/g, '');
    for (let i = 0; i < this.codeControls.length; i++) {
      this.codeControls[i].setValue(pastedText[i] || '');
    }
    const firstEmptyIndex = this.codeControls.findIndex(ctrl => !ctrl.value);
    if (firstEmptyIndex >= 0) {
      const inputs = (event.target as HTMLElement).parentElement?.querySelectorAll('input');
      if (inputs && inputs[firstEmptyIndex]) {
        (inputs[firstEmptyIndex] as HTMLElement).focus();
      }
    }
  }

  resendCode() {
    const email = this.form.get('email')?.value;
    if (!email) return;

    this.http.post<any>(`${URL_SERVICIOS}/forgot-password/send-code`, { email }).subscribe({
      next: (res) => {
        this.resendSuccessMsg = res.message || 'Código reenviado.';
        this.countdown = 300;
        this.timerExpired = false;
        this.startCountdown();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo reenviar el código.';
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    this.errorMsg = '';
    this.successMsg = '';

    if (this.codeControls.some(ctrl => ctrl.invalid) || this.timerExpired) return;

    this.loading = true;

    const fullCode = this.getCodeValue();
    const payload = {
      email: this.form.get('email')?.value,
      code: fullCode
    };

    this.http.post<any>(`${URL_SERVICIOS}/forgot-password/verify-code`, payload).subscribe({
      next: (res) => {
        this.successMsg = res.message || 'Código verificado. Redirigiendo...';

        setTimeout(() => {
          this.router.navigate(['/reset-password'], { queryParams: { email: payload.email, token: res.token || fullCode } });
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Código incorrecto o expirado.';
      }
    });
  }
}
