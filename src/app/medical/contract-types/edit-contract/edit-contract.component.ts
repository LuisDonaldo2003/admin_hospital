import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ContractTypesService } from '../service/contract-types.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-contract',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './edit-contract.component.html',
  styleUrl: './edit-contract.component.scss'
})
export class EditContractComponent {

  // Nombre del contrato a editar
  name: string = '';
  // Estado del contrato (1: activo, 2: inactivo)
  state: number = 1;
  // Indica si el formulario es inválido
  valid_form: boolean = false;
  // Indica si el formulario se guardó correctamente
  valid_form_success: boolean = false;
  // Mensaje de validación adicional
  text_validation: any = null;

  // ID del contrato a editar
  contract_id: any;

  /**
   * Inyecta el servicio de contratos, la ruta activa y el servicio de traducción
   */
  constructor(
    public contractService: ContractTypesService,
    public activedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {}

  /**
   * Inicializa el componente y obtiene el ID del contrato desde la ruta
   */
  ngOnInit(): void {
    this.activedRoute.params.subscribe((resp: any) => {
      this.contract_id = resp.id;
    })
    this.showContract();
  }

  /**
   * Obtiene los datos del contrato a editar desde el backend
   */
  showContract() {
    this.contractService.showContract(this.contract_id).subscribe((resp: any) => {
      this.name = resp.name;
      this.state = resp.state;
    })
  }

  /**
   * Guarda los cambios realizados en el contrato
   */
  save() {
    this.valid_form = false;
    if (!this.name) {
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
      state: this.state,
    };
    this.valid_form_success = false;
    this.text_validation = null;
    this.contractService.editContract(data, this.contract_id).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.text_validation = resp.message_text;
        return;
      }
      this.valid_form_success = true;
    })
  }
}
