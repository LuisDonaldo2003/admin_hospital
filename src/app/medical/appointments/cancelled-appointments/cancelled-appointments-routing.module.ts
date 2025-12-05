import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCancelledComponent } from './list-cancelled/list-cancelled.component';

const routes: Routes = [
  {
    path: 'list',
    component: ListCancelledComponent
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
export class CancelledAppointmentsRoutingModule { }
