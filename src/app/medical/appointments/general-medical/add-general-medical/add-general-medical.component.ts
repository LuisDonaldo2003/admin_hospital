import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GeneralMedicalService } from '../service/general-medical.service';

@Component({
  selector: 'app-add-general-medical',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './add-general-medical.component.html',
  styleUrls: ['./add-general-medical.component.scss']
})
export class AddGeneralMedicalComponent {
  nombre: string = '';
  descripcion: string = '';
  activo: boolean = true;
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation: string | null = null;

  constructor(
    public generalMedicalService: GeneralMedicalService,
    private translate: TranslateService,
    private router: Router
  ) { }

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

    this.generalMedicalService.storeGeneralMedical(data).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.nombre = '';
          this.descripcion = '';
          this.activo = true;
          this.valid_form_success = true;

          setTimeout(() => {
            this.valid_form_success = false;
            this.router.navigate(['/appointments/general-medicals/list']);
          }, 1500);
        } else {
          this.text_validation = resp.message;
        }
      },
      error: (error: any) => {
        console.error('Error saving general medical:', error);
        this.text_validation = error.error?.message || 'Error al guardar la categoría';
      }
    });
  }

  cancel() {
    this.router.navigate(['/appointments/general-medicals/list']);
  }
}
