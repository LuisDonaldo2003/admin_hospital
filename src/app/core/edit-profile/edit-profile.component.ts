import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditProfileService } from './service/edit-profile.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  profileData: any = {};
  departamentos: any[] = [];
  perfiles: any[] = [];
  contratos: any[] = [];

  text_success = '';
  text_validation = '';
  submitted = false;
  userId: string = '';
  loading = true;
  avatarLoaded = false;

  constructor(private editProfileService: EditProfileService) {}

  ngOnInit(): void {
    this.editProfileService.getAuthUser().subscribe({
      next: (resp: any) => {
        this.profileData = resp.user;
        this.userId = resp.user.id;
        this.loading = false;
        console.log('🚀 Datos cargados directamente:', this.profileData);
      },
      error: err => {
        console.error('Error al obtener usuario autenticado:', err);
        this.loading = false;
      }
    });

    this.editProfileService.getCatalogos().subscribe({
      next: (resp: any) => {
        this.departamentos = resp.departaments || [];
        this.perfiles = resp.profiles || [];
        this.contratos = resp.contractTypes || [];
      },
      error: err => console.error('Error al cargar catálogos:', err)
    });
  }

  save(): void {
    this.submitted = true;
    console.log("💬 Enviando datos JSON:", this.profileData);

    this.editProfileService.updateProfile(this.userId, this.profileData).subscribe({
      next: res => {
        this.text_success = 'Perfil actualizado correctamente.';
        this.text_validation = '';
      },
      error: err => {
        this.text_success = '';
        this.text_validation = 'Error al actualizar el perfil.';
        console.error(err);
      }
    });
  }
}
