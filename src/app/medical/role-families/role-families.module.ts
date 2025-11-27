import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { RoleFamiliesRoutingModule } from './role-families-routing.module';
import { RoleFamiliesComponent } from './role-families.component';
import { AddRoleFamilyComponent } from './add-role-family/add-role-family.component';
import { EditRoleFamilyComponent } from './edit-role-family/edit-role-family.component';
import { ListRoleFamilyComponent } from './list-role-family/list-role-family.component';
import { AssignRolesRoleFamilyComponent } from './assign-roles-role-family/assign-roles-role-family.component';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RoleFamiliesRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,
        RoleFamiliesComponent, // Importar como standalone
        AddRoleFamilyComponent, // Importar como standalone
        EditRoleFamilyComponent, // Importar como standalone
        ListRoleFamilyComponent, // Importar como standalone
        AssignRolesRoleFamilyComponent, // Importar como standalone
    ],
})
export class RoleFamiliesModule { }
