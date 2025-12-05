import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListEspecialidadesComponent } from './list-especialidades/list-especialidades.component';
import { AddEspecialidadComponent } from './add-especialidad/add-especialidad.component';
import { EditEspecialidadComponent } from './edit-especialidad/edit-especialidad.component';

const routes: Routes = [
  {
    path: 'list',
    component: ListEspecialidadesComponent
  },
  {
    path: 'add',
    component: AddEspecialidadComponent
  },
  {
    path: 'edit/:id',
    component: EditEspecialidadComponent
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EspecialidadesRoutingModule { }
