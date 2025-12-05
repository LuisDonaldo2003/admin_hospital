import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CancelledAppointmentsRoutingModule } from './cancelled-appointments-routing.module';
import { ListCancelledComponent } from './list-cancelled/list-cancelled.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CancelledAppointmentsRoutingModule,
    ListCancelledComponent
  ]
})
export class CancelledAppointmentsModule { }
