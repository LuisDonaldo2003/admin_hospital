import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError } from 'rxjs/operators';
import { ArchiveService } from '../service/archive.service';
import { LocationSearchResult, LocationAutocompleteItem, ArchiveFormData, AutoDetectLocationResponse } from '../models/location.interface';

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
  
  // Sistema de auto-detección de localidades
  locationSearchTerm = '';
  detectedLocation: LocationAutocompleteItem | null = null;
  selectedLocation: LocationAutocompleteItem | null = null;
  isDetectingLocation = false;
  detectionConfidence = 0;
  showDetectionResult = false;
  
  // Subject para el debounce de auto-detección
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
      debounceTime(500), // Aumentado para dar tiempo a escribir
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          this.resetLocationDetection();
          return of(null);
        }
        
        this.isDetectingLocation = true;
        this.showDetectionResult = false;
        
        // Usar el nuevo endpoint de auto-detección
        return this.archiveService.autoDetectLocation(term).pipe(
          catchError(err => {
            console.error('Error en detección automática:', err);
            this.isDetectingLocation = false;
            return of(null);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe((response: any) => {
      this.isDetectingLocation = false;
      
      if (response && response.success && response.location) {
        // Detección exitosa
        this.detectedLocation = {
          id: response.location.id,
          name: response.location.name,
          fullDisplayText: response.location.display_text,
          municipality: {
            id: response.location.municipality_id,
            name: response.location.municipality_name
          },
          state: {
            id: response.location.state_id,
            name: response.location.state_name
          }
        };
        
        this.detectionConfidence = response.confidence || 0;
        this.showDetectionResult = true;
        
        // Auto-asignar si la confianza es muy alta (>= 90%)
        if (this.detectionConfidence >= 90) {
          this.acceptDetectedLocation();
        }
      } else {
        // No se encontró coincidencia suficiente
        this.detectedLocation = null;
        this.detectionConfidence = response?.confidence || 0;
        this.showDetectionResult = false;
      }
    });
  }

  private resetLocationDetection(): void {
    this.detectedLocation = null;
    this.detectionConfidence = 0;
    this.showDetectionResult = false;
  }

  acceptDetectedLocation(): void {
    if (this.detectedLocation) {
      this.selectedLocation = this.detectedLocation;
      this.archiveForm.get('location_search')?.setValue(this.detectedLocation.name);
      this.showDetectionResult = false;
    }
  }

  rejectDetectedLocation(): void {
    this.resetLocationDetection();
    // Mantener el texto pero limpiar la detección
  }

  private loadGenders(): void {
    this.archiveService.listGenders().subscribe({
      next: (data: any) => this.genders = data,
      error: (err) => console.error('Error al cargar géneros:', err)
    });
  }

  // Métodos para la nueva detección automática de localidades
  onLocationInputChange(value: string): void {
    this.locationSearchTerm = value;
    
    if (!value || value.length < 2) {
      this.resetLocationDetection();
      this.selectedLocation = null;
      return;
    }

    // Activar detección automática
    this.locationSearchSubject.next(value);
  }

  // Método simplificado para auto-detección - no necesitamos selección manual
  onLocationInputFocus(): void {
    // Ya no mostramos dropdown, solo feedback de detección
  }

  onLocationInputBlur(): void {
    // Si hay una detección exitosa con alta confianza, aplicarla automáticamente
    if (this.detectedLocation && this.detectionConfidence >= 85) {
      this.acceptDetectedLocation();
    }
  }

  // Método simplificado - ya no necesitamos navegación por teclado
  onLocationKeyDown(event: KeyboardEvent): void {
    // Solo manejar Enter para aceptar detección automática
    if (event.key === 'Enter' && this.detectedLocation && this.detectionConfidence >= 75) {
      event.preventDefault();
      this.acceptDetectedLocation();
    }
  }

  clearLocationSelection(): void {
    this.selectedLocation = null;
    this.locationSearchTerm = '';
    this.resetLocationDetection();
    this.archiveForm.get('location_search')?.setValue('');
  }

  // Método trackBy para optimizar el rendimiento (mantenido para compatibilidad)
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