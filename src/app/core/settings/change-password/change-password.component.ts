import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { URL_SERVICIOS } from 'src/app/config/config';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: false
})
export class ChangePasswordComponent implements OnInit {
  public routes = routes;
  public changePasswordForm!: FormGroup;
  public submitted = false;
  public loading = false;
  public successMessage = '';
  public errorMessage = '';
  public showCurrentPassword = false;
  public showNewPassword = false;
  public showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.changePasswordForm = this.formBuilder.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password_confirmation: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password');
    const confirmPassword = form.get('new_password_confirmation');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Stop if form is invalid
    if (this.changePasswordForm.invalid) {
      return;
    }

    this.loading = true;

    this.http.post(`${URL_SERVICIOS}/auth/change-password`, this.changePasswordForm.value)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.successMessage = response.message || 'Contraseña actualizada correctamente.';
          this.changePasswordForm.reset();
          this.submitted = false;

          // Redirect to profile after 2 seconds
          setTimeout(() => {
            this.router.navigate([this.routes.profile]);
          }, 2000);
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Error al actualizar la contraseña. Inténtelo de nuevo.';
        }
      });
  }
}
