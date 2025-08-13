import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-m',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-m.component.html',
  styleUrl: './profile-m.component.scss'
})
export class ProfileMComponent {

}
