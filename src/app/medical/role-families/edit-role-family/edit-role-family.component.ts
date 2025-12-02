import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoleFamilyService } from '../service/role-family.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-edit-role-family',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './edit-role-family.component.html',
  styleUrls: ['./edit-role-family.component.scss']
})
export class EditRoleFamilyComponent implements OnInit {
  familyId: string = '';
  name: string = '';
  description: string = '';

  /**
   * Mensaje de éxito tras la edición
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
    public activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private driverTourService: DriverTourService
  ) { }

  /**
   * Inicia el tour guiado del formulario de editar familia de roles
   */
  public startEditRoleFamilyTour(): void {
    this.driverTourService.startEditRoleFamilyTour();
  }

  ngOnInit(): void {
    this.familyId = this.activatedRoute.snapshot.params['id'];
    this.loadFamily();
  }

  loadFamily() {
    this.roleFamilyService.showFamily(this.familyId).subscribe({
      next: (resp: any) => {
        const family = resp.family;
        this.name = family.name;
        this.description = family.description || '';
      },
      error: (error) => {
        console.error('Error loading family:', error);
        this.router.navigate(['/role-families/list']);
      }
    });
  }

  update() {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    if (!this.name || this.name.trim() === '') {
      this.text_validation = this.translate.instant('ROLE_FAMILIES.EDIT_ROLE_FAMILY.NAME_REQUIRED');
      return;
    }

    const data = {
      name: this.name,
      description: this.description
    };

    this.roleFamilyService.updateFamily(data, this.familyId).subscribe({
      next: (resp: any) => {
        this.text_success = this.translate.instant('ROLE_FAMILIES.EDIT_ROLE_FAMILY.SUCCESS_MESSAGE');

        setTimeout(() => {
          this.router.navigate(['/role-families/list']);
        }, 1000);
      },
      error: (error) => {
        this.text_validation = error.error?.message_text || this.translate.instant('ROLE_FAMILIES.EDIT_ROLE_FAMILY.ERROR');
      }
    });
  }
}
