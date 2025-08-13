import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepartamentsMComponent } from './departaments-m.component';
import { AddDepartamentMComponent } from './add-departament-m/add-departament-m.component';
import { ListDepartamentMComponent } from './list-departament-m/list-departament-m.component';
import { EditDepartamentMComponent } from './edit-departament-m/edit-departament-m.component';

const routes: Routes = [{
  path:'',
  component: DepartamentsMComponent,
  children:[
    {
      path: 'add-departament',
      component: AddDepartamentMComponent
    },
    {
      path: 'list-departament',
      component: ListDepartamentMComponent
    },
    {
      path: 'list-departament/edit-departament/:id',
      component: EditDepartamentMComponent
    }
  ]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartamentsMRoutingModule { }
