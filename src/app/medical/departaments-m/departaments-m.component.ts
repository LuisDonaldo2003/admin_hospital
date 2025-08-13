import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-departaments-m',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './departaments-m.component.html',
  styleUrl: './departaments-m.component.scss'
})
export class DepartamentsMComponent {

}
