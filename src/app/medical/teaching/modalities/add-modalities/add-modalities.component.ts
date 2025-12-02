import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogsService, CatalogItem } from '../../services/catalogs.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-add-modalities',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-modalities.component.html',
  styleUrls: ['./add-modalities.component.scss']
})
export class AddModalitiesComponent implements OnInit {
  
  private catalogsService = inject(CatalogsService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private driverTourService = inject(DriverTourService);
  public selectedLang: string = 'en';

  public modality: Partial<CatalogItem> = { activo: true };
  public saving = false;
  public submitted = false;
  public text_success: string = '';
  public text_validation: string = '';

  constructor() {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  /**
   * Inicia el tour guiado del formulario de agregar modalidad
   */
  public startModalitiesFormTour(): void {
    this.driverTourService.startModalitiesFormTour();
  }

  ngOnInit(): void {}

  save(): void {
    this.submitted = true;
    this.text_success = '';
    this.text_validation = '';
    
    if (!this.modality.nombre?.trim() || !this.modality.codigo?.trim()) {
      this.text_validation = 'Por favor, completa todos los campos requeridos';
      return;
    }
    
    this.saving = true;

    this.catalogsService.createModalidad(this.modality).subscribe({
      next: (response) => {
        if (response.success) {
          this.text_success = this.translate.instant('TEACHING_MODULE.MODALITIES.SUCCESS_MESSAGE');
          setTimeout(() => {
            this.router.navigate(['/teaching/list_modality']);
          }, 2000);
        }
        this.saving = false;
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.text_validation = err.error?.message || 'Error al guardar';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/teaching/list_modality']);
  }
}
