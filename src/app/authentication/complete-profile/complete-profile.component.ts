import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { URL_SERVICIOS } from 'src/app/config/config';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss']
})

// Componente para completar el perfil profesional y personal del usuario
export class CompleteProfileComponent {
  // Datos básicos del usuario
  name = '';
  surname = '';
  email = '';

  // Campos del formulario de perfil
  mobile = '';
  birth_date: any;
  gender = '';
  attendance_number = '';

  IMAGEN_PREVIZUALIZA: any = null; // Previsualización del avatar
  avatarFile: File | null = null;  // Archivo de imagen seleccionado

  // Catálogos
  genders: any[] = []; // lista de géneros desde el backend

  // Mensajes de éxito y validación
  text_success = '';
  text_validation = '';

  constructor(private http: HttpClient, private router: Router) { }

  // Al inicializar, carga los catálogos y los datos del usuario
  ngOnInit() {
    this.getCatalogs();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.name = user.name || '';
    this.surname = user.surname || '';
    this.email = user.email || '';
  }

  // Obtiene los catálogos necesarios (solo géneros ahora)
  getCatalogs() {
    // Obtener géneros desde el endpoint público
    this.http.get<any>(`${URL_SERVICIOS}/genders`).subscribe({
      next: res => {
        this.genders = res || [];
      },
      error: err => {
        this.genders = [{ id: 1, name: 'Hombre' }, { id: 2, name: 'Mujer' }];
      }
    });
  }

  // Carga y previsualiza el archivo de imagen seleccionado para el avatar
  loadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = e => this.IMAGEN_PREVIZUALIZA = reader.result;
      reader.readAsDataURL(file);
    }
  }

  // Valida y envía el formulario al backend para guardar el perfil
  save() {
    this.text_validation = '';
    this.text_success = '';

    // Validación de campos obligatorios (Foto ya NO es obligatoria)
    if (!this.mobile || !this.birth_date || !this.gender || !this.attendance_number) {
      this.text_validation = 'Por favor completa todos los campos obligatorios (Móvil, Fecha Nacimiento, Género y No. Asistencia).';
      return;
    }

    const formData = new FormData();
    formData.append('mobile', this.mobile);
    formData.append('attendance_number', this.attendance_number);
    formData.append('birth_date', this.birth_date);
    formData.append('gender_id', this.gender);

    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile);
    }

    // Envía el perfil al backend
    this.http.post(`${URL_SERVICIOS}/complete-profile`, formData).subscribe({
      next: () => {
        this.text_success = 'Perfil completado correctamente';
        setTimeout(() => this.router.navigate(['/profile']), 1000);
      },
      error: err => {
        this.text_validation = err?.error?.message || 'Error al guardar. Verifique los datos.';
      }
    });
  }
}
