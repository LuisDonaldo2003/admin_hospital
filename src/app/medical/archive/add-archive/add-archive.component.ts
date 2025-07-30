import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ArchiveService } from '../service/archive.service';

@Component({
  selector: 'app-add-archive',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-archive.component.html',
  styleUrls: ['./add-archive.component.scss']
})
export class AddArchiveComponent implements OnInit {
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

  genders: any[] = [];
  states: any[] = [];
  municipalities: any[] = [];
  locations: any[] = [];

  submitted = false;
  text_validation = '';
  text_success = '';

  constructor(
    private archiveService: ArchiveService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.admission_date = new Date().toISOString().split('T')[0];

    this.loadStates();
    this.loadGenders();
  }

  private loadStates(): void {
    this.archiveService.listStates().subscribe({
      next: (data: any) => {
        this.states = data;
        
        // Buscar y seleccionar automáticamente el estado "Guerrero"
        const guerreroState = this.states.find(state => 
          state.name.toLowerCase().includes('guerrero')
        );
        
        if (guerreroState) {
          this.state_id = guerreroState.id;
          console.log('✅ Estado "Guerrero" seleccionado automáticamente:', guerreroState.name);
          
          // Cargar automáticamente los municipios de Guerrero
          this.loadMunicipalitiesForGuerrero();
        }
      },
      error: (err) => console.error('Error al cargar estados:', err)
    });
  }

  private loadMunicipalitiesForGuerrero(): void {
    if (this.state_id) {
      this.archiveService.listMunicipalities(this.state_id).subscribe({
        next: (data: any) => {
          this.municipalities = data;
          console.log(`✅ Municipios de Guerrero cargados: ${data.length} municipios`);
        },
        error: (err) => console.error('Error al cargar municipios de Guerrero:', err)
      });
    }
  }

  private loadGenders(): void {
    this.archiveService.listGenders().subscribe({
      next: (data: any) => this.genders = data,
      error: (err) => console.error('Error al cargar géneros:', err)
    });
  }

  onStateChange(): void {
    this.municipality_id = '';
    this.location_id = '';
    this.municipalities = [];
    this.locations = [];

    if (this.state_id) {
      this.archiveService.listMunicipalities(this.state_id).subscribe({
        next: (data: any) => this.municipalities = data,
        error: (err) => console.error('Error al cargar municipios:', err)
      });
    }
  }

  onMunicipalityChange(): void {
    this.location_id = '';
    this.locations = [];

    if (this.municipality_id) {
      this.archiveService.listLocations(this.municipality_id).subscribe({
        next: (data: any) => this.locations = data,
        error: (err) => console.error('Error al cargar localidades:', err)
      });
    }
  }

  save(): void {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    const missingFields: string[] = [];

    if (!this.archive_number.trim()) missingFields.push(this.translate.instant('ARCHIVE_NUMBER'));
    if (!this.name.trim()) missingFields.push(this.translate.instant('FIRST_NAME'));
    if (!this.last_name_father.trim()) missingFields.push(this.translate.instant('FATHER_LAST_NAME'));
    if (!this.age) missingFields.push(this.translate.instant('AGE'));
    if (!this.gender_id) missingFields.push(this.translate.instant('GENDER'));
    if (!this.state_id) missingFields.push(this.translate.instant('STATE'));
    if (!this.municipality_id) missingFields.push(this.translate.instant('MUNICIPALITY'));
    if (!this.location_id) missingFields.push(this.translate.instant('LOCATION'));
    if (!this.admission_date) missingFields.push(this.translate.instant('ADMISSION_DATE'));

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

    const formData = {
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

    this.archiveService.registerArchive(formData).subscribe({
      next: () => {
        this.text_success = this.translate.instant('ARCHIVE_REGISTERED_SUCCESS');
        setTimeout(() => {
          this.router.navigate(['/archives/list_archive']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al registrar archivo:', err);
        this.text_validation = this.translate.instant('ERROR_OCCURRED');
      }
    });
  }
}
