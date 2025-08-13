import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContractTypesService } from '../service/contract-types.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-contract',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './add-contract.component.html',
  styleUrl: './add-contract.component.scss'
})
export class AddContractComponent {
  // Nombre del contrato a registrar
  name: string = '';
  // Indica si el formulario es inválido
  valid_form: boolean = false;
  // Indica si el formulario se guardó correctamente
  valid_form_success: boolean = false;
  // Mensaje de validación adicional
  text_validation: any = null;

  /**
   * Inyecta el servicio de contratos y el servicio de traducción
   */
  constructor(
    public contractService: ContractTypesService,
    private translate: TranslateService
  ) {}

  /**
   * Inicializa el componente (sin lógica en este caso)
   */
  ngOnInit(): void {}

  /**
   * Guarda el nuevo contrato en el backend
   */
  save() {
    this.valid_form = false;
    if (!this.name) {
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
    };
    this.valid_form_success = false;
    this.text_validation = null;
    this.contractService.storeContract(data).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.text_validation = resp.message_text;
      } else {
        this.name = '';
        this.valid_form_success = true;
      }
    });
  }
}
