import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ NECESARIO para ngModel
import { URL_SERVICIOS } from 'src/app/config/config';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Aquí se declara FormsModule
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss']
})
export class CompleteProfileComponent {
  // Datos del usuario ya verificado
  name = '';
  surname = '';
  email = '';

  // Datos a completar
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
  selectedValue = '';
  IMAGEN_PREVIZUALIZA: any = null;
  avatarFile: File | null = null;

  // Catálogos
  departaments: any[] = [];
  profiles: any[] = [];
  contract_types: any[] = [];

  // Mensajes
  text_success = '';
  text_validation = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.getCatalogs();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.name = user.name || '';
    this.surname = user.surname || '';
    this.email = user.email || '';
  }

  getCatalogs() {
    this.http.get<any>(`${URL_SERVICIOS}/staffs/config`).subscribe(res => {
      this.departaments = res.departaments;
      this.profiles = res.profiles;
      this.contract_types = res.contract_types;
    });
  }


  loadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = e => this.IMAGEN_PREVIZUALIZA = reader.result;
      reader.readAsDataURL(file);
    }
  }

  save() {
    this.text_validation = '';
    this.text_success = '';

    // Validación manual
    if (!this.mobile || !this.birth_date || !this.gender || !this.attendance_number || !this.avatarFile) {
      this.text_validation = 'Todos los campos obligatorios deben completarse.';
      return;
    }

    const formData = new FormData();
    formData.append('mobile', this.mobile);
    formData.append('curp', this.curp);
    formData.append('rfc', this.rfc);
    formData.append('ine', this.ine);
    formData.append('attendance_number', this.attendance_number);
    formData.append('professional_license', this.professional_license);
    formData.append('funcion_real', this.funcion_real);
    formData.append('birth_date', this.birth_date);
    formData.append('gender', this.gender);
    formData.append('departament_id', this.departament_id);
    formData.append('profile_id', this.profile_id);
    formData.append('contract_type_id', this.contract_type_id);
    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile);
    }

    this.http.post(`${URL_SERVICIOS}/complete-profile`, formData).subscribe({
      next: () => {
        this.text_success = 'Perfil completado correctamente';
        setTimeout(() => this.router.navigate(['/profile']), 1000);
      },
      error: err => {
        this.text_validation = err?.error?.message || 'Error al guardar';
      }
    });
  }
}
