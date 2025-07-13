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

  name: string = '';
  state: number = 1;
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation: any = null;

  contract_id: any;
  constructor(
    public contractService: ContractTypesService,
    public activedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.activedRoute.params.subscribe((resp: any) => {
      this.contract_id = resp.id;
    })
    this.showContract();
  }

  showContract() {
    this.contractService.showContract(this.contract_id).subscribe((resp: any) => {
      this.name = resp.name;
      this.state = resp.state;
    })
  }

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
