import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListOrganizationComponent } from './list-organization/list-organization.component';
import { OrganizationChartRoutingModule } from './organization-chart-routing.module';

@NgModule({
  imports: [
    CommonModule,
    OrganizationChartRoutingModule
  ],
})
export class OrganizationChartModule { }
