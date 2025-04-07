import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractTypesComponent } from './contract-types.component';
import { AddContractComponent } from './add-contract/add-contract.component';
import { ListContractComponent } from './list-contract/list-contract.component';
import { EditContractComponent } from './edit-contract/edit-contract.component';

const routes: Routes = [{
  path:'',
  component: ContractTypesComponent,
  children:[
    {
      path: 'add_contract',
      component: AddContractComponent
    },
    {
      path: 'list_contract',
      component: ListContractComponent
    },
    {
      path: 'list_contract/edit_contract/:id',
      component: EditContractComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractTypesRoutingModule { }
