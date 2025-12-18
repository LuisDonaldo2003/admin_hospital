/**
 * Interfaz para el catálogo de Modalidades de enseñanza
 * Basado en la hoja "LISTA DESPEGABLE" del Excel
 */
export interface Modalidad {
  id?: number;
  codigo: string;
  nombre: string;
  activo?: boolean;
}

/**
 * Interfaz para el catálogo de Tipos de Participación
 * Basado en la hoja "LISTA DESPEGABLE" del Excel
 */
export interface Participacion {
  id?: number;
  nombre: string;
  activo?: boolean;
}

/**
 * Interfaz principal para los registros de Enseñanza
 * Basado en la hoja "LIBRO10" del Excel y CSV
 */
export interface TeachingEvent {
  id?: number;
  teaching_assistant_id?: number;
  nombre_evento: string;
  tema?: string;
  fecha: string;
  horas: string;
  foja: string;
  modalidad_id?: number;
  // Optional expanded fields
  modalidad?: string;
  participacion_id?: number;
  participacion?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeachingAssistant {
  id?: number;
  nombre: string;
  profesion?: string;
  area?: string;
  adscripcion?: string;
  correo?: string;
  ei?: string;
  ef?: string;
  events?: TeachingEvent[];
  events_count?: number;
  created_at?: string;
  updated_at?: string;

  // Legacy compatibility / Flattened accessors (optional, might not need them if we refactor components)
}

// Alias for compatibility if needed, but better to update components
export type Teaching = TeachingAssistant;

/**
 * Interfaz para el seguimiento de evaluaciones pendientes
 * Basado en la hoja "Hoja3" del Excel
 */
export interface Evaluacion {
  id?: number;
  teaching_id?: number; // Relación con el registro de enseñanza
  fecha_inicio?: string; // Fecha de inicio (columna A)
  fecha_limite?: string; // Fecha límite (columna B)
  especialidad: string; // Especialidad (columna C)
  nombre: string; // Nombre del profesional (columna D)
  estado: string; // Estado: "PENDIENTE", "APROBADO", "REPROBADO"
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interfaz para respuestas de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

/**
 * Interfaz para respuestas paginadas
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

/**
 * Interfaz para estadísticas del módulo
 */
export interface TeachingStats {
  total: number;
  por_modalidad: { [key: string]: number };
  por_participacion: { [key: string]: number };
  total_horas: number;
  evaluaciones_pendientes: number;
}

/**
 * Interfaz para estadísticas de evaluaciones
 */
export interface EvaluacionStats {
  total: number;
  pendientes: number;
  aprobadas: number;
  reprobadas: number;
}

/**
 * Interfaz para filtros de búsqueda
 */
export interface TeachingFilters {
  search?: string;
  especialidad?: string;
  area?: string;
  modalidad_id?: number;
  participacion_id?: number;
  nombre_evento?: string;
  sort_direction?: 'asc' | 'desc';
}
