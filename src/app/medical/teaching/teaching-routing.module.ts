import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeachingComponent } from './teaching.component';
import { AddAreasComponent } from './areas/add-areas/add-areas.component';
import { PermissionGuard } from 'src/app/shared/gaurd/permission.guard';
import { ListAreasComponent } from './areas/list-areas/list-areas.component';
import { EditAreasComponent } from './areas/edit-areas/edit-areas.component';
import { AddAssistantsComponent } from './assistants/add-assistants/add-assistants.component';
import { ListAssistantsComponent } from './assistants/list-assistants/list-assistants.component';
import { EditAssistantsComponent } from './assistants/edit-assistants/edit-assistants.component';
import { AddEvaluationsComponent } from './evaluations/add-evaluations/add-evaluations.component';
import { ListEvaluationsComponent } from './evaluations/list-evaluations/list-evaluations.component';
import { EditEvaluationsComponent } from './evaluations/edit-evaluations/edit-evaluations.component';
import { AddModalitiesComponent } from './modalities/add-modalities/add-modalities.component';
import { ListModalitiesComponent } from './modalities/list-modalities/list-modalities.component';
import { EditModalitiesComponent } from './modalities/edit-modalities/edit-modalities.component';
import { AddStakeholdingsComponent } from './stakeholdings/add-stakeholdings/add-stakeholdings.component';
import { ListStakeholdingsComponent } from './stakeholdings/list-stakeholdings/list-stakeholdings.component';
import { EditStakeholdingsComponent } from './stakeholdings/edit-stakeholdings/edit-stakeholdings.component';

const routes: Routes = [{
  path: '',
  component: TeachingComponent,
  children: [
    //Assistants Routes (Registros de asistencias)
    {
      path: 'add_teaching',
      component: AddAssistantsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['add_teaching'] }
    },
    {
      path: 'list_teaching',
      component: ListAssistantsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_teaching'] }
    },
    {
      path: 'edit_teaching/:id',
      component: EditAssistantsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_teaching'] }
    },
    //Evaluation Routes (Evaluaciones)
     {
      path: 'add_evaluation',
      component: AddEvaluationsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['add_evaluation'] }
    },
    {
      path: 'list_evaluation',
      component: ListEvaluationsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_evaluation'] }
    },
    {
      path: 'edit_evaluation/:id',
      component: EditEvaluationsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_evaluation'] }
    },
    //Modalities Routes (Modalidades)
    {
      path: 'add_modality',
      component: AddModalitiesComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['add_modality'] }
    },
    {
      path: 'list_modality',
      component: ListModalitiesComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_modality'] }
    },
    {
      path: 'edit_modality/:id',
      component: EditModalitiesComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_modality'] }
    },
    //Skateholdings Routes (Participaciones)
    {
      path: 'add_stakeholding',
      component: AddStakeholdingsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['add_stakeholding'] }
    },
    {
      path: 'list_stakeholding',
      component: ListStakeholdingsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_stakeholding'] }
    },
    {
      path: 'edit_stakeholding/:id',
      component: EditStakeholdingsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_stakeholding'] }
    },
    //Areas Routes (Áreas)
    {
      path: 'add_area',
      component: AddAreasComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['add_area'] }
    },
    {
      path: 'list_area',
      component: ListAreasComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_area'] }
    },
    {
      path: 'edit_area/:id',
      component: EditAreasComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_area'] }
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeachingRoutingModule { }
