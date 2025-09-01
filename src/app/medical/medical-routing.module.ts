import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MedicalComponent } from './medical.component';
import { AuthGuard } from '../shared/gaurd/auth.guard';

const routes: Routes = [
  {
    path:'',
    component: MedicalComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'roles',
        loadChildren: () =>
          import('./roles/roles.module').then((m) => m.RolesModule),
      },
      {
        path: 'staffs',
        loadChildren: () =>
          import('./staff/staff.module').then((m) => m.StaffModule),
      },
      {
        path: 'departaments-m',
        loadChildren: () =>
          import('./departaments-m/departaments-m.module').then((m) => m.DepartamentsMModule),
      },
      {
        path: 'contract-types',
        loadChildren: () =>
          import('./contract-types/contract-types.module').then((m) => m.ContractTypesModule),
      },
      {
        path: 'profile-m',
        loadChildren: () =>
          import('./profile-m/profile-m.module').then((m) => m.ProfileMModule),
      },
      {
        path: 'archives',
        loadChildren: () => 
          import('./archive/archive.module').then(m => m.ArchiveModule)
      },
      {
        path: 'organization-chart',
        loadChildren: () => 
          import('./organization-chart/organization-chart.module').then(m => m.OrganizationChartModule)
      },
       {
        path: 'pharmacy',
        loadChildren: () => 
          import('./pharmacy/pharmacy.module').then(m => m.PharmacyModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => 
          import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'credits',
        loadChildren: () => 
          import('./credits/credits.module').then(m => m.CreditsModule)
      },

    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicalRoutingModule { }
