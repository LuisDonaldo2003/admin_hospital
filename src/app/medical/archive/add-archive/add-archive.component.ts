import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArchiveService } from '../service/archive.service';
import { DriverTourService } from '../../../shared/services/driver-tour.service';
import { ArchiveFormData } from '../models/location.interface';

@Component({
  selector: 'app-add-archive',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-archive.component.html',
  styleUrls: ['./add-archive.component.scss']
})
export class AddArchiveComponent implements OnInit {
  /**
   * Navega a la lista de archivos (expedientes) registrados.
   */
  goToList(): void {
    this.router.navigate(['/archives/list_archive']);
  }
  /**
   * Propiedades para almacenar los datos del formulario.
   */
  archive_number = '';
  name = '';
  last_name_father = '';
  last_name_mother = '';
  age: number | null = null;
  age_unit = 'años'; // Valor por defecto: años
  gender_id = '';
  address = '';
  location_text = '';  // Localidad en texto plano
  municipality_text = '';  // Municipio en texto plano
  state_text = '';  // Estado en texto plano
  admission_date = '';
  contact_last_name_father = '';
  contact_last_name_mother = '';
  contact_name = '';

  /**
   * Lista de géneros disponibles para el select.
   */
  genders: any[] = [];

  /**
   * Controla el estado de envío y mensajes de validación/éxito.
   */
  submitted = false;
  text_validation = '';
  text_success = '';

  private checkTimeout: any;

  /**
   * Inyección de dependencias.
   * @param archiveService Servicio para operaciones de archivo
   * @param router Servicio de navegación
   * @param translate Servicio de traducción
   * @param driverTourService Servicio del tour guiado
   */
  constructor(
    public archiveService: ArchiveService,
    public router: Router,
    private translate: TranslateService,
    public driverTourService: DriverTourService
  ) { }

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD usando la zona horaria local.
   * Evita problemas con UTC que pueden causar que se muestre un día adelantado.
   * @returns Fecha actual en formato string YYYY-MM-DD
   */
  private getTodayLocalDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Inicializa la fecha de admisión y carga los géneros al iniciar el componente.
   */
  ngOnInit(): void {
    // Usar la fecha local correcta
    this.admission_date = this.getTodayLocalDate();

    this.loadGenders();

    // Verificar si mostrar el tour del formulario automáticamente
    this.checkAndShowFormTour();
  }

  /**
   * Valida si el número de expediente ya existe en tiempo real (con debounce).
   */
  checkArchiveNumberExists(): void {
    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout);
    }

    if (!this.archive_number || this.archive_number.trim() === '') {
      this.text_validation = '';
      return;
    }

    this.checkTimeout = setTimeout(() => {
      this.archiveService.checkUniqueArchiveNumber(this.archive_number).subscribe({
        next: (res: any) => {
          if (res.status === 'error') {
            this.text_validation = res.message;
          } else {
            // Si ya no hay error, limpiamos mensaje
            this.text_validation = '';
          }
        },
        error: () => {
          // No bloqueamos por error de servidor
        }
      });
    }, 500);
  }

  private loadGenders(): void {
    this.archiveService.listGenders().subscribe({
      next: (data: any) => this.genders = data,
      error: () => {
        // Se elimina el log, pero se podría mostrar un mensaje de error en la UI si se requiere
      }
    });
  }

  /**
   * Valida los campos obligatorios y retorna los que faltan.
   */
  private validateForm(): string[] {
    const missingFields: string[] = [];

    if (!this.archive_number.trim()) missingFields.push(this.translate.instant('ARCHIVE_NUMBER'));
    if (!this.name.trim()) missingFields.push(this.translate.instant('FIRST_NAME'));
    if (!this.last_name_father.trim()) missingFields.push(this.translate.instant('FATHER_LAST_NAME'));
    if (!this.last_name_mother.trim()) missingFields.push(this.translate.instant('MOTHER_LAST_NAME'));
    if (!this.age || this.age <= 0) missingFields.push(this.translate.instant('AGE'));
    if (!this.gender_id) missingFields.push(this.translate.instant('GENDER'));
    if (!this.admission_date) missingFields.push(this.translate.instant('ADMISSION_DATE'));
    if (!this.location_text.trim()) missingFields.push(this.translate.instant('LOCATION'));

    return missingFields;
  }

  /**
   * Valida en tiempo real el input de nombre (solo letras y espacios).
   */
  onNameKeyPress(event: KeyboardEvent): boolean {
    this.clearMessages();
    const pattern = /^[A-Za-zÀ-ÿ\u00f1\u00d1\s]$/;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    return pattern.test(event.key) || allowedKeys.includes(event.key);
  }

  /**
   * Valida en tiempo real el input de edad (solo números).
   */
  onAgeKeyPress(event: KeyboardEvent): boolean {
    this.clearMessages();
    const pattern = /^[0-9]$/;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    return pattern.test(event.key) || allowedKeys.includes(event.key);
  }

  /**
   * Valida en tiempo real el input de número de expediente (solo números).
   */
  onArchiveNumberKeyPress(event: KeyboardEvent): boolean {
    this.clearMessages();
    const pattern = /^[0-9]$/;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    return pattern.test(event.key) || allowedKeys.includes(event.key);
  }

  /**
   * Valida en tiempo real el input de localidad (letras, espacios, coma, punto y guion).
   */
  onLocationKeyPress(event: KeyboardEvent): boolean {
    this.clearMessages();
    const pattern = /^[A-Za-zÀ-ÿ\u00f1\u00d1\s,.\-]$/;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    return pattern.test(event.key) || allowedKeys.includes(event.key);
  }

  /**
   * Limpia el mensaje de validación si existe.
   */
  private clearMessages(): void {
    if (this.text_validation) {
      this.text_validation = '';
    }
  }

  /**
   * Guarda el expediente del paciente. Valida los campos y envía los datos al servicio.
   * Elimina todos los logs y mejora el manejo de errores.
   */
  save(): void {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    const missingFields = this.validateForm();

    if (missingFields.length > 0) {
      const plural = missingFields.length > 1;
      const campos = missingFields.join(', ');
      this.text_validation = this.translate.instant('Faltan algunos datos', {
        plural: plural ? 'n' : '',
        sPlural: plural ? 's' : '',
        campos
      });
      return;
    }

    const formData: ArchiveFormData = {
      archive_number: this.archive_number.trim(),
      name: this.name.trim(),
      last_name_father: this.last_name_father.trim(),
      last_name_mother: this.last_name_mother.trim(),
      age: this.age,
      age_unit: this.age_unit,
      gender_id: this.gender_id,
      address: this.address.trim(),
      admission_date: this.admission_date,
      location_text: this.location_text.trim(),
      municipality_text: this.municipality_text.trim(),
      state_text: this.state_text.trim(),
      contact_last_name_father: this.contact_last_name_father.trim(),
      contact_last_name_mother: this.contact_last_name_mother.trim(),
      contact_name: this.contact_name.trim()
    };

    this.archiveService.registerArchive(formData).subscribe({
      next: () => {
        // Mensaje de éxito al registrar paciente
        this.text_success = 'Paciente registrado exitosamente';
        // Limpiar el formulario inmediatamente
        this.resetForm();
        // Redirigir automáticamente
        setTimeout(() => {
          this.router.navigate(['/archives/list_archive']);
        }, 1500);
      },
      error: (err) => {
        // Manejo de errores específico y genérico
        if (err.status === 422 && err.error?.errors?.archive_number) {
          // Error de validación específico para número de expediente duplicado
          this.text_validation = err.error.errors.archive_number[0];
        } else if (err.error?.message) {
          // Mensaje de error del servidor
          this.text_validation = err.error.message;
        } else if (err.status === 500) {
          // Error 500 del servidor
          this.text_validation = 'Error interno del servidor. Por favor, verifique que el número de expediente no esté duplicado.';
        } else {
          // Error genérico
          this.text_validation = 'Ocurrió un error al registrar el paciente. Por favor, inténtelo nuevamente.';
        }
      }
    });
  }

  /**
   * Resetea todos los campos del formulario y el estado de validación.
   */
  private resetForm(): void {
    this.archive_number = '';
    this.name = '';
    this.last_name_father = '';
    this.last_name_mother = '';
    this.age = null;
    this.age_unit = 'years'; // Volver al valor por defecto
    this.gender_id = '';
    this.address = '';
    this.location_text = '';
    this.municipality_text = '';
    this.state_text = '';
    this.contact_last_name_father = '';
    this.contact_last_name_mother = '';
    this.contact_name = '';

    // Usar la fecha local correcta
    this.admission_date = this.getTodayLocalDate();

    this.submitted = false;
    this.text_validation = '';
    // No limpiar text_success aquí para que se vea el mensaje
  }

  // ================================
  // MÉTODOS DE TOUR GUIADO
  // ================================

  /**
   * Verifica si debe mostrar el tour del formulario automáticamente
   */
  private checkAndShowFormTour(): void {
    // Solo mostrar el tour automáticamente si es la primera vez
    if (!this.driverTourService.isTourCompleted('archive-form-welcome')) {
      setTimeout(() => {
        this.startArchiveFormTour();
        // Marcar como completado el tour de bienvenida automático
        const completedTours = JSON.parse(localStorage.getItem('completedTours') || '[]');
        completedTours.push('archive-form-welcome');
        localStorage.setItem('completedTours', JSON.stringify(completedTours));
      }, 1500);
    }
  }

  /**
   * Inicia el tour completo del formulario de archivos
   */
  public startArchiveFormTour(): void {
    this.driverTourService.startArchiveFormTour();
  }

  /**
   * Destaca una funcionalidad específica con un tour rápido
   */
  public highlightFeature(element: string, titleKey: string, descKey: string): void {
    const title = this.translate.instant(titleKey);
    const description = this.translate.instant(descKey);
    this.driverTourService.highlightElement(element, title, description);
  }
}