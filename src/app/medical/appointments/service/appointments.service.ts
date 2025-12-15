import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../shared/auth/auth.service';
import { URL_SERVICIOS } from '../../../config/config';

// ===== INTERFACES Y TIPOS =====

export type TipoTurno = 'Matutino' | 'Vespertino' | 'Mixto';
export type EstadoCita = 'Programada' | 'Confirmada' | 'En curso' | 'Completada' | 'Cancelada' | 'No asistió';

export interface Especialidad {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Doctor {
  id?: number;
  nombre_completo: string;
  especialidad_id: number;
  especialidad?: Especialidad;
  general_medical_id?: number;
  turno: TipoTurno;
  hora_inicio_matutino?: string; // Formato: HH:mm
  hora_fin_matutino?: string;
  hora_inicio_vespertino?: string;
  hora_fin_vespertino?: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TimeSlot {
  hora: string; // Formato: HH:mm
  disponible: boolean;
  hora_inicio?: string; // Formato: HH:mm (para retrocompatibilidad)
  hora_fin?: string;
  cita_id?: number;
}

export interface Appointment {
  id?: number;
  folio_expediente: string; // Número de expediente médico
  nombre_paciente: string; // Campo de texto libre
  fecha_nacimiento: string; // Formato: YYYY-MM-DD
  numero_cel: string; // Número de celular
  procedencia: string; // Procedencia u origen
  tipo_cita: 'Primera vez' | 'Subsecuente'; // Tipo de consulta
  turno?: TipoTurno; // Turno seleccionado
  doctor_id: number;
  doctor?: Doctor;
  fecha: string; // Formato: YYYY-MM-DD
  hora_inicio: string; // Formato: HH:mm
  hora_fin: string; // Calculado automáticamente (hora_inicio + 60 min)
  motivo_consulta: string;
  estado: EstadoCita;
  notas?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  total?: number;
  errors?: any;
}

export interface HorariosDisponibles {
  fecha: string;
  doctor_id: number;
  turno: TipoTurno;
  slots: TimeSlot[];
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {

  // Duración de cada cita en minutos
  private readonly DURACION_CITA = 60;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtiene los headers de autorización
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.token
    });
  }

  // =======================================
  // MÉTODOS DE DOCTORES
  // =======================================

  /**
   * Obtener lista de doctores
   */
  listDoctors(params?: any): Observable<ApiResponse<Doctor[]>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/doctors`;
    return this.http.get<ApiResponse<Doctor[]>>(url, { headers, params });
  }

  /**
   * Obtener un doctor por ID
   */
  getDoctor(id: number): Observable<ApiResponse<Doctor>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/doctors/${id}`;
    return this.http.get<ApiResponse<Doctor>>(url, { headers });
  }

  /**
   * Crear nuevo doctor
   */
  storeDoctor(data: Doctor): Observable<ApiResponse<Doctor>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/doctors`;
    return this.http.post<ApiResponse<Doctor>>(url, data, { headers });
  }

  /**
   * Actualizar doctor
   */
  updateDoctor(id: number, data: Doctor): Observable<ApiResponse<Doctor>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/doctors/${id}`;
    return this.http.put<ApiResponse<Doctor>>(url, data, { headers });
  }

  /**
   * Eliminar doctor
   */
  deleteDoctor(id: number): Observable<ApiResponse<any>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/doctors/${id}`;
    return this.http.delete<ApiResponse<any>>(url, { headers });
  }

  /**
   * Obtener doctores por especialidad
   */
  getDoctorsByEspecialidad(especialidadId: number): Observable<ApiResponse<Doctor[]>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/doctors/by-especialidad/${especialidadId}`;
    return this.http.get<ApiResponse<Doctor[]>>(url, { headers });
  }

  // =======================================
  // MÉTODOS DE PACIENTES (ARCHIVOS)
  // =======================================

  /**
   * Obtener lista de pacientes para citas
   */
  listPacientes(): Observable<any> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/archives`;
    return this.http.get<any>(url, { headers });
  }

  // =======================================
  // MÉTODOS DE CITAS
  // =======================================

  /**
   * Obtener lista de citas
   */
  listAppointments(params?: any): Observable<ApiResponse<Appointment[]>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/citas`;
    return this.http.get<ApiResponse<Appointment[]>>(url, { headers, params });
  }

  /**
   * Obtener una cita por ID
   */
  getAppointment(id: number): Observable<ApiResponse<Appointment>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/citas/${id}`;
    return this.http.get<ApiResponse<Appointment>>(url, { headers });
  }

  /**
   * Crear nueva cita
   */
  storeAppointment(data: any): Observable<ApiResponse<Appointment>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/citas`;

    return this.http.post<ApiResponse<Appointment>>(url, data, { headers });
  }

  /**
   * Actualizar cita
   */
  updateAppointment(id: number, data: any): Observable<ApiResponse<Appointment>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/citas/${id}`;

    return this.http.put<ApiResponse<Appointment>>(url, data, { headers });
  }

  /**
   * Cancelar cita
   */
  cancelAppointment(id: number, motivo?: string): Observable<ApiResponse<any>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/citas/${id}/cancel`;
    return this.http.post<ApiResponse<any>>(url, { motivo_cancelacion: motivo }, { headers });
  }

  /**
   * Eliminar cita
   */
  deleteAppointment(id: number): Observable<ApiResponse<any>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/citas/${id}`;
    return this.http.delete<ApiResponse<any>>(url, { headers });
  }

  /**
   * Obtener citas por doctor y fecha
   */
  getAppointmentsByDoctorAndDate(doctorId: number, fecha: string): Observable<ApiResponse<Appointment[]>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/by-doctor-date`;
    const params = { doctor_id: doctorId.toString(), fecha };
    return this.http.get<ApiResponse<Appointment[]>>(url, { headers, params });
  }

  /**
   * Obtener citas por paciente
   */
  getAppointmentsByPaciente(pacienteId: number): Observable<ApiResponse<Appointment[]>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/by-paciente/${pacienteId}`;
    return this.http.get<ApiResponse<Appointment[]>>(url, { headers });
  }

  // =======================================
  // MÉTODOS DE ESPECIALIDADES
  // =======================================

  /**
   * Obtener lista de especialidades
   */
  listEspecialidades(): Observable<ApiResponse<Especialidad[]>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/doctors/especialidades`;
    return this.http.get<ApiResponse<Especialidad[]>>(url, { headers });
  }

  // =======================================
  // LÓGICA DE HORARIOS AUTOMÁTICOS
  // =======================================

  /**
   * Obtener horarios disponibles para un doctor en una fecha específica
   */
  getHorariosDisponibles(doctorId: number, fecha: string): Observable<ApiResponse<HorariosDisponibles>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/horarios-disponibles`;
    const params = { doctor_id: doctorId.toString(), fecha };
    return this.http.get<ApiResponse<HorariosDisponibles>>(url, { headers, params });
  }

  /**
   * Genera slots de tiempo de 1 hora para un turno específico
   * @param horaInicio Hora de inicio del turno (formato HH:mm)
   * @param horaFin Hora de fin del turno (formato HH:mm)
   * @returns Array de TimeSlots
   */
  generarTimeSlots(horaInicio: string, horaFin: string): TimeSlot[] {
    const slots: TimeSlot[] = [];

    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horaFin.split(':').map(Number);

    const inicioMinutos = horaInicioH * 60 + horaInicioM;
    const finMinutos = horaFinH * 60 + horaFinM;

    let currentMinutos = inicioMinutos;

    // Generar slots de 1 hora
    while (currentMinutos + this.DURACION_CITA <= finMinutos) {
      const slotInicio = this.minutosAHora(currentMinutos);
      const slotFin = this.minutosAHora(currentMinutos + this.DURACION_CITA);

      slots.push({
        hora: slotInicio,
        hora_inicio: slotInicio,
        hora_fin: slotFin,
        disponible: true
      });

      currentMinutos += this.DURACION_CITA;
    }

    return slots;
  }

  /**
   * Genera horarios disponibles basados en el turno del doctor
   * @param doctor Doctor con información de turno
   * @param fecha Fecha para la cual generar horarios
   * @param citasExistentes Citas ya programadas para ese doctor y fecha
   */
  generarHorariosDisponiblesParaDoctor(
    doctor: Doctor,
    fecha: string,
    citasExistentes: Appointment[] = []
  ): HorariosDisponibles {
    let slots: TimeSlot[] = [];

    // Generar slots según el turno
    if (doctor.turno === 'Matutino' && doctor.hora_inicio_matutino && doctor.hora_fin_matutino) {
      slots = this.generarTimeSlots(doctor.hora_inicio_matutino, doctor.hora_fin_matutino);
    } else if (doctor.turno === 'Vespertino' && doctor.hora_inicio_vespertino && doctor.hora_fin_vespertino) {
      slots = this.generarTimeSlots(doctor.hora_inicio_vespertino, doctor.hora_fin_vespertino);
    } else if (doctor.turno === 'Mixto') {
      // Turno mixto: combinar matutino y vespertino
      const slotsMatutino = doctor.hora_inicio_matutino && doctor.hora_fin_matutino
        ? this.generarTimeSlots(doctor.hora_inicio_matutino, doctor.hora_fin_matutino)
        : [];
      const slotsVespertino = doctor.hora_inicio_vespertino && doctor.hora_fin_vespertino
        ? this.generarTimeSlots(doctor.hora_inicio_vespertino, doctor.hora_fin_vespertino)
        : [];
      slots = [...slotsMatutino, ...slotsVespertino];
    }

    // Marcar slots ocupados por citas existentes
    citasExistentes.forEach(cita => {
      const slotOcupado = slots.find(slot => slot.hora_inicio === cita.hora_inicio);
      if (slotOcupado) {
        slotOcupado.disponible = false;
        slotOcupado.cita_id = cita.id;
      }
    });

    return {
      fecha,
      doctor_id: doctor.id!,
      turno: doctor.turno,
      slots
    };
  }

  /**
   * Calcula la hora de fin de una cita basándose en la hora de inicio
   * @param horaInicio Hora de inicio (formato HH:mm)
   * @returns Hora de fin (formato HH:mm)
   */
  calcularHoraFin(horaInicio: string): string {
    const [hora, minutos] = horaInicio.split(':').map(Number);
    const inicioMinutos = hora * 60 + minutos;
    const finMinutos = inicioMinutos + this.DURACION_CITA;
    return this.minutosAHora(finMinutos);
  }

  /**
   * Convierte minutos totales a formato HH:mm
   */
  private minutosAHora(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Valida si un horario está disponible
   */
  validarHorarioDisponible(doctorId: number, fecha: string, horaInicio: string): Observable<ApiResponse<boolean>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/validar-horario`;
    const params = { doctor_id: doctorId.toString(), fecha, hora_inicio: horaInicio };
    return this.http.get<ApiResponse<boolean>>(url, { headers, params });
  }

  /**
   * Obtener siguiente horario disponible para un doctor
   */
  getSiguienteHorarioDisponible(doctorId: number, fecha: string): Observable<ApiResponse<TimeSlot | null>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/siguiente-horario`;
    const params = { doctor_id: doctorId.toString(), fecha };
    return this.http.get<ApiResponse<TimeSlot | null>>(url, { headers, params });
  }

  /**
   * Obtener estadísticas de citas
   */
  getEstadisticasCitas(params?: any): Observable<ApiResponse<any>> {
    const headers = this.getHeaders();
    const url = `${URL_SERVICIOS}/appointments/estadisticas`;
    return this.http.get<ApiResponse<any>>(url, { headers, params });
  }
}
