import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MedicalRoutingModule } from './medical-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MedicalComponent } from './medical.component'; // Importar el componente standalone

@NgModule({
  imports: [
    CommonModule,
    MedicalRoutingModule,
    SharedModule,
    MedicalComponent, // Importar el componente standalone aquí
  ]
})
export class MedicalModule { }
