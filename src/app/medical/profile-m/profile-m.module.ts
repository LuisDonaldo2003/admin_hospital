import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileMRoutingModule } from './profile-m-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ProfileMComponent } from './profile-m.component';
import { AddProfileMComponent } from './add-profile-m/add-profile-m.component';
import { EditProfileMComponent } from './edit-profile-m/edit-profile-m.component';
import { ListProfileMComponent } from './list-profile-m/list-profile-m.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ProfileMRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ProfileMComponent,
    AddProfileMComponent,
    EditProfileMComponent,
    ListProfileMComponent, 
  ]
})
export class ProfileMModule { }
