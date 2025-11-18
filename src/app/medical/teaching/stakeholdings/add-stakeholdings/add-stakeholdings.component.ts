import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CatalogsService, CatalogItem } from '../../services/catalogs.service';

@Component({
  selector: 'app-add-stakeholdings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './add-stakeholdings.component.html',
  styleUrls: ['./add-stakeholdings.component.scss']
})
export class AddStakeholdingsComponent implements OnInit {
  
  private catalogsService = inject(CatalogsService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  public selectedLang: string = 'en';

  public stakeholding: Partial<CatalogItem> = { activo: true };
  public saving = false;
  public text_success: string = '';
  public text_validation: string = '';

  constructor() {
    this.selectedLang = localStorage.getItem('language') || 'en';
    this.translate.use(this.selectedLang);
  }

  ngOnInit(): void {}

  save(): void {
    this.saving = true;
    this.text_success = '';
    this.text_validation = '';

    this.catalogsService.createParticipacion(this.stakeholding).subscribe({
      next: (response) => {
        if (response.success) {
          this.text_success = 'Participación creada correctamente';
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
