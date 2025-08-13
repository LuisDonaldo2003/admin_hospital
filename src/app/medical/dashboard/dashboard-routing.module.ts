import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArchiveDashboardComponent } from './archive-dashboard/archive-dashboard.component';
import { RoleGuard } from 'src/app/shared/gaurd/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'archive', pathMatch: 'full' },
  { path: 'archive', component: ArchiveDashboardComponent, canActivate: [RoleGuard], data: { allowedRoles: ['archivo','archive','director general','subdirector general'] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
