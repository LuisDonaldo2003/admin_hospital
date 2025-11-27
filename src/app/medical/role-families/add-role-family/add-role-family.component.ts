import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RoleFamilyService } from '../service/role-family.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-role-family',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-role-family.component.html',
  styleUrls: ['./add-role-family.component.scss']
})
export class AddRoleFamilyComponent {
  name: string = '';
  description: string = '';

  /**
   * Mensaje de éxito tras el registro
   */
  public text_success: string = '';
  /**
   * Mensaje de validación de campos
   */
  public text_validation: string = '';
  /**
   * Bandera para indicar si el formulario fue enviado
   */
  public submitted: boolean = false;

  constructor(
    public roleFamilyService: RoleFamilyService,
    public router: Router,
    private translate: TranslateService
  ) { }

  save() {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    if (!this.name || this.name.trim() === '') {
      this.text_validation = this.translate.instant('ROLE_FAMILIES.ADD_ROLE_FAMILY.NAME_REQUIRED');
      return;
    }

    const data = {
      name: this.name,
      description: this.description
    };

    this.roleFamilyService.storeFamily(data).subscribe({
      next: (resp: any) => {
        this.text_success = this.translate.instant('ROLE_FAMILIES.ADD_ROLE_FAMILY.SUCCESS_MESSAGE');

        setTimeout(() => {
          this.router.navigate(['/role-families/list']);
        }, 1000);
      },
      error: (error) => {
        this.text_validation = error.error?.message_text || this.translate.instant('ROLE_FAMILIES.ADD_ROLE_FAMILY.ERROR');
      }
    });
  }
}
