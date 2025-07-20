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
  avatarFile: File | null = null;
  avatarPreview: string | null = null;

  constructor(private editProfileService: EditProfileService) {}

  ngOnInit(): void {
    this.editProfileService.getAuthUser().subscribe({
      next: (resp: any) => {
        this.profileData = resp.user;
        this.userId = resp.user.id;
        // Normaliza el avatar: si es vacío, null o "null", ponlo en null
        if (!this.profileData.avatar || this.profileData.avatar === '' || this.profileData.avatar === 'null') {
          this.profileData.avatar = null;
        }
        this.loading = false;
      },
      error: err => {
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

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.avatarPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    this.submitted = true;
    if (this.avatarFile) {
      const formData = new FormData();
      formData.append('avatar', this.avatarFile);
      this.editProfileService.updateAvatar(this.userId, formData).subscribe({
        next: (res: any) => {
          this.avatarPreview = null; // Limpia la preview
          this.profileData.avatar = res.data.avatar; // Usa la URL real
          this.avatarFile = null;
          this.saveProfile();
        },
        error: err => {
          this.text_success = '';
          this.text_validation = 'Error al actualizar el avatar.';
          console.error(err);
        }
      });
    } else {
      this.saveProfile();
    }
  }

  saveProfile(): void {
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
