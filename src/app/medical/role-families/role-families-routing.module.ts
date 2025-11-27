import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListRoleFamilyComponent } from './list-role-family/list-role-family.component';
import { AddRoleFamilyComponent } from './add-role-family/add-role-family.component';
import { EditRoleFamilyComponent } from './edit-role-family/edit-role-family.component';
import { AssignRolesRoleFamilyComponent } from './assign-roles-role-family/assign-roles-role-family.component';
import { RoleFamiliesComponent } from './role-families.component';
import { PermissionGuard } from 'src/app/shared/gaurd/permission.guard';

const routes: Routes = [{
  path: '',
  component: RoleFamiliesComponent,
  children: [
    {
      path: 'register',
      component: AddRoleFamilyComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['register_role_family'] }
    },
    {
      path: 'list',
      component: ListRoleFamilyComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_role_family'] }
    },
    {
      path: 'assign',
      component: AssignRolesRoleFamilyComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_role_family'] }
    },
    {
      path: 'list/edit/:id',
      component: EditRoleFamilyComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_role_family'] }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleFamiliesRoutingModule { }
