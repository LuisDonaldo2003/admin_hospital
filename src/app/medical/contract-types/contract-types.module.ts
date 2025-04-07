import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractTypesRoutingModule } from './contract-types-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ContractTypesComponent } from './contract-types.component';
import { AddContractComponent } from './add-contract/add-contract.component';
import { EditContractComponent } from './edit-contract/edit-contract.component';
import { ListContractComponent } from './list-contract/list-contract.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ContractTypesRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ContractTypesComponent,
    AddContractComponent,
    EditContractComponent,
    ListContractComponent,
  ]
})
export class ContractTypesModule { }
