import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesComponent } from './roles.component';
import { AddRoleUserComponent } from './add-role-user/add-role-user.component';
import { ListRoleUserComponent } from './list-role-user/list-role-user.component';
import { EditRoleUserComponent } from './edit-role-user/edit-role-user.component';
import { PermissionGuard } from 'src/app/shared/gaurd/permission.guard';

const routes: Routes = [
  {
    path:'',
    component: RolesComponent,
    children: [
      {
        path: 'register',
        component: AddRoleUserComponent,
        canActivate: [PermissionGuard],
        data: { requiredPermissions: ['register_rol'] }
      },
      {
        path: 'list',
        component: ListRoleUserComponent,
        canActivate: [PermissionGuard],
        data: { requiredPermissions: ['list_rol'] }
      },
      {
        path: 'list/edit/:id',
        component: EditRoleUserComponent,
        canActivate: [PermissionGuard],
        data: { requiredPermissions: ['edit_rol'] }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesRoutingModule { }
