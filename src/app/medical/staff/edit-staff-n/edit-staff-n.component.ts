import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StaffService } from '../service/staff.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-staff-n',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './edit-staff-n.component.html',
  styleUrl: './edit-staff-n.component.scss'
})
export class EditStaffNComponent {

  public selectedValue!: string;
  public name: string = '';
  public surname: string = '';
  public mobile: string = '';
  public email: string = '';
  public password: string = '';
  public password_confirmation: string = '';
  public birth_date: string = '';
  public gender: number = 1;

  public curp: string = '';
  public ine: string = '';
  public rfc: string = '';
  public attendance_number: string = '';
  public professional_license: string = '';
  public funcion_real: string = '';
  public departament_id: string = '';
  public profile_id: string = '';
  public contract_type_id: string = '';

  public roles: any = [];
  public departaments: any = [];
  public profiles: any = [];
  public contract_types: any = [];

  public FILE_AVATAR: any;
  public IMAGEN_PREVIZUALIZA: any = 'assets/img/user-06.jpg';

  public text_success: string = '';
  public text_validation: string = '';

  public staff_id: any;
  public staff_selected: any;

  constructor(
    public staffService: StaffService,
    public activedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activedRoute.params.subscribe((resp: any) => {
      this.staff_id = resp.id;
    });

    this.staffService.showUser(this.staff_id).subscribe((resp: any) => {
      this.staff_selected = resp.user;

      this.selectedValue = this.staff_selected.roles?.[0]?.id ?? '';
      this.name = this.staff_selected.name;
      this.surname = this.staff_selected.surname;
      this.mobile = this.staff_selected.mobile;
      this.email = this.staff_selected.email;
      this.birth_date = new Date(this.staff_selected.birth_date).toISOString();
      this.gender = this.staff_selected.gender;
      this.IMAGEN_PREVIZUALIZA = this.staff_selected.avatar;

      this.curp = this.staff_selected.curp;
      this.ine = this.staff_selected.ine;
      this.rfc = this.staff_selected.rfc;
      this.attendance_number = this.staff_selected.attendance_number;
      this.professional_license = this.staff_selected.professional_license;
      this.funcion_real = this.staff_selected.funcion_real;
      this.departament_id = this.staff_selected.departament_id;
      this.profile_id = this.staff_selected.profile_id;
      this.contract_type_id = this.staff_selected.contract_type_id;
    });

    this.staffService.listConfig().subscribe((resp: any) => {
      this.roles = resp.roles;
      this.departaments = resp.departaments ?? [];
      this.profiles = resp.profiles ?? [];
      this.contract_types = resp.contract_types ?? [];
    });
  }

  save() {
    this.text_validation = '';
    if (!this.name || !this.email || !this.surname) {
      this.text_validation = "LOS CAMPOS SON NECESARIOS (name,surname,email)";
      return;
    }

    if (this.password && this.password !== this.password_confirmation) {
      this.text_validation = "LAS CONTRASEÑA DEBEN SER IGUALES";
      return;
    }

    let formData = new FormData();
    formData.append("name", this.name);
    formData.append("surname", this.surname);
    formData.append("email", this.email);
    formData.append("mobile", this.mobile);
    formData.append("birth_date", this.birth_date);
    formData.append("gender", this.gender + "");
    if (this.password) {
      formData.append("password", this.password);
    }
    formData.append("role_id", this.selectedValue);
    if (this.FILE_AVATAR) {
      formData.append("imagen", this.FILE_AVATAR);
    }

    formData.append("curp", this.curp);
    formData.append("ine", this.ine);
    formData.append("rfc", this.rfc);
    formData.append("attendance_number", this.attendance_number);
    formData.append("professional_license", this.professional_license);
    formData.append("funcion_real", this.funcion_real);
    formData.append("departament_id", this.departament_id);
    formData.append("profile_id", this.profile_id);
    formData.append("contract_type_id", this.contract_type_id);

    this.staffService.updateUser(this.staff_id, formData).subscribe((resp: any) => {
      if (resp.message === 403) {
        this.text_validation = resp.message_text;
      } else {
        this.text_success = 'El usuario ha editado correctamente';
      }
    });
  }

  loadFile($event: any) {
    if ($event.target.files[0].type.indexOf("image") < 0) {
      this.text_validation = "SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN";
      return;
    }

    this.text_validation = '';
    this.FILE_AVATAR = $event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(this.FILE_AVATAR);
    reader.onloadend = () => this.IMAGEN_PREVIZUALIZA = reader.result;
  }
}
