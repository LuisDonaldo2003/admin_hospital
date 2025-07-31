import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
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
export class AddArchiveComponent implements OnInit, OnDestroy {
  archive_number = '';
  name = '';
  last_name_father = '';
  last_name_mother = '';
  age: number | null = null;
  gender_id = '';
  address = '';
  location_id = '';
  admission_date = '';

  // Nuevas propiedades para búsqueda de localidad
  locationSearchTerm = '';
  filteredLocations: any[] = [];
  selectedLocationData: any = null;
  showLocationDropdown = false;
  isSearchingLocations = false;
  searchTimeout: any = null;

  genders: any[] = [];

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
    this.loadGenders();
    
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.position-relative')) {
        this.showLocationDropdown = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    document.removeEventListener('click', () => {});
  }

  private loadGenders(): void {
    this.archiveService.listGenders().subscribe({
      next: (data: any) => this.genders = data,
      error: (err) => console.error('Error al cargar géneros:', err)
    });
  }

  onLocationSearch(event: any): void {
    const searchTerm = event.target.value.trim();
    this.locationSearchTerm = searchTerm;

    // Limpiar timeout anterior
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (searchTerm.length < 2) {
      this.filteredLocations = [];
      this.showLocationDropdown = false;
      return;
    }

    this.showLocationDropdown = true;
    this.isSearchingLocations = true;

    // Debounce: esperar 300ms antes de hacer la búsqueda
    this.searchTimeout = setTimeout(() => {
      this.archiveService.searchLocationsByName(searchTerm).subscribe({
        next: (data: any) => {
          console.log('Locations found:', data);
          this.filteredLocations = data || [];
          this.isSearchingLocations = false;
          
          // Mostrar dropdown si hay resultados
          this.showLocationDropdown = this.filteredLocations.length > 0;
        },
        error: (err) => {
          console.error('Error al buscar localidades:', err);
          this.filteredLocations = [];
          this.isSearchingLocations = false;
          this.showLocationDropdown = false;
        }
      });
    }, 300);
  }

  selectLocation(location: any): void {
    this.location_id = location.id;
    this.selectedLocationData = location;
    this.locationSearchTerm = location.name;
    this.showLocationDropdown = false;
    this.filteredLocations = [];
  }

  trackByLocationId(index: number, location: any): any {
    return location.id;
  }

  isPriorityState(stateName: string): boolean {
    const priorityStates = ['Guerrero', 'Michoacán', 'México', 'Morelos', 'Puebla', 'Oaxaca'];
    return priorityStates.includes(stateName);
  }

  getPriorityIndicator(stateName: string): string {
    if (stateName === 'Guerrero') {
      return '4px solid #28a745'; // Verde para Guerrero
    } else if (['Michoacán', 'México', 'Morelos'].includes(stateName)) {
      return '4px solid #ffc107'; // Amarillo para estados colindantes principales
    } else if (['Puebla', 'Oaxaca'].includes(stateName)) {
      return '4px solid #17a2b8'; // Azul para otros estados colindantes
    }
    return 'none';
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