import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationChartComponent } from './organization-chart.component';
import { ListOrganizationComponent } from './list-organization/list-organization.component';

const routes: Routes = [{
  path: '',
  component: OrganizationChartComponent,
  children: [
    {
      path: 'list-organization',
      component: ListOrganizationComponent
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationChartRoutingModule { }
