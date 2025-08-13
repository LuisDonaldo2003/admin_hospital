import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArchiveService } from '../service/archive.service';

interface Gender {
  id: number;
  name: string;
}

interface State {
  id: number;
  name: string;
}

interface Municipality {
  id: number;
  name: string;
  state_id: number;
}

interface Location {
  id: number;
  name: string;
  municipality_id: number;
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
  gender_id = '';
  address = '';
  state_id = '';
  municipality_id = '';
  location_id = '';
  admission_date = '';

  /** Listas para los selects de género, estado, municipio y localidad. */
  genders: Gender[] = [];
  states: State[] = [];
  municipalities: Municipality[] = [];
  locations: Location[] = [];

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
    private translate: TranslateService
  ) {}

  /** Inicializa el componente cargando el expediente y los dropdowns. */
  ngOnInit(): void {
    this.archiveId = +this.route.snapshot.paramMap.get('id')!;
    this.loadArchive(this.archiveId);
    this.loadDropdowns();
  }

  /** Carga los datos del expediente a editar y los asigna a los campos del formulario. */
  loadArchive(id: number): void {
    this.archiveService.showArchive(id).subscribe({
      next: (res: any) => {
        const data = res.archive;
        // Fuerza a string los campos que pueden venir como número
        this.archive_number = data.archive_number !== undefined && data.archive_number !== null ? String(data.archive_number) : '';
        this.name = data.name !== undefined && data.name !== null ? String(data.name) : '';
        this.last_name_father = data.last_name_father !== undefined && data.last_name_father !== null ? String(data.last_name_father) : '';
        this.last_name_mother = data.last_name_mother !== undefined && data.last_name_mother !== null ? String(data.last_name_mother) : '';
        this.age = data.age;
        this.gender_id = data.gender_id !== undefined && data.gender_id !== null ? String(data.gender_id) : '';
        this.address = data.address !== undefined && data.address !== null ? String(data.address) : '';
        this.admission_date = data.admission_date?.split('T')[0] || '';

        this.location_id = data.location_id !== undefined && data.location_id !== null ? String(data.location_id) : '';
        this.municipality_id = data.location?.municipality?.id !== undefined && data.location?.municipality?.id !== null ? String(data.location?.municipality?.id) : '';
        this.state_id = data.location?.municipality?.state?.id !== undefined && data.location?.municipality?.state?.id !== null ? String(data.location?.municipality?.state?.id) : '';

        // Si hay estado y municipio, cargar los dropdowns dependientes
        if (this.state_id) this.loadMunicipalities(this.state_id);
        if (this.municipality_id) this.loadLocations(this.municipality_id);
      },
      error: () => {
        this.text_validation = this.translate.instant('ERROR_OCCURRED');
      }
    });
  }

  /** Carga las opciones de estados y géneros para los selects. */
  loadDropdowns(): void {
    this.archiveService.listStates().subscribe((s: any) => this.states = s as State[]);
    this.archiveService.listGenders().subscribe((g: any) => this.genders = g as Gender[]);
  }

  /** Carga los municipios según el estado seleccionado. */
  loadMunicipalities(stateId: string | number): void {
    this.archiveService.listMunicipalities(stateId).subscribe((m: any) => {
      this.municipalities = m as Municipality[];
    });
  }

  /** Carga las localidades según el municipio seleccionado. */
  loadLocations(municipalityId: string | number): void {
    this.archiveService.listLocations(municipalityId).subscribe((l: any) => {
      this.locations = l as Location[];
    });
  }

  /** Maneja el cambio de estado, reseteando municipio y localidad. */
  onStateChange(): void {
    this.municipality_id = '';
    this.location_id = '';
    this.municipalities = [];
    this.locations = [];

    if (this.state_id) this.loadMunicipalities(this.state_id);
  }

  /** Maneja el cambio de municipio, reseteando localidad. */
  onMunicipalityChange(): void {
    this.location_id = '';
    this.locations = [];

    if (this.municipality_id) this.loadLocations(this.municipality_id);
  }

  /** Valida los campos y envía la actualización del expediente al backend. */
  update(): void {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    const missingFields: string[] = [];

    // Siempre trata los campos como string antes de usar trim
    if (!(`${this.archive_number}`.trim())) missingFields.push(this.translate.instant('ARCHIVE_NUMBER'));
    if (!(`${this.name}`.trim())) missingFields.push(this.translate.instant('FIRST_NAME'));
    if (!(`${this.last_name_father}`.trim())) missingFields.push(this.translate.instant('FATHER_LAST_NAME'));
    if (!this.age) missingFields.push(this.translate.instant('AGE'));
    if (!(`${this.gender_id}`.trim())) missingFields.push(this.translate.instant('GENDER'));
    if (!(`${this.state_id}`.trim())) missingFields.push(this.translate.instant('STATE'));
    if (!(`${this.municipality_id}`.trim())) missingFields.push(this.translate.instant('MUNICIPALITY'));
    if (!(`${this.location_id}`.trim())) missingFields.push(this.translate.instant('LOCATION'));
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
      gender_id: this.gender_id,
      address: this.address,
      location_id: this.location_id,
      admission_date: this.admission_date
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
