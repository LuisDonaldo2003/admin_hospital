import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogsService, CatalogItem } from '../../services/catalogs.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-edit-modalities',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './edit-modalities.component.html',
  styleUrls: ['./edit-modalities.component.scss']
})
export class EditModalitiesComponent implements OnInit {
  
  private catalogsService = inject(CatalogsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private driverTourService = inject(DriverTourService);
  public selectedLang: string = 'en';

  public modality: Partial<CatalogItem> = {};
  public modalityId: number | null = null;
  public loading = false;
  public saving = false;
  public submitted = false;
  public text_success: string = '';
  public text_validation: string = '';

  constructor() {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  /**
   * Inicia el tour guiado del formulario de editar modalidad
   */
  public startEditModalityTour(): void {
    this.driverTourService.startEditModalityTour();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modalityId = +params['id'];
        this.loadModality(this.modalityId);
      }
    });
  }

  loadModality(id: number): void {
    this.loading = true;
    this.catalogsService.getModalidad(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.modality = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        this.text_validation = this.translate.instant('TEACHING_MODULE.MODALITIES.LOAD_ERROR');
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.modalityId) return;
    
    this.submitted = true;
    this.text_success = '';
    this.text_validation = '';
    
    if (!this.modality.nombre?.trim() || !this.modality.codigo?.trim()) {
      this.text_validation = 'Por favor, completa todos los campos requeridos';
      return;
    }

    this.saving = true;

    this.catalogsService.updateModalidad(this.modalityId, this.modality).subscribe({
      next: (response) => {
        if (response.success) {
          this.text_success = this.translate.instant('TEACHING_MODULE.MODALITIES.UPDATE_SUCCESS');
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
