import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { ProfileService } from './service/profile.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-profile',
    imports: [CommonModule, RouterModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public profileData: any;
  public roles: string[] = [];
  public routes = routes;

  constructor(public profileService: ProfileService) {}

  ngOnInit() {
    this.getProfileData();
    console.log('Perfil completo:', this.profileData);
  }

  private getProfileData(): void {
    this.profileService.getProfile().subscribe((resp: any) => {
      console.log('Respuesta del perfil:', resp); // 👈 agrega esta línea
      this.profileData = resp.data;
      this.roles = resp.roles;
    });
  }

}
