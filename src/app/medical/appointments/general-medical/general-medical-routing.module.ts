import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListGeneralMedicalComponent } from './list-general-medical/list-general-medical.component';
import { AddGeneralMedicalComponent } from './add-general-medical/add-general-medical.component';
import { EditGeneralMedicalComponent } from './edit-general-medical/edit-general-medical.component';

const routes: Routes = [
  {
    path: 'list',
    component: ListGeneralMedicalComponent
  },
  {
    path: 'add',
    component: AddGeneralMedicalComponent
  },
  {
    path: 'edit/:id',
    component: EditGeneralMedicalComponent
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
export class GeneralMedicalRoutingModule { }
