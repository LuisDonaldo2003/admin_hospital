import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
// Componente para verificar el código de activación de cuenta
export class VerifyCodeComponent implements OnInit {
  // Formulario reactivo principal
  form!: FormGroup;
  // Arreglo de controles para cada carácter del código
  codeControls: FormControl[] = [];
  // Estado de envío y carga
  submitted = false;
  loading = false;
  // Mensajes de éxito y error
  successMsg = '';
  errorMsg = '';
  resendSuccessMsg = '';

  // Temporizador para expiración del código
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

  // Inicializa el formulario y el temporizador al cargar el componente
  ngOnInit(): void {
    // Crea los controles para los 8 caracteres del código
    this.codeControls = Array.from({ length: 8 }, () => new FormControl('', [Validators.required, Validators.maxLength(1)]));
    // Construye el formulario con email y grupo de código
    this.form = this.fb.group({
      email: [localStorage.getItem('pending_email') || '', [Validators.required, Validators.email]],
      code: this.fb.group(
        this.codeControls.reduce((acc, ctrl, idx) => {
          acc[`char${idx}`] = ctrl;
          return acc;
        }, {} as { [key: string]: FormControl })
      )
    });
    // Inicia el temporizador de expiración del código
    this.startCountdown();
  }

  // Inicia y actualiza el temporizador de expiración del código
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

  // Actualiza la visualización del temporizador en formato mm:ss
  updateTimerDisplay() {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.timerDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Une los valores de los controles del código en un solo string
  getCodeValue(): string {
    return this.codeControls.map(ctrl => ctrl.value).join('');
  }

  // Enfoca automáticamente el siguiente input al ingresar un carácter
  autoFocusNext(event: any, index: number) {
    const input = event.target;
    if (input.value && index < this.codeControls.length - 1) {
      const nextInput = input.parentElement?.children[index + 1];
      if (nextInput) (nextInput as HTMLElement).focus();
    }
  }

  // Enfoca automáticamente el input anterior si se borra el carácter
  autoFocusPrev(event: any, index: number) {
    const input = event.target;
    if (!input.value && index > 0) {
      const prevInput = input.parentElement?.children[index - 1];
      if (prevInput) (prevInput as HTMLElement).focus();
    }
  }

  // Permite pegar el código completo en los inputs y los distribuye automáticamente
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

  // Solicita al backend el reenvío del código y reinicia el temporizador
  resendCode() {
    const email = this.form.get('email')?.value;
    if (!email) return;
    this.http.post<any>(`${URL_SERVICIOS}/resend-code`, { email }).subscribe({
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

  // Envía el código ingresado al backend para validarlo y redirige si es correcto
  onSubmit() {
    this.submitted = true;
    this.errorMsg = '';
    this.successMsg = '';
    // Valida que todos los campos estén completos y el código no haya expirado
    if (this.codeControls.some(ctrl => ctrl.invalid) || this.timerExpired) return;
    this.loading = true;
    const fullCode = this.getCodeValue();
    const payload = {
      email: this.form.get('email')?.value,
      code: fullCode
    };
    this.http.post<any>(`${URL_SERVICIOS}/verify-code`, payload).subscribe({
      next: (res) => {
        // Si el backend retorna access_token, guarda sesión
        if (res.access_token) {
          this.authService.savelocalStorage(res);
        }
        this.successMsg = res.message || 'Verificación exitosa.';
        localStorage.removeItem('pending_email');
        // Redirige según si el perfil está completo o no
        setTimeout(() => {
          if (!res.is_profile_complete) {
            this.router.navigate(['/complete-profile']);
          } else {
            this.router.navigate(['/profile']);
          }
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Código incorrecto o expirado.';
      }
    });
  }
}
