import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ArchiveDashboardComponent } from './archive-dashboard/archive-dashboard.component';

@NgModule({
  imports: [CommonModule, SharedModule, DashboardRoutingModule, ArchiveDashboardComponent],
})
export class DashboardModule {}
