import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppointmentsService, Doctor, TipoTurno } from '../../service/appointments.service';
import { AppointmentServicesService } from '../../service/appointment-services.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { StaffService } from '../../../staff/service/staff.service';

@Component({
  selector: 'app-edit-doctor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './edit-doctor.component.html',
  styleUrls: ['./edit-doctor.component.scss']
})
export class EditDoctorComponent implements OnInit {

  @Input() isEditMode: boolean = true;
  doctorId: number | null = null;

  // Propiedades del formulario simplificado
  nombre_completo: string = '';
  appointment_service_id: number = 0;
  user_id: number | null = null;
  turno: TipoTurno = 'Matutino';

  // Horarios
  hora_inicio_matutino: string = '08:00';
  hora_fin_matutino: string = '14:00';
  hora_inicio_vespertino: string = '14:00';
  hora_fin_vespertino: string = '20:00';

  // Control del formulario
  submitted = false;
  loading = false;

  // Listas
  services: any[] = [];
  users: any[] = [];
  turnosDisponibles: any[] = [
    { value: 'Matutino', label: 'Matutino' },
    { value: 'Vespertino', label: 'Vespertino' },
    { value: 'Mixto', label: 'Jornada Acumulada' }
  ];

  // Mensajes
  text_success: string = '';
  text_validation: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private appointmentsService: AppointmentsService,
    private appointmentServicesService: AppointmentServicesService,
    private staffService: StaffService,
    public authService: AuthService
  ) {
    const selectedLang = localStorage.getItem('language') || 'es';
    this.translate.use(selectedLang);
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadUsers();

    // Detectar si estamos en modo edición por la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.doctorId = +params['id'];
        this.loadDoctorData(this.doctorId);
      }
    });
  }

  loadServices(): void {
    // Cargar solo servicios accesibles para el usuario actual
    this.appointmentServicesService.listAccessible().subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.services = resp.data.filter((s: any) => s.activo);
        }
      },
      error: (error) => {
        console.error('Error loading services:', error);
      }
    });
  }

  loadDoctorData(id: number): void {
    this.loading = true;
    this.appointmentsService.getDoctor(id).subscribe({
      next: (response: any) => {
        const doctor = response.data;
        this.nombre_completo = doctor.nombre_completo;
        this.appointment_service_id = doctor.appointment_service_id || 0;

        this.appointment_service_id = doctor.appointment_service_id || 0;
        this.user_id = doctor.user_id || null;

        // Fallback para legacy
        if (!this.appointment_service_id) {
          if (doctor.especialidad_id) this.appointment_service_id = doctor.especialidad_id; // Asumiendo migración ID
          // No podemos asignar id general_medical directamente, user debe reasignar
        }

        this.turno = doctor.turno;
        this.hora_inicio_matutino = doctor.hora_inicio_matutino || '08:00';
        this.hora_fin_matutino = doctor.hora_fin_matutino || '14:00';
        this.hora_inicio_vespertino = doctor.hora_inicio_vespertino || '14:00';
        this.hora_fin_vespertino = doctor.hora_fin_vespertino || '20:00';
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading doctor:', error);
        this.loading = false;
      }
    });
  }

  onTurnoChange(): void {
    // Resetear horas según el turno si es necesario
    if (this.turno === 'Matutino') {
      this.hora_inicio_matutino = '08:00';
      this.hora_fin_matutino = '14:00';
    } else if (this.turno === 'Vespertino') {
      this.hora_inicio_vespertino = '14:00';
      this.hora_fin_vespertino = '20:00';
    }
  }

  validateForm(): boolean {
    if (!this.nombre_completo.trim()) return false;
    if (!this.appointment_service_id || this.appointment_service_id === 0) return false;
    if (!this.turno) return false;

    if (this.turno === 'Matutino' || this.turno === 'Mixto') {
      if (!this.hora_inicio_matutino || !this.hora_fin_matutino) return false;
    }

    if (this.turno === 'Vespertino' || this.turno === 'Mixto') {
      if (!this.hora_inicio_vespertino || !this.hora_fin_vespertino) return false;
    }

    return true;
  }

  private formatTimeToHi(time: string): string {
    if (!time) return '';
    if (time.length === 5 && time.match(/^\d{2}:\d{2}$/)) return time;
    return time.substring(0, 5);
  }

  save(): void {
    this.submitted = true;
    this.text_validation = '';
    this.text_success = '';

    if (!this.validateForm()) {
      this.text_validation = this.translate.instant('COMMON.FILL_REQUIRED_FIELDS');
      return;
    }

    this.loading = true;

    const doctorData: any = {
      nombre_completo: this.nombre_completo,
      appointment_service_id: this.appointment_service_id,
      user_id: this.user_id,
      turno: this.turno,
      hora_inicio_matutino: this.formatTimeToHi(this.hora_inicio_matutino),
      hora_fin_matutino: this.formatTimeToHi(this.hora_fin_matutino),
      hora_inicio_vespertino: this.formatTimeToHi(this.hora_inicio_vespertino),
      hora_fin_vespertino: this.formatTimeToHi(this.hora_fin_vespertino),
      // activo: true // No se cambia aquí, se asume
    };

    const updateObservable = this.appointmentsService.updateDoctor(this.doctorId!, doctorData);

    updateObservable.subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.text_success = this.translate.instant('COMMON.SUCCESS_UPDATE');
          setTimeout(() => {
            this.goToList();
          }, 1500);
        } else {
          this.text_validation = response.message || this.translate.instant('COMMON.ERROR_OCCURRED');
        }
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error updating doctor:', error);

        let errorMessage = error.error?.message || this.translate.instant('COMMON.ERROR_OCCURRED');

        // Mostrar detalles de validación si existen
        if (error.error?.errors) {
          const validationErrors = Object.values(error.error.errors).flat().join('. ');
          errorMessage = `${errorMessage}: ${validationErrors}`;
        }

        this.text_validation = errorMessage;
      }
    });
  }

  goToList(): void {
    this.router.navigate(['/appointments/list_doctor']);
  }

  onNameKeyPress(event: any): void {
    // Validaciones opcionales
  }

  loadUsers(): void {
    this.staffService.listUsers().subscribe({
      next: (resp: any) => {
        if (resp.users && resp.users.data) {
          this.users = resp.users.data;
        } else if (resp.users) {
          this.users = resp.users;
        } else if (Array.isArray(resp)) {
          this.users = resp;
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }
}
