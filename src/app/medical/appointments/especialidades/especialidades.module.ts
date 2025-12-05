import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { EspecialidadesRoutingModule } from './especialidades-routing.module';
import { ListEspecialidadesComponent } from './list-especialidades/list-especialidades.component';
import { AddEspecialidadComponent } from './add-especialidad/add-especialidad.component';
import { EditEspecialidadComponent } from './edit-especialidad/edit-especialidad.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    EspecialidadesRoutingModule,
    HttpClientModule,
    RouterModule,
    ListEspecialidadesComponent,
    AddEspecialidadComponent,
    EditEspecialidadComponent
  ]
})
export class EspecialidadesModule { }
