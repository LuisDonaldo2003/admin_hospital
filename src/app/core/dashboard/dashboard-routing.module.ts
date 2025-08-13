// Módulo de rutas para los dashboards principales del sistema
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { RoleGuard } from 'src/app/shared/gaurd/role.guard';

// Definición de rutas hijas bajo el dashboard principal
const routes: Routes = [
  {
    path: '',
    component: DashboardComponent, // Componente contenedor de los dashboards
    children: [
      {
        path: '',
        redirectTo: 'admin-dashboard', // Redirige a admin-dashboard por defecto
        pathMatch: 'full'
      },
      {
        path: 'admin-dashboard',
        canActivate: [RoleGuard], // Protege la ruta por roles
        data: { allowedRoles: ['director general', 'subdirector general'] },
        loadChildren: () => import('./admin-dashboard/admin-dashboard.module').then(
          (m) => m.AdminDashboardModule
        ), // Lazy loading del módulo de admin
      },
      {
        path: 'doctor-dashboard',
        canActivate: [RoleGuard],
        data: { allowedRoles: ['doctor', 'director general', 'subdirector general'] },
        loadChildren: () =>
          import('./doctor-dashboard/doctor-dashboard.module').then(
            (m) => m.DoctorDashboardModule
          ), // Lazy loading del módulo de doctor
      },
      {
        path: 'patient-dashboard',
        canActivate: [RoleGuard],
        data: { allowedRoles: ['patient', 'paciente', 'director general', 'subdirector general'] },
        loadChildren: () =>
          import('./patient-dashboard/patient-dashboard.module').then(
            (m) => m.PatientDashboardModule
          ), // Lazy loading del módulo de paciente
      },
    ]
  }
];

// Módulo de rutas para los dashboards
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
