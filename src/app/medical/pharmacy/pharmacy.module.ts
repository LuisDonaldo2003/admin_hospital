import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyRoutingModule } from './pharmacy-routing.module';

const routes: Routes = [
  // Aquí puedes agregar rutas hijas si es necesario
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PharmacyRoutingModule,
    RouterModule.forChild(routes)
  ]
})
export class PharmacyModule { }
