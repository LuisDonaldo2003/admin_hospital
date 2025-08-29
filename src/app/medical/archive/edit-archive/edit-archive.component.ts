import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArchiveService } from '../service/archive.service';
import { DriverTourService } from '../../../shared/services/driver-tour.service';

interface Gender {
  id: number;
  name: string;
}

@Component({
  selector: 'app-edit-archive',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './edit-archive.component.html',
  styleUrls: ['./edit-archive.component.scss']
})
export class EditArchiveComponent implements OnInit {
  /** ID del expediente a editar. */
  archiveId: number = 0;

  /** Campos del formulario de edición. */
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
  contact_name = '';
  contact_last_name_father = '';
  contact_last_name_mother = '';

  /** Listas para el select de género únicamente. */
  genders: Gender[] = [];

  /** Estado de envío y mensajes de validación/éxito. */
  submitted = false;
  text_validation = '';
  text_success = '';

  /**
   * Inyección de servicios para datos, rutas y traducción.
   */
  constructor(
    private archiveService: ArchiveService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private driverTourService: DriverTourService
  ) {}

  /** Inicializa el componente cargando el expediente y los dropdowns. */
  ngOnInit(): void {
    this.archiveId = +this.route.snapshot.paramMap.get('id')!;
    this.loadArchive(this.archiveId);
    this.loadDropdowns();
    this.checkAndShowEditTour();
  }

  /**
   * Verifica si debe mostrar el tour de bienvenida
   */
  checkAndShowEditTour(): void {
    if (!this.driverTourService.isTourCompleted('edit-archive')) {
      setTimeout(() => {
        this.startEditArchiveTour();
      }, 1000);
    }
  }

  /**
   * Inicia el tour guiado para edición de archivos
   */
  startEditArchiveTour(): void {
    this.driverTourService.startEditArchiveTour();
  }

  /** Carga los datos del expediente a editar y los asigna a los campos del formulario. */
  loadArchive(id: number): void {
    this.archiveService.showArchive(id).subscribe({
      next: (res: any) => {
        const data = res.archive;
        // Asignar campos a strings seguros
        this.archive_number = data.archive_number !== undefined && data.archive_number !== null ? String(data.archive_number) : '';
        this.name = data.name !== undefined && data.name !== null ? String(data.name) : '';
        this.last_name_father = data.last_name_father !== undefined && data.last_name_father !== null ? String(data.last_name_father) : '';
        this.last_name_mother = data.last_name_mother !== undefined && data.last_name_mother !== null ? String(data.last_name_mother) : '';
        this.age = data.age;
        this.age_unit = data.age_unit || 'años'; // Valor por defecto si no existe
        this.gender_id = data.gender_id !== undefined && data.gender_id !== null ? String(data.gender_id) : '';
        this.address = data.address !== undefined && data.address !== null ? String(data.address) : '';
        this.admission_date = data.admission_date?.split('T')[0] || '';

        // Asignar campos de texto plano
        this.location_text = data.location_text || '';
        this.municipality_text = data.municipality_text || '';
        this.state_text = data.state_text || '';
        this.contact_name = data.contact_name || '';
        this.contact_last_name_father = data.contact_last_name_father || '';
        this.contact_last_name_mother = data.contact_last_name_mother || '';
      },
      error: () => {
        this.text_validation = this.translate.instant('ERROR_OCCURRED');
      }
    });
  }

  /** Carga las opciones de géneros para el select. */
  loadDropdowns(): void {
    this.archiveService.listGenders().subscribe((g: any) => this.genders = g as Gender[]);
  }

  /** Valida los campos y envía la actualización del expediente al backend. */
  update(): void {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    const missingFields: string[] = [];

    // Validar campos obligatorios
    if (!(`${this.archive_number}`.trim())) missingFields.push(this.translate.instant('ARCHIVE_NUMBER'));
    if (!(`${this.name}`.trim())) missingFields.push(this.translate.instant('FIRST_NAME'));
    if (!(`${this.last_name_father}`.trim())) missingFields.push(this.translate.instant('FATHER_LAST_NAME'));
    if (!this.age) missingFields.push(this.translate.instant('AGE'));
    if (!(`${this.gender_id}`.trim())) missingFields.push(this.translate.instant('GENDER'));
    if (!(`${this.location_text}`.trim())) missingFields.push(this.translate.instant('LOCATION'));
    if (!(`${this.admission_date}`.trim())) missingFields.push(this.translate.instant('ADMISSION_DATE'));

    if (missingFields.length > 0) {
      const campos = missingFields.join(', ');
      this.text_validation = this.translate.instant('FIELDS_MISSING', {
        plural: missingFields.length > 1 ? 'n' : '',
        sPlural: missingFields.length > 1 ? 's' : '',
        campos
      });
      return;
    }

    const updatedData = {
      archive_number: this.archive_number,
      name: this.name,
      last_name_father: this.last_name_father,
      last_name_mother: this.last_name_mother,
      age: this.age,
      age_unit: this.age_unit,
      gender_id: this.gender_id,
      address: this.address,
      location_text: this.location_text,
      municipality_text: this.municipality_text,
      state_text: this.state_text,
      admission_date: this.admission_date,
      contact_name: this.contact_name,
      contact_last_name_father: this.contact_last_name_father,
      contact_last_name_mother: this.contact_last_name_mother
    };

    this.archiveService.updateArchive(this.archiveId, updatedData).subscribe({
      next: () => {
        this.text_success = this.translate.instant('ARCHIVE_UPDATED_SUCCESS');
        setTimeout(() => {
          this.router.navigate(['/archives/list_archive']);
        }, 2000);
      },
      error: () => {
        this.text_validation = this.translate.instant('ERROR_OCCURRED');
      }
    });
  }
}
