import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RoleFamilyService } from '../service/role-family.service'
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-list-role-family',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './list-role-family.component.html',
  styleUrls: ['./list-role-family.component.scss']
})
export class ListRoleFamilyComponent implements OnInit {
  familiesList: any[] = [];
  familiesListFilter: any[] = [];
  searchDataValue = '';
  /**
   * Familia seleccionada para acciones (editar/eliminar)
   */
  public family_selected: any;

  constructor(
    public roleFamilyService: RoleFamilyService,
    public translate: TranslateService,
    private driverTourService: DriverTourService
  ) { }

  /**
   * Inicia el tour guiado de la lista de familias de roles
   */
  public startRoleFamiliesListTour(): void {
    this.driverTourService.startRoleFamiliesListTour();
  }

  ngOnInit(): void {
    this.loadFamilies();
  }

  loadFamilies() {
    this.roleFamilyService.listFamilies().subscribe({
      next: (resp: any) => {
        this.familiesList = resp.families ?? [];
        this.familiesListFilter = this.familiesList;
      },
      error: (error) => {
        console.error('Error loading families:', error);
      }
    });
  }

  searchData(searchValue: string) {
    this.familiesListFilter = this.familiesList.filter((family: any) =>
      family.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }

  /**
   * Selecciona una familia para acciones (editar/eliminar)
   */
  selectFamily(family: any) {
    this.family_selected = family;
  }

  /**
   * Elimina la familia seleccionada y actualiza la tabla
   */
  deleteFamily() {
    this.roleFamilyService.deleteFamily(this.family_selected.id).subscribe(() => {
      // Actualizar el array de familias
      const INDEX = this.familiesListFilter.findIndex((item: any) => item.id === this.family_selected.id);
      if (INDEX !== -1) {
        this.familiesListFilter.splice(INDEX, 1);
      }

      // También actualizar la lista completa
      const INDEX_GENERAL = this.familiesList.findIndex((item: any) => item.id === this.family_selected.id);
      if (INDEX_GENERAL !== -1) {
        this.familiesList.splice(INDEX_GENERAL, 1);
      }

      this.family_selected = null;
    });
  }
}
