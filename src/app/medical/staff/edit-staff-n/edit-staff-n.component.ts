import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StaffService } from '../service/staff.service';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-staff-n',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSelectModule,
    TranslateModule
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
    public activedRoute: ActivatedRoute,
    private translate: TranslateService
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

    const missingFields: string[] = [];

    if (!this.name.trim()) missingFields.push(this.translate.instant('NAME'));
    if (!this.surname.trim()) missingFields.push(this.translate.instant('SURNAME'));
    if (!this.email.trim()) missingFields.push(this.translate.instant('EMAIL'));
    if (!this.selectedValue) missingFields.push(this.translate.instant('ROLE'));

    if (missingFields.length > 0) {
      const plural = missingFields.length > 1;
      const campos = missingFields.join(', ');
      this.text_validation = this.translate.instant('FIELDS_MISSING', {
        plural: plural ? 'n' : '',
        sPlural: plural ? 's' : '',
        campos
      });
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
        this.text_success = this.translate.instant('USER_UPDATED_SUCCESS');
      }
    });
  }
}
