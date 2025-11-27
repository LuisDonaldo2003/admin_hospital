import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RoleFamilyService } from './service/role-family.service';

@Component({
  selector: 'app-role-families',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-families.component.html',
  styleUrls: ['./role-families.component.scss']
})
export class RoleFamiliesComponent {
  constructor(
    private router: Router,
    private roleFamilyService: RoleFamilyService
  ) { }
}
