import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { MaintenanceComponent } from './shared/components/maintenance/maintenance.component';
import { AuthService } from './shared/auth/auth.service';
// import { AuthGuard } from './shared/gaurd/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [() => {
      const authService = inject(AuthService);
      const router = inject(Router);
      // Si el usuario ya está logueado con token válido, redirigir a su dashboard
      if (authService.isLoggedIn() && !authService.isTokenExpired()) {
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
  },
  {
    path: '',
    loadChildren: () => import('./core/core.module').then((m) => m.CoreModule),
  },
  {
    path: '',
    loadChildren: () => import('./medical/medical.module').then((m) => m.MedicalModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
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
    enableTracing: false, // Cambia a true para debug de rutas
    useHash: false, // Asegurar que use HTML5 pushState
    onSameUrlNavigation: 'reload' // Recargar si se navega a la misma URL
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
