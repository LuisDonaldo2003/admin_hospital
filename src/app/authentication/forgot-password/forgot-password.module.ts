import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';
import { ForgotPasswordComponent } from './forgot-password.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    ForgotPasswordRoutingModule,
    HttpClientModule

  ]
})
export class ForgotPasswordModule { }
