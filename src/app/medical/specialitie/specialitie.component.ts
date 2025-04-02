import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-specialitie',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './specialitie.component.html',
  styleUrl: './specialitie.component.scss'
})
export class SpecialitieComponent {

}
