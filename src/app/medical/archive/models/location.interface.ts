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
}

// Interfaz para respuesta de detección automática
export interface AutoDetectLocationResponse {
  success: boolean;
  location?: {
    id: number;
    name: string;
    display_text: string;
    municipality_id: number;
    municipality_name: string;
    state_id: number;
    state_name: string;
  };
  confidence?: number;
  score?: number;
  message?: string;
}

// Interfaz para el formulario reactivo
export interface ArchiveFormData {
  archive_number: string;
  name: string;
  last_name_father: string;
  last_name_mother: string;
  age: number | null;
  gender_id: string;
  address: string;
  admission_date: string;
  location_id?: number;
  location_name?: string;
}
