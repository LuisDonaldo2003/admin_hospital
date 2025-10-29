import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffComponent } from './staff.component';
import { AddStaffNComponent } from './add-staff-n/add-staff-n.component';
import { ListStaffNComponent } from './list-staff-n/list-staff-n.component';
import { EditStaffNComponent } from './edit-staff-n/edit-staff-n.component';
import { PermissionGuard } from 'src/app/shared/gaurd/permission.guard';

const routes: Routes = [{
  path: '',
  component: StaffComponent,
  children: [
    {
      path: 'add-staff',
      component: AddStaffNComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['register_staff'] }
    },
    {
      path: 'list-staff',
      component: ListStaffNComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_staff'] }
    },
    {
      path: 'list-staff/edit-staff/:id',
      component: EditStaffNComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_staff'] }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
