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
        path: 'dashboard',
        loadChildren: () => 
          import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'credits',
        loadChildren: () => 
          import('./credits/credits.module').then(m => m.CreditsModule)
      },
      {
        path: 'personal',
        loadComponent: () => 
          import('./personal/personal.component').then(m => m.PersonalComponent),
        children: [
          {
            path: 'list_personal',
            loadComponent: () => 
              import('./personal/personal-list/personal-list.component').then(m => m.PersonalListComponent)
          },
          {
            path: 'add_personal',
            loadComponent: () => 
              import('./personal/add-personal/add-personal.component').then(m => m.AddPersonalComponent)
          },
          {
            path: 'edit_personal/:id',
            loadComponent: () => 
              import('./personal/edit-personal/edit-personal.component').then(m => m.EditPersonalComponent)
          },
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full'
          }
        ]
      },

    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicalRoutingModule { }
