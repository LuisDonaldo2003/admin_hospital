import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogsService, CatalogItem } from '../../services/catalogs.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-edit-stakeholdings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './edit-stakeholdings.component.html',
  styleUrls: ['./edit-stakeholdings.component.scss']
})
export class EditStakeholdingsComponent implements OnInit {
  
  private catalogsService = inject(CatalogsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private driverTourService = inject(DriverTourService);
  public selectedLang: string = 'en';

  public stakeholding: Partial<CatalogItem> = {};
  public stakeholdingId: number | null = null;
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
   * Inicia el tour guiado del formulario de editar participación
   */
  public startEditStakeholdingTour(): void {
    this.driverTourService.startEditStakeholdingTour();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.stakeholdingId = +params['id'];
        this.loadStakeholding(this.stakeholdingId);
      }
    });
  }

  loadStakeholding(id: number): void {
    this.loading = true;
    this.catalogsService.getParticipacion(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stakeholding = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        this.text_validation = this.translate.instant('TEACHING_MODULE.STAKEHOLDINGS.LOAD_ERROR');
        this.loading = false;
      }
    });
  }

  save(): void {
    if (!this.stakeholdingId) return;
    
    this.submitted = true;
    this.text_success = '';
    this.text_validation = '';
    
    if (!this.stakeholding.nombre?.trim()) {
      this.text_validation = this.translate.instant('TEACHING_MODULE.STAKEHOLDINGS.REQUIRED_FIELDS');
      return;
    }

    this.saving = true;

    this.catalogsService.updateParticipacion(this.stakeholdingId, this.stakeholding).subscribe({
      next: (response) => {
        if (response.success) {
          this.text_success = this.translate.instant('TEACHING_MODULE.STAKEHOLDINGS.UPDATE_SUCCESS');
          setTimeout(() => {
            this.router.navigate(['/teaching/list_stakeholding']);
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
    this.router.navigate(['/teaching/list_stakeholding']);
  }
}
