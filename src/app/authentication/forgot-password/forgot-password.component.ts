import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { routes } from 'src/app/shared/routes/routes';
import { URL_SERVICIOS } from 'src/app/config/config';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  public routes = routes;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(private fb: FormBuilder, private router: Router,private http: HttpClient) {}

  onSubmit() {
    if (this.form.valid) {
      const email = this.form.value.email;
  
      this.http.post(`${URL_SERVICIOS}/forgot-password/send-code`, { email }).subscribe({
        next: (res: any) => {
          console.log(res.message);
          this.router.navigate(['forgot-password/verify-reset-code'], {
            queryParams: { email }
          });
        },
        error: (err: any) => {
          console.error('Error al enviar el código:', err);
          // Puedes mostrar un mensaje con error.error.message si quieres
        }
      });
  
    } else {
      this.form.markAllAsTouched();
    }
  }
  
}
