import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EspecialidadService } from '../service/especialidad.service';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-add-especialidad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './add-especialidad.component.html',
  styleUrls: ['./add-especialidad.component.scss']
})
export class AddEspecialidadComponent {
  nombre: string = '';
  descripcion: string = '';
  activo: boolean = true;
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation: string | null = null;

  constructor(
    public especialidadService: EspecialidadService,
    private translate: TranslateService,
    private router: Router,
    private driverTourService: DriverTourService
  ) {}

  /**
   * Inicia el tour guiado del formulario
   */
  startTour(): void {
    this.driverTourService.startAddEspecialidadTour();
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

    this.especialidadService.storeEspecialidad(data).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.nombre = '';
          this.descripcion = '';
          this.activo = true;
          this.valid_form_success = true;
          
          setTimeout(() => {
            this.valid_form_success = false;
            this.router.navigate(['/appointments/especialidades/list']);
          }, 1500);
        } else {
          this.text_validation = resp.message;
        }
      },
      error: (error: any) => {
        console.error('Error saving especialidad:', error);
        this.text_validation = error.error?.message || 'Error al guardar la especialidad';
      }
    });
  }

  cancel() {
    this.router.navigate(['/appointments/especialidades/list']);
  }
}
