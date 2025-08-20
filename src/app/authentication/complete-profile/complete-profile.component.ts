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
  curp = '';
  ine = '';
  rfc = '';
  attendance_number = '';
  professional_license = '';
  funcion_real = '';
  birth_date: any;
  gender = '';
  departament_id = '';
  profile_id = '';
  contract_type_id = '';
  IMAGEN_PREVIZUALIZA: any = null; // Previsualización del avatar
  avatarFile: File | null = null;  // Archivo de imagen seleccionado

  // Catálogos para los selectores del formulario
  departaments: any[] = [];
  profiles: any[] = [];
  contractTypes: any[] = [];
  genders: any[] = []; // lista de géneros desde el backend

  // Mensajes de éxito y validación
  text_success = '';
  text_validation = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Al inicializar, carga los catálogos y los datos del usuario
  ngOnInit() {
    this.getCatalogs();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.name = user.name || '';
    this.surname = user.surname || '';
    this.email = user.email || '';
  }

  // Obtiene los catálogos de departamentos, perfiles y tipos de contrato desde el backend
  getCatalogs() {
    this.http.get<any>(`${URL_SERVICIOS}/staffs/config`).subscribe({
      next: res => {
        this.departaments = res.departaments;
        this.profiles = res.profiles;
        this.contractTypes = res.contractTypes;
      },
      error: err => {
        console.error('Error al cargar catálogos:', err);
        this.text_validation = 'Error al cargar catálogos.';
      }
    });

    // Obtener géneros desde el endpoint público
    this.http.get<any>(`${URL_SERVICIOS}/genders`).subscribe({
      next: res => {
        // El endpoint devuelve un array [{id,name},...]
        this.genders = res || [];
      },
      error: err => {
        console.warn('No se pudo cargar lista de géneros:', err);
        // No es crítico, se puede usar un fallback estático si es necesario
        this.genders = [ { id: 1, name: 'Hombre' }, { id: 2, name: 'Mujer' } ];
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

    // Validación de campos obligatorios
    if (!this.mobile || !this.birth_date || !this.gender || !this.attendance_number || !this.avatarFile) {
      this.text_validation = 'Por favor completa los campos obligatorios: número de móvil, fecha de nacimiento, género, No. de asistencia y foto de perfil.';
      return;
    }

    // Construye el objeto FormData: solo añadir campos opcionales si tienen valor
    const formData = new FormData();
    // Campos obligatorios (siempre)
    formData.append('mobile', this.mobile);
    formData.append('attendance_number', this.attendance_number);
    formData.append('birth_date', this.birth_date);
    formData.append('gender_id', this.gender);

    // Opcionales: añadir solo si tienen contenido
    if (this.curp) formData.append('curp', this.curp);
    if (this.rfc) formData.append('rfc', this.rfc);
    if (this.ine) formData.append('ine', this.ine);
    if (this.professional_license) formData.append('professional_license', this.professional_license);
    if (this.funcion_real) formData.append('funcion_real', this.funcion_real);
    if (this.departament_id) formData.append('departament_id', this.departament_id);
    if (this.profile_id) formData.append('profile_id', this.profile_id);
    if (this.contract_type_id) formData.append('contract_type_id', this.contract_type_id);

    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile);
    }

    // DEBUG: imprimir contenido de FormData antes de enviar
    try {
      for (const pair of (formData as any).entries()) {
        console.log('FormData ->', pair[0], pair[1]);
      }
    } catch (e) {
      console.warn('No se pudo iterar FormData para debug:', e);
    }

    // Envía el perfil al backend y muestra mensajes según el resultado
    this.http.post(`${URL_SERVICIOS}/complete-profile`, formData).subscribe({
      next: () => {
        this.text_success = 'Perfil completado correctamente';
        setTimeout(() => this.router.navigate(['/profile']), 1000);
      },
      error: err => {
        console.error('Error al guardar:', err);
        this.text_validation = err?.error?.message || 'Error al guardar';
      }
    });
  }
}
