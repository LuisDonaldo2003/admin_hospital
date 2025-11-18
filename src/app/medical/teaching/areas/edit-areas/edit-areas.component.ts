import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CatalogsService, CatalogItem } from '../../services/catalogs.service';

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

  public area: Partial<CatalogItem> = {
    nombre: '',
    descripcion: '',
    activo: true
  };

  public areaId: number = 0;
  public loading = false;
  public saving = false;
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
        console.error('Error al cargar área:', err);
        this.text_validation = 'No se pudo cargar el área';
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.area.nombre?.trim()) {
      this.text_validation = 'El nombre es requerido';
      return;
    }

    this.saving = true;
    this.text_validation = '';

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
