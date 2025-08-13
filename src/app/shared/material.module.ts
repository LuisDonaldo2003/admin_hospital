import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCardModule} from '@angular/material/card';
import {MatNativeDateModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule } from "@angular/material/form-field";
import { MatTreeModule } from '@angular/material/tree';

@NgModule({
declarations:[],
imports: [
    CommonModule,
    MatDatepickerModule,
    MatCardModule,
    MatNativeDateModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTreeModule
],
exports: [
    CommonModule,
    MatDatepickerModule,
    MatCardModule,
    MatNativeDateModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTreeModule
]
})

export class materialModule {}