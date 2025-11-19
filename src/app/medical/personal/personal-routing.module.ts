// Este archivo ya no es necesario porque los componentes standalone
// se cargan directamente en el routing principal del medical module

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonalComponent } from './personal.component';
import { AddPersonalComponent } from './add-personal/add-personal.component';
import { PermissionGuard } from 'src/app/shared/gaurd/permission.guard';
import { PersonalListComponent } from './personal-list/personal-list.component';
import { EditPersonalComponent } from './edit-personal/edit-personal.component';

const routes: Routes = [{
  path: '',
  component: PersonalComponent,
  children: [
    {
      path: 'add_personal',
      component: AddPersonalComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['add_personal'] }
    },
    {
      path: 'list_personal',
      component: PersonalListComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_personal'] }
    },
    {
      path: 'edit_personal/:id',
      component: EditPersonalComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_personal'] }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonalRoutingModule { }
