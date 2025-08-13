// Importación de módulos y servicios necesarios para el componente de edición de perfil
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProfileMService } from '../service/profile-m.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * Componente para editar un perfil médico.
 * Incluye carga de datos, validación y edición de perfil.
 */
@Component({
  selector: 'app-edit-profile-m',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './edit-profile-m.component.html',
  styleUrl: './edit-profile-m.component.scss'
})
export class EditProfileMComponent {
  /**
   * Nombre del perfil a editar
   */
  name: string = '';
  /**
   * Estado del perfil (1: activo, 2: inactivo)
   */
  state: number = 1;
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
   * Identificador del perfil a editar
   */
  profile_id: any;

  /**
   * Constructor que inyecta el servicio de perfil, ruta activa y traducción
   */
  constructor(
    public profileService: ProfileMService,
    public activedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente
   * Obtiene el id del perfil desde la ruta y carga los datos del perfil
   */
  ngOnInit(): void {
    this.activedRoute.params.subscribe((resp: any) => {
      this.profile_id = resp.id;
    })
    this.showProfile();
  }

  /**
   * Carga los datos del perfil desde el servicio y los asigna a las propiedades
   */
  showProfile() {
    this.profileService.showProfile(this.profile_id).subscribe((resp: any) => {
      this.name = resp.name;
      this.state = resp.state;
    })
  }

  /**
   * Guarda los cambios del perfil si el formulario es válido
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
    // Llama al servicio para editar el perfil
    this.profileService.editProfile(data, this.profile_id).subscribe((resp: any) => {
      // Si la respuesta es 403, muestra mensaje de advertencia
      if (resp.message == 403) {
        this.text_validation = resp.message_text;
        return;
      }
      // Si es exitoso, muestra mensaje de éxito
      this.valid_form_success = true;
    })
  }
}
