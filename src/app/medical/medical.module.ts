import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MedicalRoutingModule } from './medical-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MedicalComponent } from './medical.component'; // Importar el componente standalone
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    MedicalComponent,
    // HeaderComponent,
    // SidebarComponent,
  ],
  imports: [
    CommonModule,
    MedicalRoutingModule,
    SharedModule,
    RouterModule,
    CommonModule
  ]
})
export class MedicalModule { }
