import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { GeneralMedicalRoutingModule } from './general-medical-routing.module';
import { ListGeneralMedicalComponent } from './list-general-medical/list-general-medical.component';
import { AddGeneralMedicalComponent } from './add-general-medical/add-general-medical.component';
import { EditGeneralMedicalComponent } from './edit-general-medical/edit-general-medical.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    GeneralMedicalRoutingModule,
    HttpClientModule,
    RouterModule,
    ListGeneralMedicalComponent,
    AddGeneralMedicalComponent,
    EditGeneralMedicalComponent
  ]
})
export class GeneralMedicalModule { }
