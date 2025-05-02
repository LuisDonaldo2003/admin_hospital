import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StaffService } from '../service/staff.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-staff-n',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSelectModule
  ],
  templateUrl: './edit-staff-n.component.html',
  styleUrl: './edit-staff-n.component.scss'
})
export class EditStaffNComponent {

  public selectedValue!: string;
  public name: string = '';
  public surname: string = '';
  public email: string = '';

  public roles: any = [];

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
      this.email = this.staff_selected.email;
    });

    this.staffService.listConfig().subscribe((resp: any) => {
      this.roles = resp.roles ?? [];
    });
  }

  save() {
    this.text_validation = '';
    this.text_success = '';

    if (!this.name.trim() || !this.surname.trim() || !this.email.trim() || !this.selectedValue) {
      this.text_validation = 'Todos los campos obligatorios deben completarse.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('email', this.email);
    formData.append('role_id', this.selectedValue);

    this.staffService.updateUser(this.staff_id, formData).subscribe((resp: any) => {
      if (resp.message === 403) {
        this.text_validation = resp.message_text;
      } else {
        this.text_success = 'El usuario ha sido actualizado correctamente';
      }
    });
  }
}
