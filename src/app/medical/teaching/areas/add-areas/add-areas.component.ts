import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CatalogsService, CatalogItem } from '../../services/catalogs.service';

@Component({
  selector: 'app-add-areas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-areas.component.html',
  styleUrls: ['./add-areas.component.scss']
})
export class AddAreasComponent implements OnInit {
  
  private router = inject(Router);
  private catalogsService = inject(CatalogsService);

  public area: Partial<CatalogItem> = {
    nombre: '',
    descripcion: '',
    activo: true
  };

  public saving = false;
  public text_validation = '';

  ngOnInit(): void {}

  save(): void {
    if (!this.area.nombre?.trim()) {
      this.text_validation = 'El nombre es requerido';
      return;
    }

    this.saving = true;
    this.text_validation = '';

    this.catalogsService.createArea(this.area).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/teaching/list_area']);
        }
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al guardar área:', err);
        this.text_validation = err.error?.message || 'Error al guardar el área';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/teaching/list_area']);
  }
}
