import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DepartamentsMRoutingModule } from './departaments-m-routing.module';
import { DepartamentsMComponent } from './departaments-m.component';
import { AddDepartamentMComponent } from './add-departament-m/add-departament-m.component';
import { EditDepartamentMComponent } from './edit-departament-m/edit-departament-m.component';
import { ListDepartamentMComponent } from './list-departament-m/list-departament-m.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    DepartamentsMRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    DepartamentsMComponent,
    AddDepartamentMComponent,
    EditDepartamentMComponent,
    ListDepartamentMComponent
  ]
})
export class DepartamentsMModule { }
