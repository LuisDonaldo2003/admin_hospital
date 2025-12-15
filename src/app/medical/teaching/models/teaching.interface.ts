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
export interface Teaching {
  id?: number;
  correo?: string; // Correo electrónico
  ei?: string; // E.I. - Fecha de inicio (formato: 12/20, 13/20, etc.)
  ef?: string; // E.F. - Fecha final (formato: 20/20, 18/21, etc.)
  profesion: string; // Profesión (DR., EPSS., MIP., LE., etc.)
  nombre: string; // Nombre completo del profesional
  area: string; // Área (MEDICINA, ENFERMERIA, MEDICO INTERNO DE PREGRADO, etc.)
  adscripcion: string; // Adscripción (HOSPITAL GRAL. REG. "DR. GUILLERMO SOBERÓN ACEVEDO")
  nombre_evento: string; // Nombre del evento/programa
  tema?: string; // Tema específico de la sesión
  fecha: string; // Fecha del evento (formato: 01/13/2025)
  horas: string; // Horas del evento (ej: "1 HRA.")
  foja: string; // Número de foja/página
  modalidad_id?: number; // ID de la modalidad
  modalidad?: string; // Nombre de la modalidad (CLASES.MIP, SESION EPSS PRESENCIAL, etc.)
  participacion_id?: number; // ID de la participación
  participacion?: string; // Nombre de la participación (ASESOR, PONENTE, ASISTENTE, etc.)
  created_at?: string;
  updated_at?: string;
}

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
