import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication.component';

const routes: Routes = [
  {
    path: '',
    component: AuthenticationComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadChildren: () =>
          import('./login/login.module').then((m) => m.LoginModule),
      },
      {
        path: 'forgot-password',
        loadChildren: () =>
          import('./forgot-password/forgot-password.module').then(
            (m) => m.ForgotPasswordModule
          ),
      },
      {
        path: 'register',
        loadChildren: () =>
          import('./register/register.module').then((m) => m.RegisterModule),
      },
      {
        path: 'change-password2',
        loadChildren: () =>
          import('./change-password2/change-password2.module').then(
            (m) => m.ChangePassword2Module
          ),
      },
      {
        path: 'lock-screen',
        loadChildren: () =>
          import('./lock-screen/lock-screen.module').then(
            (m) => m.LockScreenModule
          ),
      },
      {
        path: 'verify-code',
        loadComponent: () =>
          import('./verify-code/verify-code.component').then(
            (m) => m.VerifyCodeComponent
          ),
      },
      {
        path: 'verify-reset-code',
        loadComponent: () =>
          import('./forgot-password/verify-reset-code/verify-reset-code.component').then(
            (m) => m.VerifyResetCodeComponent
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./forgot-password/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
      },
      {
        path: 'complete-profile',
        loadComponent: () =>
          import('./complete-profile/complete-profile.component')
            .then(m => m.CompleteProfileComponent)
      }
      
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
