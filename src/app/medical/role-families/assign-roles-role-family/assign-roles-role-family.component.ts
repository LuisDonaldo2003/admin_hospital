import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleFamilyService } from '../service/role-family.service';
import { RolesService } from '../../roles/service/roles.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule, Router } from '@angular/router';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-assign-roles-role-family',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './assign-roles-role-family.component.html',
  styleUrls: ['./assign-roles-role-family.component.scss']
})
export class AssignRolesRoleFamilyComponent implements OnInit {
  families: any[] = [];
  roles: any[] = [];
  selectedFamilyId: string = '';
  selectedRoleIds: number[] = [];

  /**
   * Mensaje de éxito tras la asignación
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
    public rolesService: RolesService,
    private translate: TranslateService,
    private router: Router,
    private driverTourService: DriverTourService
  ) { }

  /**
   * Inicia el tour guiado para asignar roles a familia de roles
   */
  public startAssignRolesRoleFamilyTour(): void {
    this.driverTourService.startAssignRolesRoleFamilyTour();
  }

  ngOnInit(): void {
    this.loadFamilies();
    this.loadRoles();
  }

  loadFamilies() {
    this.roleFamilyService.listFamilies().subscribe({
      next: (resp: any) => {
        this.families = resp.families ?? [];
      },
      error: (error) => {
        console.error('Error loading families:', error);
      }
    });
  }

  loadRoles() {
    this.rolesService.listRoles().subscribe({
      next: (resp: any) => {
        this.roles = resp.roles ?? [];
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  onFamilyChange() {
    // Limpiar mensajes al cambiar de familia
    this.text_success = '';
    this.text_validation = '';

    // Cargar roles ya asignados a esta familia
    const family = this.families.find(f => f.id == this.selectedFamilyId);
    if (family && family.roles) {
      this.selectedRoleIds = family.roles.map((r: any) => r.id);
    } else {
      this.selectedRoleIds = [];
    }
  }

  toggleRole(roleId: number) {
    const index = this.selectedRoleIds.indexOf(roleId);
    if (index > -1) {
      this.selectedRoleIds.splice(index, 1);
    } else {
      this.selectedRoleIds.push(roleId);
    }
  }

  isRoleSelected(roleId: number): boolean {
    return this.selectedRoleIds.includes(roleId);
  }

  saveAssignment() {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    if (!this.selectedFamilyId) {
      this.text_validation = this.translate.instant('ROLE_FAMILIES.ASSIGN_ROLES.SELECT_FAMILY_ERROR');
      return;
    }

    this.roleFamilyService.assignRoles(this.selectedFamilyId, this.selectedRoleIds).subscribe({
      next: (resp: any) => {
        this.text_success = this.translate.instant('ROLE_FAMILIES.ASSIGN_ROLES.SUCCESS_MESSAGE');

        setTimeout(() => {
          this.router.navigate(['/role-families/list']);
        }, 1000);
      },
      error: (error) => {
        this.text_validation = error.error?.message_text || this.translate.instant('ROLE_FAMILIES.ASSIGN_ROLES.ERROR_MESSAGE');
      }
    });
  }
}
