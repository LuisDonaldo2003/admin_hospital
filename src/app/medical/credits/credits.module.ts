import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreditsComponent } from './credits.component';
import { CreditsRoutingModule } from './credits-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    CreditsComponent
  ],
  imports: [
    CommonModule,
    CreditsRoutingModule,
    SharedModule
  ]
})
export class CreditsModule { }
