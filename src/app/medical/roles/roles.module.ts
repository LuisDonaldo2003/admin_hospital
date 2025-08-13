import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesRoutingModule } from './roles-routing.module';
import { RolesComponent } from './roles.component';
import { AddRoleUserComponent } from './add-role-user/add-role-user.component';
import { EditRoleUserComponent } from './edit-role-user/edit-role-user.component';
import { ListRoleUserComponent } from './list-role-user/list-role-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RolesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    RolesComponent, // Importar como standalone
    AddRoleUserComponent, // Importar como standalone
    EditRoleUserComponent, // Importar como standalone
    ListRoleUserComponent, // Importar como standalone
  ],
})
export class RolesModule { }
