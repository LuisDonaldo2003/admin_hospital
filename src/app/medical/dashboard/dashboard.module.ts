import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ArchiveDashboardComponent } from './archive-dashboard/archive-dashboard.component';
import { UserActivityDashboardComponent } from './user-activity-dashboard/user-activity-dashboard.component';

@NgModule({
  imports: [CommonModule, SharedModule, DashboardRoutingModule, ArchiveDashboardComponent, UserActivityDashboardComponent],
})
export class DashboardModule {}
