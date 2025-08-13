// Importaciones necesarias para el servicio de autocompletado de localidades
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../../shared/auth/auth.service';
import { 
  LocationSearchResult, 
  LocationAutocompleteItem, 
  LocationMappingResponse,
  LocationSuggestion 
} from '../models/location.interface';
import { URL_SERVICIOS } from '../../../config/config';

@Injectable({
  providedIn: 'root'
})
export class LocationAutocompleteService {
  // Cache para localidades frecuentemente buscadas
  private locationCache = new Map<string, LocationAutocompleteItem[]>();
  // Tamaño máximo del cache
  private readonly CACHE_SIZE = 50;
  // Tiempo de expiración del cache (no implementado en este ejemplo)
  private readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

  // Subject para el historial de búsquedas
  private searchHistorySubject = new BehaviorSubject<string[]>([]);
  // Observable público para el historial de búsquedas
  public searchHistory$ = this.searchHistorySubject.asObservable();

  /**
   * Constructor: inyecta HttpClient y AuthService, carga historial de búsquedas
   */
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadSearchHistory();
  }

  /**
   * Obtiene los headers de autorización para las peticiones HTTP
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  /**
   * Busca localidades por nombre con cache y debounce
   */
  searchLocations(searchTerm: string): Observable<LocationAutocompleteItem[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return of([]);
    }
    const normalizedTerm = this.normalizeSearchTerm(searchTerm);
    // Verificar cache primero
    const cached = this.getCachedResult(normalizedTerm);
    if (cached) {
      return of(cached);
    }
    // Hacer petición HTTP
    const URL = `${URL_SERVICIOS}/locations/search?search=${encodeURIComponent(searchTerm)}`;
    return this.http.get(URL, { headers: this.getHeaders() })
      .pipe(
        map((results: any) => {
          const mappedResults: LocationAutocompleteItem[] = results.map((location: any) => ({
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
          // Guardar en cache
          this.setCachedResult(normalizedTerm, mappedResults);
          // Agregar al historial
          this.addToSearchHistory(searchTerm);
          return mappedResults;
        }),
        catchError(() => {
          return of([]);
        })
      );
  }

  /**
   * Obtiene sugerencias rápidas basadas en el historial
   */
  getQuickSuggestions(): string[] {
    return this.searchHistorySubject.value.slice(0, 5);
  }

  /**
   * Normaliza término de búsqueda para evitar duplicados y mejorar cache
   */
  private normalizeSearchTerm(term: string): string {
    return term.toLowerCase().trim()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n');
  }

  /**
   * Obtiene el resultado cacheado para un término de búsqueda
   */
  private getCachedResult(term: string): LocationAutocompleteItem[] | null {
    const cached = this.locationCache.get(term);
    return cached || null;
  }

  /**
   * Guarda el resultado en el cache, eliminando el más antiguo si se excede el tamaño
   */
  private setCachedResult(term: string, results: LocationAutocompleteItem[]): void {
    if (this.locationCache.size >= this.CACHE_SIZE) {
      const firstKey = this.locationCache.keys().next().value;
      if (firstKey) {
        this.locationCache.delete(firstKey);
      }
    }
    this.locationCache.set(term, results);
  }

  /**
   * Agrega un término al historial de búsquedas, evitando duplicados
   */
  private addToSearchHistory(term: string): void {
    const current = this.searchHistorySubject.value;
    const normalized = this.normalizeSearchTerm(term);
    const filtered = current.filter(item => 
      this.normalizeSearchTerm(item) !== normalized
    );
    const newHistory = [term, ...filtered].slice(0, 10);
    this.searchHistorySubject.next(newHistory);
    this.saveSearchHistory(newHistory);
  }

  /**
   * Carga el historial de búsquedas desde localStorage
   */
  private loadSearchHistory(): void {
    try {
      const stored = localStorage.getItem('location_search_history');
      if (stored) {
        const history = JSON.parse(stored);
        this.searchHistorySubject.next(history);
      }
    } catch {
      // ...log eliminado...
    }
  }

  /**
   * Guarda el historial de búsquedas en localStorage
   */
  private saveSearchHistory(history: string[]): void {
    try {
      localStorage.setItem('location_search_history', JSON.stringify(history));
    } catch {
    }
  }

  /**
   * Limpia el historial de búsquedas
   */
  clearSearchHistory(): void {
    this.searchHistorySubject.next([]);
    localStorage.removeItem('location_search_history');
  }

  /**
   * Limpia el cache de localidades
   */
  clearCache(): void {
    this.locationCache.clear();
  }

  /**
   * Valida que una localidad seleccionada tenga todos los datos requeridos
   */
  validateLocation(location: LocationAutocompleteItem): boolean {
    return !!(
      location &&
      location.id &&
      location.name &&
      location.municipality?.id &&
      location.municipality?.name &&
      location.state?.id &&
      location.state?.name
    );
  }

  /**
   * Obtiene información detallada de una localidad por ID
   */
  getLocationById(locationId: number): Observable<LocationAutocompleteItem | null> {
    const URL = `${URL_SERVICIOS}/locations/${locationId}`;
    return this.http.get(URL, { headers: this.getHeaders() })
      .pipe(
        map((response: any) => {
          if (response && response.location) {
            const location = response.location;
            return {
              id: location.id,
              name: location.name,
              fullDisplayText: `${location.name} - ${location.municipality.name}, ${location.municipality.state.name}`,
              municipality: {
                id: location.municipality.id,
                name: location.municipality.name
              },
              state: {
                id: location.municipality.state.id,
                name: location.municipality.state.name
              }
            };
          }
          return null;
        }),
        catchError(() => {
          // ...log eliminado...
          return of(null);
        })
      );
  }

  /**
   * Mapeo inteligente para texto plano de localidades (datos legacy)
   * Maneja variaciones como "jario pantoja" -> "jario y pantoja"
   */
  findOrCreateLocationFromText(locationText: string, municipalityText?: string, stateText?: string): Observable<LocationMappingResponse> {
    const URL = `${URL_SERVICIOS}/locations/find-or-create`;
    const body = {
      location_text: locationText,
      municipality_text: municipalityText || '',
      state_text: stateText || ''
    };
    return this.http.post(URL, body, { headers: this.getHeaders() })
      .pipe(
        map((response: any) => {
          if (response.success && response.location) {
            // Convertir a formato LocationAutocompleteItem
            const location = response.location;
            return {
              success: true,
              location: {
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
              },
              action: response.action,
              originalText: response.original_text,
              normalizedText: response.normalized_text
            } as LocationMappingResponse;
          } else {
            return {
              success: false,
              message: response.message,
              suggestions: response.suggestions || [],
              originalText: response.original_text,
              normalizedText: response.normalized_text
            } as LocationMappingResponse;
          }
        }),
        catchError(() => {
          return of({
            success: false,
            message: 'Error al procesar la localidad',
            suggestions: [],
            originalText: locationText,
            normalizedText: locationText
          } as LocationMappingResponse);
        })
      );
  }

  /**
   * Procesa texto de localidad legacy y devuelve la mejor coincidencia
   * Útil para migración de datos o entrada manual
   */
  processLegacyLocationText(locationText: string): Observable<LocationAutocompleteItem | null> {
    return this.findOrCreateLocationFromText(locationText).pipe(
      map(result => {
        if (result.success && result.location) {
          return result.location;
        }
        // Si no se encontró pero hay sugerencias, tomar la primera
        if (result.suggestions && result.suggestions.length > 0) {
          const suggestion = result.suggestions[0];
          return {
            id: suggestion.id,
            name: suggestion.name,
            fullDisplayText: suggestion.display_text,
            municipality: {
              id: suggestion.municipality_id || 0,
              name: suggestion.municipality_name || ''
            },
            state: {
              id: suggestion.state_id || 0,
              name: suggestion.state_name || ''
            }
          };
        }
        return null;
      }),
      catchError(() => {
       
        return of(null);
      })
    );
  }
}
