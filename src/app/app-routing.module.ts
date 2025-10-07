import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceComponent } from './shared/components/maintenance/maintenance.component';
// import { AuthGuard } from './shared/gaurd/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
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
