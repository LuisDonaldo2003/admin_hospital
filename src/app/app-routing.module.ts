import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { MaintenanceComponent } from './shared/components/maintenance/maintenance.component';
import { UploadLicenseComponent } from './upload-license/upload-license.component';
import { LicenseCheckGuard } from './core/guards/license-check.guard';
import { AuthService } from './shared/auth/auth.service';
// import { AuthGuard } from './shared/gaurd/auth.guard';

const routes: Routes = [
  {
    path: 'upload-license',
    component: UploadLicenseComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [LicenseCheckGuard, () => {
      const authService = inject(AuthService);
      const router = inject(Router);
      // Si el usuario ya está logueado con token válido
      if (authService.isLoggedIn() && !authService.isTokenExpired()) {
        // Intentar restaurar la última URL visitada
        const lastUrl = localStorage.getItem('lastVisitedUrl');
        if (lastUrl && lastUrl !== '/' && lastUrl !== '/login') {
          return router.parseUrl(lastUrl);
        }
        // Si no hay última URL, ir al dashboard por defecto
        const defaultRoute = authService.getDefaultRouteForUser();
        return router.parseUrl(defaultRoute);
      }
      // Si no está logueado o el token expiró, ir al login
      return router.parseUrl('/login');
    }],
    children: []
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent,
    canActivate: [LicenseCheckGuard],
  },
  {
    path: '',
    loadChildren: () => import('./core/core.module').then((m) => m.CoreModule),
    canActivate: [LicenseCheckGuard],
  },
  {
    path: '',
    loadChildren: () => import('./medical/medical.module').then((m) => m.MedicalModule),
    canActivate: [LicenseCheckGuard],
  },
  {
    path: '',
    loadChildren: () =>
      import('./authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
    // No aplicar LicenseCheckGuard a rutas de autenticación
    // La licencia se verifica antes de llegar aquí y en el interceptor
  },
  {
    path: 'error',
    loadChildren: () =>
      import('./error/error.module').then((m) => m.ErrorModule),
  },
  {
    path: '**',
    redirectTo: 'error/error404',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    useHash: false, // URLs limpias sin #
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
