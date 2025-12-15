import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GeneralMedicalService } from '../service/general-medical.service';

@Component({
  selector: 'app-edit-general-medical',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './edit-general-medical.component.html',
  styleUrls: ['./edit-general-medical.component.scss']
})
export class EditGeneralMedicalComponent implements OnInit {
  nombre: string = '';
  descripcion: string = '';
  activo: boolean = true;
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation: string | null = null;
  general_medical_id: number = 0;

  constructor(
    public generalMedicalService: GeneralMedicalService,
    public activedRoute: ActivatedRoute,
    private translate: TranslateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.activedRoute.params.subscribe((resp: any) => {
      this.general_medical_id = resp.id;
    });

    this.generalMedicalService.showGeneralMedical(this.general_medical_id).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.nombre = resp.data.nombre;
          this.descripcion = resp.data.descripcion || '';
          this.activo = resp.data.activo;
        }
      },
      error: (error: any) => {
        console.error('Error loading general medical:', error);
      }
    });
  }

  save() {
    this.valid_form = false;

    if (!this.nombre.trim()) {
      this.valid_form = true;
      return;
    }

    const data = {
      nombre: this.nombre,
      descripcion: this.descripcion || null,
      activo: this.activo
    };

    this.valid_form_success = false;
    this.text_validation = null;

    this.generalMedicalService.editGeneralMedical(this.general_medical_id, data).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.valid_form_success = true;

          setTimeout(() => {
            this.router.navigate(['/appointments/general-medicals/list']);
          }, 1500);
        } else {
          this.text_validation = resp.message;
        }
      },
      error: (error: any) => {
        console.error('Error updating general medical:', error);
        this.text_validation = error.error?.message || 'Error al actualizar la categoría';
      }
    });
  }

  cancel() {
    this.router.navigate(['/appointments/general-medicals/list']);
  }
}
