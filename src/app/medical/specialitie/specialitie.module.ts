import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpecialitieRoutingModule } from './specialitie-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AddSpecialitieComponent } from './add-specialitie/add-specialitie.component';
import { EditSpecialitieComponent } from './edit-specialitie/edit-specialitie.component';
import { ListSpecialitieComponent } from './list-specialitie/list-specialitie.component';
import { SpecialitieComponent } from './specialitie.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    SpecialitieRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SpecialitieComponent,
    AddSpecialitieComponent,
    EditSpecialitieComponent,
    ListSpecialitieComponent
  ]
})
export class SpecialitieModule { }
