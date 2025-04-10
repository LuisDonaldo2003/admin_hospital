import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { StaffService } from '../service/staff.service';

@Component({
  selector: 'app-add-staff-n',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './add-staff-n.component.html',
  styleUrls: ['./add-staff-n.component.scss']
})
export class AddStaffNComponent {

    public selectedValue!: string;
    public name:string = '';
    public surname:string = '';
    public mobile:string = '';
    public email:string = '';
    public password:string = '';
    public password_confirmation:string = '';
    public birth_date:string = '';
    public gender:number = 1;
    public curp: string = '';
    public ine: string = '';
    public rfc: string = '';
    public attendance_number: string = '';
    public professional_license: string = '';
    public funcion_real: string = '';

    public departament_id: string = '';
    public profile_id: string = '';
    public contract_type_id: string = '';

    public departaments: any = [];
    public profiles: any = [];
    public contract_types: any = [];

    public roles:any = [];

    public FILE_AVATAR :any;
    public IMAGEN_PREVIZUALIZA:any = 'assets/img/user-06.jpg'; // nombre corregido

    public text_success:string = '';
    public text_validation:string = '';

    constructor(public staffservice: StaffService) {}

    ngOnInit(): void {
      this.staffservice.listConfig().subscribe((resp: any) => {
        this.roles = resp.roles;
        this.departaments  = resp.departaments  ?? [];
        this.profiles = resp.profiles ?? [];
        this.contract_types = resp.contract_types ?? [];
      });
    }

    save() {
      this.text_validation = '';
      if (!this.name || !this.email || !this.surname || !this.FILE_AVATAR || !this.password) {
        this.text_validation = 'Los siguientes campos son obligatorios (name, surname, email, avatar)';
        return;
      }

      if (this.password !== this.password_confirmation) {
        this.text_validation = 'Las contraseñas no coinciden';
        return;
      }

      let formattedBirthDate = new Date(this.birth_date).toISOString().split('T')[0];

      let fromData = new FormData();
      fromData.append('name', this.name);
      fromData.append('surname', this.surname);
      fromData.append('mobile', this.mobile);
      fromData.append('email', this.email);
      fromData.append('birth_date', formattedBirthDate);
      fromData.append('password', this.password);
      fromData.append('gender', this.gender + "");
      fromData.append('imagen', this.FILE_AVATAR);
      fromData.append('role_id', this.selectedValue);
      fromData.append('curp', this.curp);
      fromData.append('ine', this.ine);
      fromData.append('rfc', this.rfc);
      fromData.append('attendance_number', this.attendance_number);
      fromData.append('professional_license', this.professional_license);
      fromData.append('funcion_real', this.funcion_real);
      fromData.append('departament_id', this.departament_id);
      fromData.append('profile_id', this.profile_id);
      fromData.append('contract_type_id', this.contract_type_id);

      this.staffservice.registerUser(fromData).subscribe((resp: any) => {
        console.log(resp);
        if (resp.message === 403) {
          this.text_validation = resp.message_text;
        } else {
          this.text_success = 'Usuario registrado correctamente';

          // Limpiar campos
          this.birth_date = '';
          this.name = '';
          this.surname = '';
          this.mobile = '';
          this.email = '';
          this.password = '';
          this.password_confirmation = '';
          this.gender = 1;
          this.FILE_AVATAR = null;
          this.IMAGEN_PREVIZUALIZA = 'assets/img/user-06.jpg'; // usar imagen por defecto
        }
      });
    }

    loadFile($event: any) {
      if ($event.target.files[0].type.indexOf('image') < 0) {
        this.text_validation = 'Solamente pueden ser archivos de tipo imagen';
        return;
      }

      this.text_validation = '';
      this.FILE_AVATAR = $event.target.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(this.FILE_AVATAR);
      reader.onloadend = () => {
        this.IMAGEN_PREVIZUALIZA = reader.result;
        console.log("Vista previa cargada:", this.IMAGEN_PREVIZUALIZA);
      };
    }
}
