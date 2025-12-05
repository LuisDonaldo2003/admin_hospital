import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentsComponent } from './appointments.component';
import { PermissionGuard } from 'src/app/shared/gaurd/permission.guard';

// Doctors
import { AddDoctorComponent } from './doctors/add-doctor/add-doctor.component';
import { ListDoctorsComponent } from './doctors/list-doctors/list-doctors.component';
import { EditDoctorComponent } from './doctors/edit-doctor/edit-doctor.component';

// Appointments
import { AddAppointmentComponent } from './appointments-manage/add-appointment/add-appointment.component';
import { ListAppointmentsComponent } from './appointments-manage/list-appointments/list-appointments.component';
import { EditAppointmentComponent } from './appointments-manage/edit-appointment/edit-appointment.component';

const routes: Routes = [{
  path: '',
  component: AppointmentsComponent,
  children: [
    // Doctors Routes
    {
      path: 'list_doctor',
      component: ListDoctorsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_doctors'] }
    },
    {
      path: 'add_doctor',
      component: AddDoctorComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['add_doctor'] }
    },
    {
      path: 'edit_doctor/:id',
      component: EditDoctorComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_doctor'] }
    },
    
    // Appointments Routes
    {
      path: 'list_appointment',
      component: ListAppointmentsComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_appointments'] }
    },
    {
      path: 'add_appointment',
      component: AddAppointmentComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['add_appointment'] }
    },
    {
      path: 'edit_appointment/:id',
      component: EditAppointmentComponent,
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['edit_appointment'] }
    },
    
    // Calendar View
    {
      path: 'calendar',
      loadComponent: () => import('./appointments-manage/calendar-view/calendar-view.component').then(m => m.CalendarViewComponent),
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_appointments'] }
    },
    
    // Especialidades Routes
    {
      path: 'especialidades',
      loadChildren: () => import('./especialidades/especialidades.module').then(m => m.EspecialidadesModule),
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['appointments_especialidades_list'] }
    },
    
    // Cancelled Appointments Routes
    {
      path: 'cancelled',
      loadChildren: () => import('./cancelled-appointments/cancelled-appointments.module').then(m => m.CancelledAppointmentsModule),
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_appointments'] }
    },
    
    // Completed Appointments Routes
    {
      path: 'completed',
      loadChildren: () => import('./completed-appointments/completed-appointments.module').then(m => m.CompletedAppointmentsModule),
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_appointments'] }
    },
    
    // No-Show Appointments Routes
    {
      path: 'no-show',
      loadChildren: () => import('./no-show-appointments/no-show-appointments.module').then(m => m.NoShowAppointmentsModule),
      canActivate: [PermissionGuard],
      data: { requiredPermissions: ['list_appointments'] }
    },
    
    // Default redirect
    {
      path: '',
      redirectTo: 'list_appointment',
      pathMatch: 'full'
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsRoutingModule { }
