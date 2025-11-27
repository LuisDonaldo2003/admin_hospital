// Importación de módulos y servicios necesarios para el componente de agregar perfil
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileMService } from '../service/profile-m.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

/**
 * Componente para agregar un nuevo perfil médico.
 * Incluye validación de formulario y mensajes de éxito/error.
 */
@Component({
  selector: 'app-add-profile-m',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './add-profile-m.component.html',
  styleUrl: './add-profile-m.component.scss'
})
export class AddProfileMComponent {
  /**
   * Nombre del perfil a registrar
   */
  name: string = '';
  /**
   * Estado del perfil (true = activo, false = inactivo)
   */
  state: boolean = true;
  /**
   * Bandera para mostrar error de formulario inválido
   */
  valid_form: boolean = false;
  /**
   * Bandera para mostrar mensaje de éxito
   */
  valid_form_success: boolean = false;
  /**
   * Mensaje de validación personalizado
   */
  text_validation: any = null;

  /**
   * Constructor que inyecta el servicio de perfil y traducción
   */
  constructor(
    public profileService: ProfileMService,
    private translate: TranslateService
    ,
    private router: Router
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   */
  ngOnInit(): void {}

  /**
   * Guarda el perfil médico si el formulario es válido
   * Muestra mensajes de error, éxito o advertencia según la respuesta
   */
  save() {
    // Reinicia la bandera de error
    this.valid_form = false;
    // Valida que el campo nombre no esté vacío
    if (!this.name) {
      this.valid_form = true;
      return;
    }
    // Prepara los datos para enviar al servicio
    let data = {
      name: this.name,
      state: this.state,
    };
    // Reinicia banderas de éxito y validación
    this.valid_form_success = false;
    this.text_validation = null;
    // Llama al servicio para guardar el perfil
    this.profileService.storeProfile(data).subscribe((resp: any) => {
      // Si la respuesta es 403, muestra mensaje de advertencia
      if (resp.message == 403) {
        this.text_validation = resp.message_text;
      } else {
        // Si es exitoso, limpia el campo y muestra mensaje de éxito
        this.name = '';
        this.state = true; // Resetear a activo
        this.valid_form_success = true;
        setTimeout(() => {
          this.router.navigateByUrl('/profile-m/list_profile-m');
        }, 2000);
      }
    })
  }
}
