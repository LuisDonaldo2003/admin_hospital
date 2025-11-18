// Este módulo ya no es necesario porque todos los componentes son standalone
// y se cargan directamente en el routing principal del módulo medical

import { NgModule } from '@angular/core';
import { PersonalRoutingModule } from './personal-routing.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    PersonalRoutingModule,
    CommonModule,
    RouterModule,
    FormsModule
  ]
})
export class PersonalModule { }
