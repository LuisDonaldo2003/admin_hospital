import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError } from 'rxjs/operators';
import { ArchiveService } from '../service/archive.service';
import { LocationSearchResult, LocationAutocompleteItem, ArchiveFormData } from '../models/location.interface';

@Component({
  selector: 'app-add-archive',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-archive.component.html',
  styleUrls: ['./add-archive.component.scss']
})
export class AddArchiveComponent implements OnInit, OnDestroy {
  // Reactive Form
  archiveForm!: FormGroup;
  
  // Autocomplete para localidades
  locationSearchTerm = '';
  locationSuggestions: LocationAutocompleteItem[] = [];
  showLocationSuggestions = false;
  selectedLocation: LocationAutocompleteItem | null = null;
  isLoadingLocations = false;
  
  // Control de navegación por teclado
  highlightedIndex = -1;
  
  // Subject para el debounce del autocomplete
  private locationSearchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Datos del formulario (mantenemos compatibilidad)
  archive_number = '';
  name = '';
  last_name_father = '';
  last_name_mother = '';
  age: number | null = null;
  gender_id = '';
  address = '';
  admission_date = '';

  genders: any[] = [];

  submitted = false;
  text_validation = '';
  text_success = '';

  constructor(
    private archiveService: ArchiveService,
    private router: Router,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.admission_date = new Date().toISOString().split('T')[0];
    this.loadGenders();
    this.setupLocationAutocomplete();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.archiveForm = this.fb.group({
      archive_number: ['', [Validators.required, Validators.minLength(1)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      last_name_father: ['', [Validators.required, Validators.minLength(2)]],
      last_name_mother: [''],
      age: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      gender_id: ['', Validators.required],
      address: [''],
      admission_date: ['', Validators.required],
      location_search: ['', Validators.required]
    });
  }

  private setupLocationAutocomplete(): void {
    this.locationSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          return of([]);
        }
        this.isLoadingLocations = true;
        return this.archiveService.searchLocationsByName(term).pipe(
          catchError(err => {
            console.error('Error al buscar localidades:', err);
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe((results: any) => {
      this.isLoadingLocations = false;
      this.locationSuggestions = results.map((location: any) => ({
        id: location.id,
        name: location.name,
        fullDisplayText: location.display_text,
        municipality: {
          id: location.municipality_id,
          name: location.municipality_name
        },
        state: {
          id: location.state_id,
          name: location.state_name
        }
      }));
      this.showLocationSuggestions = this.locationSuggestions.length > 0;
      this.highlightedIndex = -1; // Reset highlight
    });
  }

  private loadGenders(): void {
    this.archiveService.listGenders().subscribe({
      next: (data: any) => this.genders = data,
      error: (err) => console.error('Error al cargar géneros:', err)
    });
  }

  // Métodos para el autocomplete de localidades
  onLocationInputChange(value: string): void {
    this.locationSearchTerm = value;
    
    if (!value || value.length < 2) {
      this.locationSuggestions = [];
      this.showLocationSuggestions = false;
      this.selectedLocation = null;
      this.highlightedIndex = -1;
      return;
    }

    this.locationSearchSubject.next(value);
  }

  onLocationSelected(location: LocationAutocompleteItem): void {
    this.selectedLocation = location;
    this.locationSearchTerm = location.name;
    this.showLocationSuggestions = false;
    this.highlightedIndex = -1;
    
    console.log('✅ Localidad seleccionada:', {
      location: location.name,
      municipality: location.municipality.name,
      state: location.state.name
    });
  }

  onLocationInputFocus(): void {
    if (this.locationSuggestions.length > 0) {
      this.showLocationSuggestions = true;
    }
  }

  onLocationInputBlur(): void {
    // Delay para permitir click en sugerencias
    setTimeout(() => {
      this.showLocationSuggestions = false;
      this.highlightedIndex = -1;
    }, 200);
  }

  // Navegación por teclado
  onLocationKeyDown(event: KeyboardEvent): void {
    if (!this.showLocationSuggestions || this.locationSuggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.locationSuggestions.length - 1);
        this.scrollToHighlighted();
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        this.scrollToHighlighted();
        break;
      
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.locationSuggestions.length) {
          this.onLocationSelected(this.locationSuggestions[this.highlightedIndex]);
        }
        break;
      
      case 'Escape':
        this.showLocationSuggestions = false;
        this.highlightedIndex = -1;
        break;
    }
  }

  private scrollToHighlighted(): void {
    if (this.highlightedIndex >= 0) {
      const container = document.querySelector('.location-suggestions-container');
      const item = document.querySelector(`.location-suggestion:nth-child(${this.highlightedIndex + 1})`);
      if (container && item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  clearLocationSelection(): void {
    this.selectedLocation = null;
    this.locationSearchTerm = '';
    this.locationSuggestions = [];
    this.showLocationSuggestions = false;
    this.highlightedIndex = -1;
  }

  // Método trackBy para optimizar el rendimiento
  trackByLocationId(index: number, location: LocationAutocompleteItem): number {
    return location.id;
  }

  // Validación mejorada
  private validateForm(): string[] {
    const missingFields: string[] = [];

    if (!this.archive_number.trim()) missingFields.push(this.translate.instant('ARCHIVE_NUMBER'));
    if (!this.name.trim()) missingFields.push(this.translate.instant('FIRST_NAME'));
    if (!this.last_name_father.trim()) missingFields.push(this.translate.instant('FATHER_LAST_NAME'));
    if (!this.age || this.age <= 0) missingFields.push(this.translate.instant('AGE'));
    if (!this.gender_id) missingFields.push(this.translate.instant('GENDER'));
    if (!this.admission_date) missingFields.push(this.translate.instant('ADMISSION_DATE'));
    if (!this.locationSearchTerm.trim()) missingFields.push(this.translate.instant('LOCATION'));

    return missingFields;
  }

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
      gender_id: this.gender_id,
      address: this.address.trim(),
      admission_date: this.admission_date
    };

    // Si se seleccionó una localidad del autocomplete, usar su ID
    if (this.selectedLocation) {
      formData.location_id = this.selectedLocation.id;
    } else {
      // Si es texto libre, enviar el nombre de la localidad para que el backend la procese
      formData.location_name = this.locationSearchTerm.trim();
    }

    this.archiveService.registerArchive(formData).subscribe({
      next: (response) => {
        this.text_success = this.translate.instant('ARCHIVE_REGISTERED_SUCCESS');
        console.log('✅ Registro exitoso:', response);
        
        // Reset form
        this.resetForm();
        
        setTimeout(() => {
          this.router.navigate(['/archives/list_archive']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Error al registrar archivo:', err);
        this.text_validation = err.error?.message || this.translate.instant('ERROR_OCCURRED');
      }
    });
  }

  private resetForm(): void {
    this.archive_number = '';
    this.name = '';
    this.last_name_father = '';
    this.last_name_mother = '';
    this.age = null;
    this.gender_id = '';
    this.address = '';
    this.admission_date = new Date().toISOString().split('T')[0];
    this.clearLocationSelection();
    this.submitted = false;
  }

  // Método para obtener el texto de localidad a mostrar
  getLocationDisplayText(): string {
    if (this.selectedLocation) {
      return `${this.selectedLocation.name} - ${this.selectedLocation.municipality.name}, ${this.selectedLocation.state.name}`;
    }
    return this.locationSearchTerm;
  }
}