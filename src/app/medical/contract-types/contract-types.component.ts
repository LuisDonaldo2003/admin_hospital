import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contract-types',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contract-types.component.html',
  styleUrl: './contract-types.component.scss'
})
export class ContractTypesComponent {

}
