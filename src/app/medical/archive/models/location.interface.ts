export interface LocationSearchResult {
  id: number;
  name: string;
  display_text: string;
  municipality_id: number;
  municipality_name: string;
  state_id: number;
  state_name: string;
  score?: number;
}

export interface LocationAutocompleteItem {
  id: number;
  name: string;
  fullDisplayText: string;
  municipality: {
    id: number;
    name: string;
  };
  state: {
    id: number;
    name: string;
  };
  // Propiedades adicionales para múltiples opciones
  confidence?: number;
  priorityIndicator?: string;
  municipality_name?: string; // Para compatibilidad con respuesta API
  state_name?: string; // Para compatibilidad con respuesta API
}

// Interfaz para respuesta de detección automática
export interface AutoDetectLocationResponse {
  success: boolean;
  multiple_matches?: boolean; // Indica si hay múltiples opciones
  location?: {
    id: number;
    name: string;
    display_text: string;
    municipality_id: number;
    municipality_name: string;
    state_id: number;
    state_name: string;
  };
  options?: LocationOptionItem[]; // Array de opciones cuando hay múltiples coincidencias
  confidence?: number;
  score?: number;
  message?: string;
  search_term?: string;
  suggestions?: LocationOptionItem[]; // Sugerencias cuando no hay coincidencias exactas
}

// Interfaz para cada opción en caso de múltiples coincidencias
export interface LocationOptionItem {
  id: number;
  name: string;
  display_text: string;
  municipality_id: number;
  municipality_name: string;
  state_id: number;
  state_name: string;
  confidence: number;
  priority_indicator?: string; // Indicador visual para estados prioritarios (⭐)
}

// Interfaz para mapeo inteligente de texto plano (datos legacy)
export interface LocationMappingResponse {
  success: boolean;
  location?: LocationAutocompleteItem;
  action?: 'found' | 'created' | 'suggested';
  originalText?: string;
  normalizedText?: string;
  message?: string;
  suggestions?: LocationSuggestion[];
}

export interface LocationSuggestion {
  id: number;
  name: string;
  display_text: string;
  municipality_id: number;
  municipality_name: string;
  state_id: number;
  state_name: string;
  similarity: number;
}

// Interfaz para el formulario reactivo
export interface ArchiveFormData {
  archive_number: string;
  name: string;
  last_name_father: string;
  last_name_mother: string;
  age: number | null;
  age_unit: string;
  gender_id: string;
  address: string;
  admission_date: string;
  location_text: string;
  municipality_text: string;
  state_text: string;
  contact_last_name_father?: string;
  contact_last_name_mother?: string;
  contact_name?: string;
}
