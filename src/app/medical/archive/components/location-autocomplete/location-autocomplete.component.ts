import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError } from 'rxjs/operators';
import { LocationAutocompleteItem } from '../../models/location.interface';
import { LocationAutocompleteService } from '../../service/location-autocomplete.service';

@Component({
  selector: 'app-location-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  // Componente de autocompletado para localidades. Permite buscar, seleccionar y usar texto libre.
  template: `
    <div class="position-relative">
      <!-- Input principal -->
      <input 
        #inputElement
        type="text" 
        class="form-control" 
        [(ngModel)]="searchTerm" 
        [placeholder]="placeholder"
        (input)="onInputChange($event)"
        (focus)="onInputFocus()"
        (blur)="onInputBlur()"
        (keydown)="onKeyDown($event)"
        [disabled]="disabled"
        [class.is-invalid]="showError"
        autocomplete="off" />
      
      <!-- Indicador de carga -->
      <div *ngIf="isLoading" class="position-absolute top-50 end-0 translate-middle-y me-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">{{ 'LOADING' | translate }}</span>
        </div>
      </div>

      <!-- Dropdown de sugerencias -->
      <div *ngIf="showSuggestions" 
           class="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm"
           style="max-height: 250px; overflow-y: auto; top: 100%; z-index: 1050;">
        
        <!-- Historial de búsquedas -->
        <div *ngIf="showHistory && searchHistory.length > 0 && !searchTerm" class="border-bottom">
          <div class="px-3 py-2 bg-light">
            <small class="text-muted fw-semibold">
              <i class="fa fa-history me-1"></i>
              {{ 'SEARCH_HISTORY' | translate }}
            </small>
          </div>
          <div *ngFor="let historyItem of searchHistory; let i = index"
               class="px-3 py-2 border-bottom location-suggestion"
               [class.bg-light]="i === highlightedIndex"
               style="cursor: pointer;"
               (mouseenter)="highlightedIndex = i"
               (mouseleave)="highlightedIndex = -1"
               (click)="selectFromHistory(historyItem)">
            <div class="d-flex align-items-center">
              <i class="fa fa-clock-o text-muted me-2"></i>
              <span>{{ historyItem }}</span>
            </div>
          </div>
        </div>
        
        <!-- Sugerencias de localidades -->
        <div *ngFor="let location of suggestions; let i = index; trackBy: trackByLocationId"
             class="px-3 py-2 border-bottom location-suggestion"
             [class.bg-light]="i === highlightedIndex"
             style="cursor: pointer; transition: background-color 0.2s ease;"
             (mouseenter)="highlightedIndex = i"
             (mouseleave)="highlightedIndex = -1"
             (click)="selectLocation(location)">
          <div class="fw-semibold text-primary">{{ location.name }}</div>
          <small class="text-muted">{{ location.municipality.name }}, {{ location.state.name }}</small>
        </div>
        
        <!-- Mensaje cuando no hay resultados -->
        <div *ngIf="suggestions.length === 0 && !isLoading && searchTerm.length >= 2"
             class="px-3 py-3 text-muted text-center">
          <div class="d-flex align-items-center justify-content-center">
            <i class="fa fa-info-circle me-2"></i>
            <small>
              {{ 'NO_LOCATIONS_FOUND' | translate }}: "<strong>{{ searchTerm }}</strong>".
              <br>{{ 'CAN_USE_AS_FREE_TEXT' | translate }}
            </small>
          </div>
        </div>
        
        <!-- Ayuda de navegación -->
        <div *ngIf="suggestions.length > 0" 
             class="px-3 py-2 bg-light border-top">
          <small class="text-muted">
            <i class="fa fa-keyboard-o me-1"></i>
            {{ 'KEYBOARD_NAVIGATION_HELP' | translate }}
          </small>
        </div>
      </div>

      <!-- Información de localidad seleccionada -->
      <div *ngIf="selectedLocation" class="mt-2">
        <div class="alert alert-success d-flex justify-content-between align-items-center py-2 mb-0">
          <div class="d-flex align-items-center">
            <i class="fa fa-check-circle text-success me-2"></i>
            <div>
              <strong>{{ selectedLocation.name }}</strong>
              <br>
              <small class="text-muted">
                <i class="fa fa-map-marker me-1"></i>
                {{ selectedLocation.municipality.name }}, {{ selectedLocation.state.name }}
              </small>
            </div>
          </div>
          <button type="button" 
                  class="btn btn-sm btn-outline-secondary" 
                  (click)="clearSelection()"
                  [title]="'CLEAR_SELECTION' | translate">
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Información adicional para texto libre -->
      <div *ngIf="!selectedLocation && searchTerm.trim() && searchTerm.length >= 2 && !showSuggestions && !isLoading" 
           class="mt-2">
        <div class="alert alert-info d-flex align-items-center py-2 mb-0">
          <i class="fa fa-info-circle me-2"></i>
          <small>
            {{ 'WILL_USE_AS_FREE_TEXT' | translate }}: "<strong>{{ searchTerm }}</strong>".
            {{ 'MUNICIPALITY_STATE_AUTO_ASSIGNED' | translate }}
          </small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .location-suggestion {
      transition: background-color 0.2s ease;
    }
    .location-suggestion:hover {
      background-color: #f8f9fa !important;
    }
    .location-suggestion:last-child {
      border-bottom: none !important;
    }
    .location-suggestion.bg-light {
      background-color: #e3f2fd !important;
      border-left: 3px solid #007bff;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocationAutocompleteComponent),
      multi: true
    }
  ]
})
export class LocationAutocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /** Placeholder para el input principal. */
  @Input() placeholder = 'Escriba el nombre de la localidad...';
  /** Deshabilita el input si es true. */
  @Input() disabled = false;
  /** Muestra el estado de error visual. */
  @Input() showError = false;
  /** Muestra el historial de búsqueda si es true. */
  @Input() showHistory = true;
  /** Tiempo de espera para el debounce de búsqueda. */
  @Input() debounceTime = 300;
  /** Mínimo de caracteres para activar la búsqueda. */
  @Input() minLength = 2;
  /** Máximo de sugerencias a mostrar. */
  @Input() maxSuggestions = 20;

  /** Evento emitido cuando se selecciona una localidad. */
  @Output() locationSelected = new EventEmitter<LocationAutocompleteItem>();
  /** Evento emitido cuando se limpia la selección. */
  @Output() locationCleared = new EventEmitter<void>();
  /** Evento emitido cuando se ingresa texto libre. */
  @Output() freeTextEntered = new EventEmitter<string>();

  /** Referencia al input principal. */
  @ViewChild('inputElement') inputElement!: ElementRef;

  /** Término de búsqueda actual. */
  searchTerm = '';
  /** Sugerencias de localidades obtenidas. */
  suggestions: LocationAutocompleteItem[] = [];
  /** Controla la visibilidad del dropdown de sugerencias. */
  showSuggestions = false;
  /** Localidad seleccionada actualmente. */
  selectedLocation: LocationAutocompleteItem | null = null;
  /** Indica si está cargando sugerencias. */
  isLoading = false;
  /** Índice resaltado en el dropdown. */
  highlightedIndex = -1;
  /** Historial de términos de búsqueda previos. */
  searchHistory: string[] = [];

  /** Subject para manejar el flujo de búsqueda reactiva. */
  private searchSubject = new Subject<string>();
  /** Subject para destruir suscripciones al destruir el componente. */
  private destroy$ = new Subject<void>();

  // ControlValueAccessor
  /** Función para notificar cambios de valor. */
  private onChange = (value: any) => {};
  /** Función para notificar que el input fue tocado. */
  private onTouched = () => {};

  /**
   * Inyección de servicios para búsqueda y traducción.
   */
  constructor(
    private locationService: LocationAutocompleteService,
    private translate: TranslateService
  ) {}

  /** Inicializa la búsqueda reactiva y carga el historial al montar el componente. */
  ngOnInit(): void {
    this.setupSearch();
    this.loadSearchHistory();
  }

  /** Limpia las suscripciones al destruir el componente. */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Configura el flujo reactivo para buscar localidades con debounce y actualiza sugerencias. */
  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < this.minLength) {
          return Promise.resolve([]);
        }
        this.isLoading = true;
        return this.locationService.searchLocations(term);
      }),
      takeUntil(this.destroy$)
    ).subscribe((results: any) => {
      this.isLoading = false;
      this.suggestions = Array.isArray(results) ? results.slice(0, this.maxSuggestions) : [];
      this.showSuggestions = this.suggestions.length > 0 || this.searchTerm.length >= this.minLength;
      this.highlightedIndex = -1;
    });
  }

  /** Suscribe al historial de búsqueda desde el servicio. */
  private loadSearchHistory(): void {
    this.locationService.searchHistory$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(history => {
      this.searchHistory = history;
    });
  }

  /** Maneja el cambio de valor en el input principal y dispara la búsqueda reactiva. */
  onInputChange(event: any): void {
    const value = event.target.value;
    this.searchTerm = value;

    if (!value || value.length < this.minLength) {
      this.suggestions = [];
      this.showSuggestions = this.showHistory && this.searchHistory.length > 0 && !value;
      this.selectedLocation = null;
      this.highlightedIndex = -1;
      this.updateValue();
      return;
    }

    this.searchSubject.next(value);
    this.updateValue();
  }

  /** Muestra el dropdown de sugerencias al enfocar el input si hay datos. */
  onInputFocus(): void {
    if (this.suggestions.length > 0 || (this.showHistory && this.searchHistory.length > 0 && !this.searchTerm)) {
      this.showSuggestions = true;
    }
  }

  /** Oculta el dropdown de sugerencias al perder el foco. */
  onInputBlur(): void {
    setTimeout(() => {
      this.showSuggestions = false;
      this.highlightedIndex = -1;
      this.onTouched();
    }, 200);
  }

  /** Maneja la navegación por teclado en el dropdown de sugerencias e historial. */
  onKeyDown(event: KeyboardEvent): void {
    const totalItems = this.suggestions.length + (this.showHistory && !this.searchTerm ? this.searchHistory.length : 0);

    if (!this.showSuggestions || totalItems === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, totalItems - 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        break;

      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0) {
          if (!this.searchTerm && this.highlightedIndex < this.searchHistory.length) {
            // Seleccionar del historial
            this.selectFromHistory(this.searchHistory[this.highlightedIndex]);
          } else {
            // Seleccionar de sugerencias
            const suggestionIndex = this.searchTerm ? this.highlightedIndex : this.highlightedIndex - this.searchHistory.length;
            if (suggestionIndex >= 0 && suggestionIndex < this.suggestions.length) {
              this.selectLocation(this.suggestions[suggestionIndex]);
            }
          }
        }
        break;

      case 'Escape':
        this.showSuggestions = false;
        this.highlightedIndex = -1;
        this.inputElement.nativeElement.blur();
        break;
    }
  }

  /** Selecciona una localidad de las sugerencias y emite el evento correspondiente. */
  selectLocation(location: LocationAutocompleteItem): void {
    this.selectedLocation = location;
    this.searchTerm = location.name;
    this.showSuggestions = false;
    this.highlightedIndex = -1;

    this.locationSelected.emit(location);
    this.updateValue();
  }

  /** Selecciona un término del historial y dispara la búsqueda. */
  selectFromHistory(historyItem: string): void {
    this.searchTerm = historyItem;
    this.searchSubject.next(historyItem);
    this.inputElement.nativeElement.focus();
  }

  /** Limpia la selección actual y emite el evento correspondiente. */
  clearSelection(): void {
    this.selectedLocation = null;
    this.searchTerm = '';
    this.suggestions = [];
    this.showSuggestions = false;
    this.highlightedIndex = -1;

    this.locationCleared.emit();
    this.updateValue();
    this.inputElement.nativeElement.focus();
  }

  /** TrackBy para optimizar el renderizado de sugerencias. */
  trackByLocationId(index: number, location: LocationAutocompleteItem): number {
    return location.id;
  }

  /** Actualiza el valor del formulario reactivo y emite eventos según el tipo de entrada. */
  private updateValue(): void {
    if (this.selectedLocation) {
      this.onChange({
        type: 'selected',
        location: this.selectedLocation
      });
    } else if (this.searchTerm.trim()) {
      this.onChange({
        type: 'freeText',
        text: this.searchTerm.trim()
      });
      this.freeTextEntered.emit(this.searchTerm.trim());
    } else {
      this.onChange(null);
    }
  }

  // Implementación de ControlValueAccessor para formularios reactivos
  /** Escribe el valor externo en el input y la selección. */
  writeValue(value: any): void {
    if (value) {
      if (value.type === 'selected' && value.location) {
        this.selectedLocation = value.location;
        this.searchTerm = value.location.name;
      } else if (value.type === 'freeText' && value.text) {
        this.searchTerm = value.text;
        this.selectedLocation = null;
      }
    } else {
      this.searchTerm = '';
      this.selectedLocation = null;
    }
  }

  /** Registra la función de cambio para el formulario reactivo. */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** Registra la función de touch para el formulario reactivo. */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /** Establece el estado de deshabilitado en el input. */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
