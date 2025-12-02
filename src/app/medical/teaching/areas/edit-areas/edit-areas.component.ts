import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogsService, CatalogItem } from '../../services/catalogs.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-edit-areas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './edit-areas.component.html',
  styleUrls: ['./edit-areas.component.scss']
})
export class EditAreasComponent implements OnInit {
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private catalogsService = inject(CatalogsService);
  private driverTourService = inject(DriverTourService);
  private translate = inject(TranslateService);

  /**
   * Inicia el tour guiado del formulario de editar área
   */
  public startEditAreaTour(): void {
    this.driverTourService.startEditAreaTour();
  }

  public area: Partial<CatalogItem> = {
    nombre: '',
    descripcion: '',
    activo: true
  };

  public areaId: number = 0;
  public loading = false;
  public saving = false;
  public submitted = false;
  public text_validation = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.areaId = +params['id'];
        this.loadArea();
      }
    });
  }

  loadArea(): void {
    this.loading = true;
    this.catalogsService.getArea(this.areaId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.area = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        this.text_validation = this.translate.instant('TEACHING_MODULE.AREAS.LOAD_AREA_ERROR');
        this.loading = false;
      }
    });
  }

  save(): void {
    this.submitted = true;
    this.text_validation = '';
    
    if (!this.area.nombre?.trim()) {
      this.text_validation = this.translate.instant('TEACHING_MODULE.AREAS.REQUIRED_FIELDS');
      return;
    }

    this.saving = true;

    this.catalogsService.updateArea(this.areaId, this.area).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/teaching/list_area']);
        }
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al actualizar área:', err);
        this.text_validation = err.error?.message || 'Error al actualizar el área';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/teaching/list_area']);
  }
}
