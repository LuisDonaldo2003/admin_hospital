import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentsRoutingModule } from './appointments-routing.module';

@NgModule({
  declarations: [],
  imports: [
    AppointmentsRoutingModule,
    CommonModule,
    RouterModule,
    FormsModule
  ]
})
export class AppointmentsModule { }
