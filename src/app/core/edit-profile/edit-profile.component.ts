// Componente para la edición de perfil de usuario
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditProfileService } from './service/edit-profile.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  // URL por defecto para el avatar si no existe
  defaultAvatar: string = 'assets/img/profile-user-01.jpg';

  // Maneja el error al cargar la imagen del avatar
  onAvatarImgError(event: any): void {
    event.target.src = this.defaultAvatar;
  }

  // Nombre del archivo de avatar seleccionado
  avatarFileName: string = '';
  // Datos del perfil del usuario
  profileData: any = {};

  // Mensajes de éxito y validación
  text_success = '';
  text_validation = '';
  // Estado de envío del formulario
  submitted = false;
  // ID del usuario actual
  userId: string = '';
  // Estado de carga
  loading = true;
  // Estado de carga del avatar
  avatarLoaded = false;
  // Archivo de avatar seleccionado
  avatarFile: File | null = null;
  // Preview de la imagen de avatar
  avatarPreview: string | null = null;
  // Idioma seleccionado
  selectedLang: string;

  // Inyecta el servicio de edición de perfil y el de traducción
  constructor(private editProfileService: EditProfileService, private translate: TranslateService) {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  /**
   * Inicializa el componente, carga datos de usuario y catálogos
   */
  ngOnInit(): void {
    // Obtiene datos del usuario autenticado
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


  }

  /**
   * Alterna el idioma de la interfaz entre español e inglés
   */
  toggleLanguage(): void {
    this.selectedLang = this.selectedLang === 'es' ? 'en' : 'es';
    this.translate.use(this.selectedLang);
    localStorage.setItem('language', this.selectedLang);
  }

  /**
   * Maneja el cambio de imagen de avatar
   */
  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      this.avatarFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => this.avatarPreview = e.target.result;
      reader.readAsDataURL(file);
    } else {
      this.avatarFileName = '';
    }
  }

  /**
   * Guarda los cambios del perfil, incluyendo el avatar si se seleccionó
   */
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
          // Se elimina el log de error
        }
      });
    } else {
      this.saveProfile();
    }
  }

  /**
   * Guarda los datos del perfil del usuario
   */
  saveProfile(): void {
    this.editProfileService.updateProfile(this.userId, this.profileData).subscribe({
      next: res => {
        this.text_success = 'Perfil actualizado correctamente.';
        this.text_validation = '';
      },
      error: err => {
        this.text_success = '';
        this.text_validation = 'Error al actualizar el perfil.';
        // Se elimina el log de error
      }
    });
  }
}
