import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartamentMService } from '../service/departament-m.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DriverTourService } from 'src/app/shared/services/driver-tour.service';

@Component({
  selector: 'app-add-departament-m',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './add-departament-m.component.html',
  styleUrl: './add-departament-m.component.scss'
})
export class AddDepartamentMComponent {

  // Nombre del departamento a registrar
  name:string = '';
  // Estado del departamento (true = activo, false = inactivo)
  state: boolean = true;
  // Indica si el formulario es inválido
  valid_form: boolean = false;
  // Indica si el formulario se guardó correctamente
  valid_form_success: boolean = false;
  // Mensaje de validación adicional
  text_validation:any = null;

  /**
   * Inyecta el servicio de departamentos y el servicio de traducción
   */
  constructor(
    public departamentService: DepartamentMService,
    private translate: TranslateService,
    private router: Router,
    private driverTourService: DriverTourService
  ) {}

  /**
   * Inicializa el componente (sin lógica en este caso)
   */
  ngOnInit(): void {}

  /**
   * Inicia el tour guiado para el formulario de agregar departamento
   */
  public startDepartamentsFormTour(): void {
    this.driverTourService.startDepartamentsFormTour();
  }

  /**
   * Guarda el nuevo departamento en el backend
   */
  save(){
    this.valid_form = false;
    if(!this.name){
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
      state: this.state,
    };
    this.valid_form_success = false;
    this.text_validation = null;
    this.departamentService.storeDepartament(data).subscribe((resp:any) => {
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        this.name = '';
        this.state = true; // Resetear a activo
        this.valid_form_success = true;
        setTimeout(() => {
          this.router.navigateByUrl('/departaments-m/list-departament');
        }, 2000);
      }
    })
  }
}
