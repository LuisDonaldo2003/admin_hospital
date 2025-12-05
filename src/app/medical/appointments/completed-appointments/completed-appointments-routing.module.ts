import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCompletedComponent } from './list-completed/list-completed.component';

const routes: Routes = [
  {
    path: 'list',
    component: ListCompletedComponent
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
export class CompletedAppointmentsRoutingModule { }
