import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffService } from '../service/staff.service';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-staff-n',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    TranslateModule
  ],
  templateUrl: './add-staff-n.component.html',
  styleUrls: ['./add-staff-n.component.scss']
})
export class AddStaffNComponent {

  public name: string = '';
  public surname: string = '';
  public email: string = '';
  public password: string = '';
  public password_confirmation: string = '';
  public selectedValue!: string;

  public roles: any = [];

  public text_success: string = '';
  public text_validation: string = '';
  public submitted: boolean = false;

  constructor(
    public staffservice: StaffService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.staffservice.listConfig().subscribe((resp: any) => {
      this.roles = resp.roles ?? [];
    });

    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    }
  }

  save() {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    const missingFields: string[] = [];

    if (!this.name.trim()) missingFields.push(this.translate.instant('NAME'));
    if (!this.surname.trim()) missingFields.push(this.translate.instant('SURNAME'));
    if (!this.email.trim()) missingFields.push(this.translate.instant('EMAIL'));
    if (!this.password.trim()) missingFields.push(this.translate.instant('PASSWORD'));
    if (!this.password_confirmation.trim()) missingFields.push(this.translate.instant('CONFIRM_PASSWORD'));
    if (!this.selectedValue) missingFields.push(this.translate.instant('ROLE'));

    if (missingFields.length > 0) {
      const plural = missingFields.length > 1;
      const campos = missingFields.join(', ');
      const mensaje = this.translate.instant('FIELDS_MISSING', {
        plural: plural ? 'n' : '',
        sPlural: plural ? 's' : '',
        campos
      });
      this.text_validation = mensaje;
      return;
    }

    if (this.password !== this.password_confirmation) {
      this.text_validation = this.translate.instant('PASSWORD_MISMATCH');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('password_confirmation', this.password_confirmation);
    formData.append('role_id', this.selectedValue);

    this.staffservice.registerUser(formData).subscribe((resp: any) => {
      if (resp.message === 403) {
        this.text_validation = resp.message_text;
      } else {
        this.text_success = this.translate.instant('USER_REGISTERED_SUCCESS');

        setTimeout(() => {
          this.router.navigate(['/staffs/list-staff']);
        }, 1000);
      }
    });
  }
}
