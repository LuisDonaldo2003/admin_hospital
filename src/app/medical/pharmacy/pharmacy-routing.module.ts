import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyComponent } from './pharmacy.component';
import { AntibioticsComponent } from './antibiotics/antibiotics.component';
import { AddAntibioticsComponent } from './antibiotics/add-antibiotics/add-antibiotics.component';
import { ListAntibioticsComponent } from './antibiotics/list-antibiotics/list-antibiotics.component';
import { EditAntibioticsComponent } from './antibiotics/edit-antibiotics/edit-antibiotics.component';
import { InventoryControlComponent } from './inventory-control/inventory-control.component';
import { AddInventoryComponent } from './inventory-control/add-inventory/add-inventory.component';
import { ListInventoryComponent } from './inventory-control/list-inventory/list-inventory.component';
import { EditInventoryComponent } from './inventory-control/edit-inventory/edit-inventory.component';
import { SupervisionComponent } from './supervision/supervision.component';
import { ExportSupervisionComponent } from './supervision/export-supervision/export-supervision.component';

const routes: Routes = [
  {
    path: '',
    component: PharmacyComponent,
    children: [
      {
        path: 'add_antibiotics',
        component: AddAntibioticsComponent
      },
      {
        path: 'list_antibiotics',
        component: ListAntibioticsComponent
      },
      {
        path: 'list_antibiotics/edit_antibiotics/:id',
        component: EditAntibioticsComponent
      },
      {
        path: 'inventory_control',
        component: InventoryControlComponent
      },
      {
        path: 'add_inventory',
        component: AddInventoryComponent
      },
      {
        path: 'list_inventory',
        component: ListInventoryComponent
      },
      {
        path: 'list_inventory/edit_inventory/:id',
        component: EditInventoryComponent
      },
      {
        path: 'supervision',
        component: SupervisionComponent
      },
      {
        path: 'export_supervision',
        component: ExportSupervisionComponent
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacyRoutingModule {}
