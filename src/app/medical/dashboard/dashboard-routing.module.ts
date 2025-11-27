import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArchiveDashboardComponent } from './archive-dashboard/archive-dashboard.component';
import { UserActivityDashboardComponent } from './user-activity-dashboard/user-activity-dashboard.component';
import { PermissionGuard } from 'src/app/shared/gaurd/permission.guard';

const routes: Routes = [
  { path: '', redirectTo: 'archive', pathMatch: 'full' },
  { path: 'archive', component: ArchiveDashboardComponent, canActivate: [PermissionGuard], data: { requiredPermissions: ['archive_dashboard'] } },
  { path: 'user-activities', component: UserActivityDashboardComponent, canActivate: [PermissionGuard], data: { requiredPermissions: ['user_activity_dashboard'] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
