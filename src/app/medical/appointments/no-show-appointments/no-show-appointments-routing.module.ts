import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListNoShowComponent } from './list-no-show/list-no-show.component';

const routes: Routes = [
  {
    path: 'list',
    component: ListNoShowComponent
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
export class NoShowAppointmentsRoutingModule { }
